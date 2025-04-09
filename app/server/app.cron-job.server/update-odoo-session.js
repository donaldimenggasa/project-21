import axios from 'axios';
import { redis } from "./../redis-db.server.js";


const loginOdooSelamannya = async () => {
  try {
    const user_odoo = await redis.get('odoo-admin');
    if (!user_odoo) {
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
        return false
      }
      const cookieString = headers['set-cookie']?.[0];
      const match = cookieString.match(/session_id=([^;]+)/);
      if (match) {
        const user = data.result;
        const session_id = match[1];
        await redis.set('odoo-admin', JSON.stringify({ ...user.user_context, session: session_id }));
        global.odoo_superadmin = { ...user.user_context, session: session_id };
        return 'SUPERADMIN - create odoo admin baru ke redis'
      } else {
        return 'SUPERADMIN - GAGAL LOGIN KE ODOO'
      }
    } else {
      const odoo_selamanya = JSON.parse(user_odoo);
      global.odoo_superadmin = odoo_selamanya;
      return 'SUPERADMIN -  ambil odoo admin dari redis';
    }
  } catch (e) {
    console.log(e)
    return 'SUPERADMIN -  GAGAL TOTAL';
  }
}




const loginOdooSelamannya2 = async () => {
  try {
    const user_odoo = await redis.get('odoo-public');
    if (!user_odoo) {
      const { headers, data } = await axios({
        url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/web?db=${process.env.ODOO_DATABASE}`,
        method: 'GET',
        maxRedirects: 0,
        validateStatus: function (status) {
          // Anggap status 3xx sebagai sukses
          return status >= 200 && status < 400;
        },
      });

      if (data?.error) {
        return false
      }
      const cookieString = headers['set-cookie']?.[0];
      const match = cookieString.match(/session_id=([^;]+)/);
      if (match) {
        const session_id = match[1];
        await redis.set('odoo-public', JSON.stringify({ tz: 'Asia/Jayapura', session: session_id }));
        global.odoo_public_user = { tz: 'Asia/Jayapura', session: session_id };
        return 'ODOO PUBLIC - create odoo public baru ke redis'
      } else {
        return 'ODOO PUBLIC - GAGAL LOGIN KE ODOO'
      }
    } else {
      const odoo_selamanya = JSON.parse(user_odoo);
      global.odoo_public_user = odoo_selamanya;
      return 'ODOO PUBLIC -  ambil odoo public dari redis';
    }
  } catch (e) {
    console.log(e)
    return 'ODOO PUBLIC -  GAGAL TOTAL';
  }
}



const runJob = {
  task: async () => {
    try{
      console.log('START UPDATE ODOO SESSION');
      const start = await Promise.all([
        loginOdooSelamannya(),
        loginOdooSelamannya2(),
      ]);
      console.log('SUCCESS UPDATE ODOO SESSION');
      console.log(start);
    }catch(e){
      console.log(e)
      console.log('ERROR UPDATE ODOO SESSION');
    }
  },
  options: {
    rule: "0 */4 * * *",
  },
}

export { runJob };