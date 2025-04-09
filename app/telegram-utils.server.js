import CryptoJS from 'crypto-js'
import { findOne } from "~/odoo.request.server";


export async function getUserByTelegramId({ tg_Data, token, aplikasi  }) {

    
    const userTelegram = JSON.parse(tg_Data.get('user'));
    let dataToCheck = [];
    tg_Data.sort();
    tg_Data.forEach((val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`));
    const secret = CryptoJS.HmacSHA256(token, "WebAppData");
    const _hash = CryptoJS.HmacSHA256(dataToCheck.join("\n"), secret).toString(CryptoJS.enc.Hex);
    const hash = tg_Data.get('hash');
    if (_hash !== hash) {
      throw new Error('Telegram Not Match')
    }

    const checkUser = await findOne({
      model: 'res.users',
      domain: [["x_studio_telegram_id", "=", userTelegram.id]],
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

    const return_value = {...checkUser, employed : checkUser.employee_ids?.length > 0 ? checkUser.employee_ids[0]  : {} };
    return_value['employee_ids'] = undefined;
    delete(return_value['employee_ids']);

    return return_value
}







