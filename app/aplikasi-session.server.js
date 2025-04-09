/* eslint-disable no-unreachable */
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import axios from "axios";
import { findOne } from "~/odoo.request.server";
import jwt from 'jsonwebtoken';
import odoo_db from "~/db.odoo.server";
import { list_module_aplikasi as aplikasi } from "~/aplikasi-list.server";


invariant(process.env.APLIKASI_SESSION_SECRET, "SESSION_SECRET must be set");

class CustomAplikasiError extends Error {
  constructor(code, message) {
      super(message);
      this.code = code;
  }
}


export const list_module_aplikasi = aplikasi



/**
 * 
 * periksa aplikasi internal jika departement id ada yang sama
 * atau pathname ada yang sama 
 * maka throw Error
 */
export async function validateInternalList( app_name ) {
  const departementIds = new Set();
  const pathnames = new Set();
  const _list_app = list_module_aplikasi();
  for (const item of _list_app.internal) {
    if (item?.departement_id !== null) {
      if (departementIds.has(item.departement_id)) {
        throw new CustomAplikasiError(`ERR_LOGIN_001`,`Duplicate departement_id found: ${item?.departement_id}`);
      }
      departementIds.add(item?.departement_id);
    }
    if (pathnames.has(item?.pathname)) {
      throw new CustomAplikasiError(`ERR_LOGIN_002`,`Duplicate pathname found: ${item?.pathname}`);
    }
    pathnames.add(item?.pathname);
  }
  const target_app = _list_app.internal.find((item) => item.pathname === app_name);
  if(!target_app?.departement_id){
    throw new CustomAplikasiError(`ERR_LOGIN_003`,`Department ID is Null: ${app_name}`);
  }
  return target_app;
}






export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'aplikasi',
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.APLIKASI_SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});




export const ODOO_SESSION_ID = "ODOO_SESSION_ID";
export const ODOO_USER_CONTEXT = "ODOO_USER_CONTEXT";
export const CURRENT_APLIKASI_ACTIVE = "CURRENT_APLIKASI_ACTIVE";




export async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}




export async function getAplikasiActive(request) {
  try {
    const session = await getSession(request);
    const aplikasi = session.get(CURRENT_APLIKASI_ACTIVE);
    if(aplikasi === undefined){
      return null
    }
    return aplikasi
  } catch (e) {
    throw await logout(request);
  }
}



export async function createJwt(payload) {
  return jwt.sign(payload, process.env.ADMIN_JWT_SECRET, { expiresIn: '12h' });
}



export async function verifyJwt(request) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new Error('HEADER JWT TIDAK ADA')
  }
  const token = authorizationHeader.replace('Bearer ', '');
  try {
    const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const target_app = await validateInternalList( decode_jwt.app_name);
      if (!target_app) {
        throw new Error('APLIKASI TIDAK DITEMUKAN')
      }
      
      console.log(target_app);
      console.log(decode_jwt);
      if(decode_jwt.is_admin){
      return {
        ...decode_jwt,
        departement_id : target_app.departement_id
      };
    }else{
      const user_employe = await odoo_db('hr_employee').where({ user_id: decode_jwt.id}).select('*').first();
      if(user_employe.department_id !== target_app.departement_id){
        throw new Error('DEPARTEMENT ID TIDAK COCOK')
      }
    }
    return {
      ...decode_jwt,
      departement_id : target_app.departement_id
    };
  } catch (error) {
    console.log(error)
    throw new Error('TERJADI KESALAHAN INTERNAL / ACCESS TOKEN TIDAK COCOK')
  }
}




export async function getOdooCurent(request) {
  try {
    const session = await getSession(request);
    const session_id = session.get(ODOO_SESSION_ID);
    return {
      session_id : session_id
    }
  } catch (e) {
    return null
  }
}




export async function createUserSession({ redirectTo, remember, request, user, odoo_session_id }) {
  const session = await getSession(request);
  session.set(ODOO_SESSION_ID, odoo_session_id);
  session.set(ODOO_USER_CONTEXT, user);
  const headers = new Headers();
  headers.append('Set-Cookie', await sessionStorage.commitSession(session, {
    maxAge: remember
      ? 60 * 60 * 24 * 7 // 7 days
      : undefined,
  }));
  return redirect(redirectTo, {
    status: 301,
    headers: headers,
  });
}





