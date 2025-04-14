import axios from "axios";

const getView = async(model : string) =>{
  if(!model){
    return null;
  }
  try{
      const params = {};
      const { data : { result }} = await axios({
        url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/internal-action`,
        method: "POST",
        data: {
          params: params,
          queries: [
           //`env['x_mobile_devices'].sudo().web_search_read(specification={}, limit=1, offset=0, order='id desc', domain=[])`,
           `env['${model}'].sudo().get_views(views=[[False, "list"], [False, "form"], [False, "search"]])`,
          ],
        },
      });
      return result[0]
  }catch(e){
    console.log(e);
    return null
  }
}


const getData = async(params : any) =>{

  try{
    const { data : { result }} = await axios({
      url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/internal-action`,
      method: "POST",
      data: {
        params: params,
        queries: [
          `env['${params._model}'].sudo().web_search_read(specification=_spesification, limit=_limit, offset=_offset, order=_order, domain=_domain)`,
        ]
      }
    });
    return result[0]
  }catch(e){
    console.log(e);
    return null
  }
}

export default getView;
export { getData }
