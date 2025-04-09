import  axios  from "axios";

export async function addOne({ model,  newData = {}, returnValue ={}, session_id, context = {} }) {
  const { data } = await axios({
    url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/dataset/call_kw/${model}/web_save`,
    method: 'POST',
    data: {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: model,
        method: 'web_save',
        args: [[], newData],
        kwargs: {
          context: {
            lang: "en_US",
            tz: "Asia/Jayapura",
            uid: 2,
            bin_size: true,
            show_user_group_warning: true,
            ...context
          },
          specification: returnValue
        }
      }
    },
    headers: {
      'Cookie': `session_id=${session_id || global.odoo_superadmin?.session};tz=${global.odoo_superadmin?.tz}`
    }
  });

  


  if (data?.error) {
    //console.log(data.error)
    throw new Error('ERROR GET DATA ODOO - FINDONE')
  }
  if(data.result){
    return data.result[0]
  }else{
    console.log(data);
    throw new Error('ERROR GET DATA ODOO - FINDONE')
  }
}




export async function findOne({ model,  select = {}, domain = [],  context ={}, session_id }) {
    const { data } = await axios({
      // eslint-disable-next-line no-undef
      url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/dataset/call_kw/${model}/web_search_read`,
      method: 'POST',
      data: {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: model,
          method: 'web_search_read',
          args: [],
          kwargs: {
            context: {
              lang: "id_ID",
              tz: "Asia/Jayapura",
              uid: 2,
              bin_size: true,
              show_user_group_warning: true,
              ...context
            },
            specification: select,
            offset: 0,
            limit: 1,
            count_limit: 1,
            domain: domain
          }
        }
      },
      headers: {
        'Cookie': `session_id=${session_id || global.odoo_superadmin?.session};tz=${global.odoo_superadmin?.tz}`
      }
    });

    if (data?.error) {
      console.log(data.error)
      throw new Error(data.error.data.message || 'ERROR GET DATA ODOO - FINDONE')
    }
    if(data.result?.records.length > 0){
      return data.result.records[0]
    }else{
      throw new Error('ERROR GET DATA ODOO - FINDONE')
    }
}



export async function findMany({ model,  select = {}, offset = 0, order = '', limit = 20, count_limit = 10001,  domain = [],  context ={}, session_id }) {
    const { data } = await axios({
      // eslint-disable-next-line no-undef
      url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/dataset/call_kw/${model}/web_search_read`,
      method: 'POST',
      data: {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: model,
          method: 'web_search_read',
          args: [],
          kwargs: {
            context: {
              lang: "id_ID",
              tz: "Asia/Jayapura",
              uid: 2,
              bin_size: true,
              current_company_id: 1,
              show_user_group_warning: true,
              ...context
            },
            specification: select,
            offset: offset,
            order: order,
            limit: limit,
            count_limit: count_limit,
            domain: domain
          }
        }
      },
      headers: {
        'Cookie': `session_id=${session_id || global.odoo_superadmin?.session};tz=${global.odoo_superadmin?.tz}`
      }
    });

    if (data?.error) {
      throw new Error(data.error?.data?.message || 'ERROR GET DATA ODOO - FINDONE')
    }
    return data.result
}










export async function createOdooToken({email = null}) {
  
  const { headers, data } = await axios({
    url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web/session/authenticate`,
    method: 'post',
    data: {
      jsonrpc: "2.0",
      method: "call",
      params: {
        db: process.env.ODOO_DATABASE,
        login: email,
        password: process.env.ODOO_MASTER_PASSWORD
      }
    }
  });
  
  if (data?.error) {
    throw new Error('error 1 - create odoo token')
  }
  
  const cookieString = headers['set-cookie']?.[0];
  const match = cookieString.match(/session_id=([^;]+)/);
  if (match) {
    const session_id = match[1];
    return session_id
  } else {
    throw new Error('error 2 - create odoo token')
  }
}