export async function requireUserId(request, redirectTo = new URL(request.url).pathname) {
  try {
    const session = await getSession(request);
    const odoo_session_id = session.get(ODOO_SESSION_ID);
    if (odoo_session_id) {
      return odoo_session_id;
    } else {
      const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
      throw redirect(`/aplikasi/internal/auth/login?${searchParams}`);
    }
  } catch (e) {
    console.log(e);
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/aplikasi/internal/auth/login?${searchParams}`);
  }
}




export async function requireUser(request, redirectTo = new URL(request.url).pathname) {
  try {
    const session = await getSession(request);
    const odoo_session_id = session.get(ODOO_SESSION_ID);
    const odoo_user_context = session.get(ODOO_USER_CONTEXT);
    if (odoo_session_id && odoo_user_context) {
      const user = await findOne({
        model: 'res.users',
        domain: [["id", "=", odoo_user_context.uid]],
        select: {
          company_id: {
            fields: {
              display_name: {}
            },
            context: {
              user_preference: 0
            }
          },
          name: {},
          login: {},
          employee_ids: {
            fields: {
              id: {},
              image_1024 :{},
              name: {},
              job_id: {
                fields: {
                  display_name: {}
                }
              },
              department_id: {
                fields: {
                  display_name: {}
                }
              },
              parent_id: {
                fields: {
                  display_name: {}
                }
              },
              avatar_128: {},
            }
          },
          lang: {},
          login_date: {},
          state: {},
          partner_id: {
            fields: {
              display_name: {}
            }
          }
        }
      });
      user.current_company = user.company_id?.id || 1;
      user.uid = user.id
      const return_value = {...user, employed : user.employee_ids?.length > 0 ? user.employee_ids[0]  : {} };
      return_value['employee_ids'] = undefined;
      delete(return_value['employee_ids']);
      return return_value;
    } else {
      const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
      throw redirect(`/aplikasi/internal/auth/login?${searchParams}`);
    }
  } catch (e) {
    console.log(e);
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/aplikasi/internal/auth/login?${searchParams}`);
  }
}




export async function getUser(request) {
  try {
    const session = await getSession(request);
    const user = session.get(ODOO_SESSION_ID);
    if(user === undefined){
      return null
    }
    return user
  } catch (e) {
    console.log(e);
    throw await logout(request);
  }
}





export const getUserRoles = async (user) => {
  try {
    const model = 'res.groups';
    const method = 'web_search_read';
    const { data } = await axios({
      url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/dataset/call_kw/${model}/${method}`,
      method: 'POST',
      data: {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {
          "model": model,
          "method": method,
          "args": [],
          "kwargs": {
            "specification": {
              "name": {}
            },
            "offset": 0,
            "limit": 10001,
            "context": {
              "lang": "id_ID",
              "tz": "Asia/Jayapura",
              "uid": 2,
              "allowed_company_ids": [user.current_company],
              "bin_size": true,
              //"active_model":"res.users",
              "create": false,
              "delete": false,
              "current_company_id": user.current_company
            },
            "count_limit": 10001,
            "domain": [["users.id", "=", user.uid]]
          }
        }
      },
      headers: {
        'Cookie': `session_id=${global.odoo_superadmin?.session};tz=${global.odoo_superadmin?.tz}`
      }
    });

    if (data?.error) {
      console.log('ERROR GET ROLES- 0')
      return null
    }

    const user_roles = data.result?.records;
    if (user_roles) {
      return user_roles;
    }
    console.log('ERROR GET ROLES- 1')
    return null
  } catch (e) {
    console.log(e);
    console.log('ERROR GET ROLES- 2')
    return null
  }
}




export const getAppTarget = async (app_id, user) => {
  try {
    const model = 'x_app_blu';
    const method = 'web_read';
    const { data } = await axios({
      url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/dataset/call_kw/${model}/${method}`,
      method: 'POST',
      data: {
        jsonrpc: "2.0",
        method: "call",
        params: {
          "model": model,
          "method": method,
          "args": [[app_id]],
          "kwargs": {
            "context": {
              "lang": "id_ID",
              "tz": "Asia/Jayapura",
              "uid": 2,
              "allowed_company_ids": [1],
              "bin_size": true
            },
            "specification": {
              "x_active": {},
              "display_name": {},
              "x_studio_path": {},
              "x_studio_target_instansi": {
                "fields": {
                  "x_studio_target_instansi": {
                    "fields": { "display_name": {} }
                  },
                  "x_studio_target_roles": {
                    "fields": { "display_name": {} }
                  },
                  "x_studio_admin_koordinator": {
                    "fields": { "display_name": {} }
                  },
                  "x_studio_admin_verifikator": {
                    "fields": { "display_name": {} }
                  },
                  "x_studio_admin_operator": {
                    "fields": { "display_name": {} }
                  },
                  "x_name": {}
                },
                "limit": 40
              }
            }
          }
        }
      },
      headers: {
        'Cookie': `session_id=${global.odoo_superadmin?.session};tz=${global.odoo_superadmin?.tz}`
      }
    });

    if (data?.error) {
      console.log('ERROR - 0')
      return null
    }

    const search_instansi = data.result[0];
    if (search_instansi) {
      const instansi = search_instansi.x_studio_target_instansi.find(item => item.x_studio_target_instansi?.id === user.current_company) || null;
      if (instansi) {
        const isKoordinator = instansi.x_studio_admin_koordinator.id === user.uid;
        const isVerifikator = instansi.x_studio_admin_verifikator.id === user.uid;
        const isOperator = instansi.x_studio_admin_operator.id === user.uid;
        return {
          id : search_instansi.id,
          x_studio_path : search_instansi.x_studio_path,
          instansi,
          isKoordinator,
          isVerifikator,
          isOperator,
        }
      }
      else {
        console.log('ERROR - 1')
        return null;
      }
    }
    return null
  } catch (e) {
    console.log(e);
    console.log('ERROR - 2')
    return null
  }
}






export async function logout(request) {
  const session = await getSession(request);
  return redirect("/aplikasi/auth/login", { 
    status: 301,
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) } 
  });
}

