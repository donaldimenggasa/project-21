import axios from "axios";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useRef, useMemo, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { useLoaderData, useLocation, useNavigation, useSearchParams } from "@remix-run/react";
import { getData } from "~/server/get-odoo-view";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { fields } from "~/server/db/schema/yori_builder";
ModuleRegistry.registerModules([ClientSideRowModelModule]);



//INI BACKENDNYA
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const headers_res = new Headers();
    headers_res.set("Content-Type", "application/json");

    try {
        //=================================
        //FOKUS DISINI
        const params = {
            _model: "x_elb_peralatan",
            _spesification: {
                x_name: {},
                x_studio_kelompok_peralatan: {
                    fields: {
                        x_name: {},
                    }
                },

                x_studio_type: {
                    fields: {
                        x_name: {},
                    }
                },

                x_studio_no_seri: {
                    fields: {
                        x_name: {},
                    }
                },

                x_studio_kode_lokasi: {
                    fields: {
                        x_name: {},
                    }
                },
             
            },
            _domain: [],
            _limit: 50,
            _offset: 0,
            _order: "id ASC",
        };
        //=================================
        const url = new URL(request.url);
        const skip = Number(url.searchParams.get("skip")) || 0;
        const limit = Number(url.searchParams.get("limit")) || 10;

        // Get filter parameters
        const filters: Record<string, string> = {};
        for (const [key, value] of url.searchParams.entries()) {
            if (key.startsWith('filter_')) {
                filters[key.replace('filter_', '')] = value;
            }
        }
        // Build query string for filtering
        let queryString = `limit=${limit}&skip=${skip}`;
        if (Object.keys(filters).length > 0) {
            // Add filter parameters to query
            queryString += `&select=id,firstName,lastName,age,email,phone,company`; // Required fields
            // Add search parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    queryString += `&q=${value}`;
                }
            });
        }
        const response = await getData(params);
        console.log(response)
        return new Response(JSON.stringify(response), { status: 200, headers: headers_res });
    } catch (e) {
        return new Response(
            JSON.stringify({
                errors: {
                    general: "request invalid.",
                },
            }),
            { status: 400, headers: headers_res }
        );
    }
};



function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}



// INI FRONTENDNYA
const PAGE_SIZE = 50;
export default () => {
    const { records, length } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigation = useNavigation();
    const gridRef = useRef<AgGridReact | null>(null);
    const filterTimeoutRef = useRef<NodeJS.Timeout>();
    const isLoading = navigation.state === "loading";
    console.log(records, length, searchParams.toString())



    // ============================
    const columnDefs = useMemo(() => {
        return [
            {
                field: "id",
                headerName: "ID",
                filter: "agTextColumnFilter",
                width: 90,
                cellStyle: { textAlign: "center" },
            },

            {
                field: "x_name",
                headerName: "PERALATAN",
                filter: "agTextColumnFilter",
                width: 150,
            },

            {
                field: "x_studio_kelompok_peralatan",
                headerName: "KELOMPOK PERALATAN",
                filter: "agTextColumnFilter",
                width: 150,
                cellRenderer: (params: any) => {
                    console.log(params.data?.x_studio_kelompok_peralatan?.x_st)
                    return params.data?.x_studio_kelompok_peralatan?.x_name || "-";
                }
            },

            {
                field: "x_studio_type",
                headerName: "TYPE PERALATAN",
                filter: "agTextColumnFilter",
                width: 150,
            },

            {
                field: "x_studio_no_seri",
                headerName: "NO.SERI PERALATAN",
                filter: "agTextColumnFilter",
                width: 150,
            },

            {
                field: "x_studio_kode_lokasi",
                headerName: "LOKASI",
                filter: "agTextColumnFilter",
                width: 150,
            },


        ];
    }, []);

    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
            suppressMovable: false,
            filterParams: {
                buttons: ["reset", "apply"],
            },
        }),
        []
    );


    const onFilterChanged = useCallback(
        debounce((event: any) => {
            const filterModel = event.api.getFilterModel();
            const newParams = new URLSearchParams(searchParams);

            // Reset pagination when filter changes
            newParams.set('skip', '0');

            // Clear existing filter parameters
            Array.from(newParams.keys()).forEach(key => {
                if (key.startsWith('filter_')) {
                    newParams.delete(key);
                }
            });

            // Add new filter parameters
            Object.entries(filterModel).forEach(([key, value]: [string, any]) => {
                if (value.filter) {
                    newParams.set(`filter_${key}`, value.filter);
                }
            });

            setSearchParams(newParams, { replace: true });
        }, 500),
        [searchParams, setSearchParams]
    );

    const datasource = useMemo(() => ({
        rowCount: undefined,
        getRows: (params: any) => {
            // Only update pagination if no filter is being applied
            if (!isLoading && navigation.state !== "submitting") {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('skip', params.startRow.toString());
                newParams.set('limit', (params.endRow - params.startRow).toString());
                setSearchParams(newParams, { replace: true });
            }

            params.successCallback(records, length);
        }
    }), [searchParams, records, length, isLoading, navigation.state]);


    const onGridReady = useCallback((params: any) => {
        if (gridRef.current) {
            gridRef.current.api = params.api;
        }
        params.api.setDatasource(datasource);
    }, [datasource]);





    useEffect(() => {
        return () => {
            if (filterTimeoutRef.current) {
                clearTimeout(filterTimeoutRef.current);
            }
        };
    }, []);




    return (
        <div className="ag-theme-alpine w-full h-[calc(100vh-88px)] bg-slate-100">
            <AgGridReact
              rowData={records}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowModelType="infinite"
              onGridReady={onGridReady}
              onFilterChanged={onFilterChanged}
              pagination={true}
              paginationPageSize={10}
              cacheBlockSize={10}
              maxBlocksInCache={1}
              infiniteInitialRowCount={length}
              rowClass="hover:bg-gray-50"
              enableCellTextSelection={true}
              animateRows={true}
              loadingOverlayComponent="loadingOverlay"
              loadingOverlayComponentParams={{
                loadingMessage: "Loading Data..."
              }}
            />
        </div>
    );
};
