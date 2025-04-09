/* eslint-disable no-unreachable */
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import axios from "axios";

invariant(process.env.APLIKASI_SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'portal',
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.APLIKASI_SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});



export const ODOO_SESSION_ID = "__ODOO_SESSION_ID";
export const ODOO_USER_CONTEXT = "__ODOO_USER_CONTEXT";
export const ODOO_DATABASE = "__ODOO_DATABASE";




export async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}





export const odooReactClientRouting = [
  '/contactus',
  '/blog'
]



export async function requireOdooPublicSession(request) {
  const session = await getSession(request);
  const odoo_session_id = session.get(ODOO_SESSION_ID);
  const user_context = session.get(ODOO_USER_CONTEXT);

  return { 
    session_id : odoo_session_id, 
    user_context : user_context
  };
}






/*
export async function requireOdooPublicSession(request) {
  try {
    const session = await getSession(request);
    const odoo_session_id = session.get(ODOO_SESSION_ID);
    const user_context = session.get(ODOO_USER_CONTEXT);
    
    if (odoo_session_id && user_context) {
      return { 
        session_id : odoo_session_id, 
        user_context : user_context
      };

    } else {
      
     
      const { headers, data } = await axios({
        url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/session/authenticate`,
        method: 'post',
        data: {
          jsonrpc: "2.0",
          method: "call",
          params: {
            db: process.env.ODOO_DATABASE,
            login: process.env.ODOO_BOT_USERNAME,
            password: process.env.ODOO_BOT_PASSWORD,
          }
        }
      });

      


      if (data?.error) {
        return {
          redirect : false,
          session : null,
          sessionStorage : null,
          path : '/error'
        }
      }




      const cookieString = headers['set-cookie']?.[0];
      const match = cookieString.match(/session_id=([^;]+)/);

      console.log(cookieString)
      console.log(match)

      if (match) {
        const user = data.result;
        const session_id = match[1];
        session.set(ODOO_SESSION_ID, session_id);
        session.set(ODOO_USER_CONTEXT, user?.user_context);

        return {
          redirect : true,
          session : session,
          sessionStorage : sessionStorage,
          path : '/'
        }
      } 
      
      else {
        return {
          redirect : false,
          session : null,
          sessionStorage : null,
          path : '/error'
        }
      }
    }
  } catch (e) {
    console.log(e)
    return {
      redirect : false,
      session : null,
      sessionStorage : null,
      path : '/error'
    }
  }
}


*/



