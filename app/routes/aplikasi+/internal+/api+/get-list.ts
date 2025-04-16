import { db } from "~/server/db";
import { eq, sql } from "drizzle-orm";
import getView from "~/server/get-odoo-view";
import { XMLParser } from "fast-xml-parser";
import { type LoaderFunctionArgs } from "@remix-run/node";
import axios from "axios";


interface FieldDefinition {
    [key: string]: any;
}

interface Field {
    name: string;
    invisible?: boolean;
    column_invisible?: boolean;
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




export const action = async ({ request }: LoaderFunctionArgs) => {
    const headers_res = new Headers();
    headers_res.set("Content-Type", "application/json");
    const requestData = await request.json();
    const { actionId, query } = requestData;

    console.log("QUERY", query);

    if (!actionId) {
        return new Response(
            JSON.stringify({
                error: true,
                data: null,
                message: "model not found",
            }),
            { status: 400, headers: headers_res }
        );
    }

    const targetAction = await db.query.actWindow.findFirst({
        where: (actWindow) =>
            actionId ? eq(actWindow.id, parseInt(actionId ?? 0)) : undefined,
    });

    console.log(targetAction)

    if (!targetAction) {
        return new Response(
            JSON.stringify({
                error: true,
                data: null,
                message: "menu not found",
            }),
            { status: 400, headers: headers_res }
        );
    }

    const listView = targetAction.res_model ? await getView(targetAction.res_model) : null;
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        parseAttributeValue: true,
        trimValues: true,
    });

    const parseTableView = parser.parse(listView?.views?.list?.arch);
    const fieldList: Field[] = Array.isArray(parseTableView?.tree?.field)
        ? parseTableView?.tree?.field
        : [];

    const fieldsDef: Record<string, any> = {};
    fieldList.forEach((element: Field) => {
        if (!element.invisible && !element.column_invisible) {
            const fieldDefinition = getFieldDefinition(element.name, listView?.models as Models);
            if (fieldDefinition) {
                fieldsDef[element.name] = {};
            }
        }
    });

    try {
        const params = {
            fieldsDef,
            _limit : parseInt(query.limit) || 20,
            _offset : parseInt(query.skip) || 0,
        };
        const { data: { result }} = await axios({
            url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/internal-action`,
            method: "POST",
            data: {
                params: params,
                queries: [
                    `env['${targetAction.res_model}'].sudo().web_search_read(specification=fieldsDef, limit=_limit, offset=_offset, order='id desc', domain=[])`,
                ],
            },
        });

        return new Response(JSON.stringify(result[0]), {
            status: 200,
            headers: headers_res,
        });
    } catch (e) {
        console.log(e);
        return new Response(
            JSON.stringify({
                error: true,
                data: null,
                message: "model not found",
            }),
            { status: 400, headers: headers_res }
        );
    }
};
