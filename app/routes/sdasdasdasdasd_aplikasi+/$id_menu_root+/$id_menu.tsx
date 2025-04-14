import { db } from "~/server/db";
import { eq, sql } from "drizzle-orm";
import getView from "~/server/get-odoo-view";
import { XMLParser } from 'fast-xml-parser';
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import TableGrid from "~/components/TableGrid";

interface FieldDefinition {
  [key: string]: any;
}

interface Models {
  [key: string]: Record<string, FieldDefinition>;
}


function getFieldDefinition(fieldName: string, models: Record<string, Record<string, any>>) {
  for (const model of Object.values(models)) {
    if (model[fieldName]) {
      return model[fieldName];
    }
  }
  return null;
}




export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id_menu } = params;
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    
    const result = await db.query.actWindow.findFirst({
      where: (actWindow) => id_menu ? eq(actWindow.id, parseInt(id_menu ?? 0)) : undefined
    });

    if(!result){
      return new Response(
        JSON.stringify({
          error: true,
          data : null,
          message: "menu not found",
        }),
        { status: 400, headers: headers_res }
      );
    }

    

    const listView = result.res_model ? await getView(result.res_model) : null;
    

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: true,
      trimValues: true
    });

    const parseTableView =  parser.parse(listView?.views?.list?.arch);
    const parseSearchView =  parser.parse(listView?.views?.search?.arch);
    const parseFormView =  parser.parse(listView?.views?.form?.arch);
    //console.log(JSON.stringify(parseTableView?.tree?.field, null, 2));

    const fieldList: Field[] = Array.isArray(parseTableView?.tree?.field) ? parseTableView?.tree?.field : [];
    interface Field {
      name: string;
      invisible?: boolean;
      column_invisible?: boolean;
    }


    const fieldsDef: Array<FieldDefinition & Field> = [];
    fieldList.forEach((element: Field) => {
      if (!element.invisible && !element.column_invisible) {
      const fieldDefinition = getFieldDefinition(element.name, listView?.models as Models);
      if (fieldDefinition) {
        fieldsDef.push({...fieldDefinition, ...element});
      }
      }
    });



    return new Response(
      JSON.stringify({
        error : false,
        message : "success",
        data : fieldsDef
      }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        error : true,
        message: "request invalid.",
        data : null
      }),
      { status: 400, headers: headers_res }
    );
  }
};





export default () => {
    const { id_menu } = useParams();
    const { id_menu_root } = useParams();
    const { error, message, data } = useLoaderData<{ error: boolean; data: Record<string, any>; message: string }>();
    console.log( data);
    if (error) {
        return <div>{message}</div>;
    }
  
      return (<TableGrid 
        key={`${id_menu_root}-${id_menu}`}
        actionId={parseInt(id_menu ?? "0")} 
        columns={Array.isArray(data) ? data : Object.values(data)}
        />)
}