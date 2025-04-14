import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
]);

const PAGE_SIZE = 50;



const ActionCellRenderer = (props: any) => {
  const handleView = () => {
    console.log('View:', props.data);
  };

  const handleEdit = () => {
    console.log('Edit:', props.data);
  };

  const handleDelete = () => {
    console.log('Delete:', props.data);
  };



  return (
    <div className="flex items-center justify-center space-x-1">
      <button
        onClick={handleView}
        className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
        title="View"
      >
        <Eye className="w-4 h-4 text-blue-600" />
      </button>
      <button
        onClick={handleEdit}
        className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
        title="Edit"
      >
        <Pencil className="w-4 h-4 text-amber-600" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
};

const CustomLoadingOverlay = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const CustomNoRowsOverlay = () => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <span className="text-sm">No records to display</span>
  </div>
);




interface EmployeeTableProps {
  columns: any[];
  actionId: number;
}


const EmployeeTable: React.FC<EmployeeTableProps> = ({ columns = [], actionId }) => {
  const gridRef = useRef<AgGridReact>(null);


  const datasource = useMemo(() => {
    return {
      rowCount: 0,
      getRows: async (params: any) => {
        try {
          const { startRow, endRow, filterModel, sortModel } = params;
          const queryParams: any = {
            limit: endRow - startRow,
            skip: startRow,
          };
  
          if (filterModel) {
            const filterKeys = Object.keys(filterModel);
            if (filterKeys.length > 0) {
              const searchTerms = filterKeys.map(key => {
                const filter = filterModel[key];
                if (filter.type === 'contains') {
                  return filter.filter;
                }
                return null;
              }).filter(Boolean);
  
              if (searchTerms.length > 0) {
                queryParams.q = searchTerms.join(' ');
              }
            }
          }
  
          if (sortModel && sortModel.length > 0) {
            const sort = sortModel[0];
            queryParams.sortBy = sort.colId;
            queryParams.order = sort.sort.toUpperCase();
          }


          let url = '/aplikasi/api/get-list';
          const response = await axios.post(url, { 
            actionId : actionId,
            query: queryParams 
          });
          const { records, length } = response.data;
          params.successCallback(records, length);
        } catch (error) {
          console.error('Error fetching data:', error);
          params.failCallback();
        }
      }
    }
  }, [actionId]);


  const columnDefs = useMemo(() => {

    return columns.map((item)=>{
      return {
        field: item.name,
        headerName: item.string,
       // filter: 'agTextColumnFilter',
        width: 150,
        cellStyle: { textAlign: 'center' },
      }
    })

    /*{
      field: 'image',
      headerName: '',
      width: 50,
      filter: false,
      sortable: false,
      cellRenderer: (params: any) => (
        params.value ? (
          <div className="w-7 h-7 rounded-full overflow-hidden">
            <img
              src={params.value}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        ) : null
      )
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      filter: 'agTextColumnFilter',
      width: 130,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      filter: 'agTextColumnFilter',
      width: 130,
    },
    {
      field: 'email',
      headerName: 'Email',
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      field: 'company.title',
      headerName: 'Job Title',
      filter: 'agTextColumnFilter',
      width: 180,
    },
    {
      field: 'company.department',
      headerName: 'Department',
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'company.name',
      headerName: 'Company',
      filter: 'agTextColumnFilter',
      width: 180,
    },
    {
      field: 'address.city',
      headerName: 'City',
      filter: 'agTextColumnFilter',
      width: 130,
    },
    {
      field: 'address.state',
      headerName: 'State',
      filter: 'agTextColumnFilter',
      width: 130,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      filter: false,
      sortable: false,
      cellRenderer: ActionCellRenderer,
      cellStyle: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0'
      },
      suppressMovable: true,
      pinned: 'right'
    }*/
}, [columns]);



  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: false,
    filterParams: {
      buttons: ['reset', 'apply'],
    }
  }), []);





  const gridOptions = {
    headerHeight: 32,
    rowHeight: 32,
    loadingOverlayComponent: CustomLoadingOverlay,
    noRowsOverlayComponent: CustomNoRowsOverlay,
  };

  const onGridReady = useCallback((params: any) => {
    params.api.setDatasource(datasource);
  }, []);


  const onFilterChanged = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, []);


  const onSortChanged = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, []);



 

  return (
    <div className="ag-theme-alpine w-full h-[calc(100vh-88px)] bg-white">
     
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        gridOptions={gridOptions}
        rowModelType="infinite"
        cacheBlockSize={PAGE_SIZE}
        infiniteInitialRowCount={1}
        maxBlocksInCache={10}
        pagination={true}
        paginationPageSize={PAGE_SIZE}
        animateRows={true}
        rowSelection="multiple"
        suppressRowClickSelection={true}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onSortChanged={onSortChanged}
        enableCellTextSelection={true}
        ensureDomOrder={true}
        suppressLoadingOverlay={false}
        suppressNoRowsOverlay={false}
        enableRangeSelection={true}
        enableFillHandle={true}
        enableRangeHandle={true}
        suppressCellSelection={false}
      />
    </div>
  );
};

export default EmployeeTable;