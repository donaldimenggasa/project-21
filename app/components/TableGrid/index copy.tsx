import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


// Register AG Grid Modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  ExcelExportModule,
  RangeSelectionModule,
  RowGroupingModule,
  FiltersToolPanelModule,
  StatusBarModule,
  SideBarModule,
]);

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
  salary: number;
  performance: number;
  projects: number;
  location: string;
  manager: string;
  team: string;
}

const EmployeeTable: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);

  // Sample data
  const rowData: Employee[] = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    name: `Employee ${index + 1}`,
    position: ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Specialist', 'HR Manager'][Math.floor(Math.random() * 5)],
    department: ['Engineering', 'Product', 'Design', 'Marketing', 'HR'][Math.floor(Math.random() * 5)],
    email: `employee${index + 1}@example.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    status: Math.random() > 0.2 ? 'Active' : 'Inactive',
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    salary: Math.floor(Math.random() * 50000) + 50000,
    performance: Math.floor(Math.random() * 100),
    projects: Math.floor(Math.random() * 10) + 1,
    location: ['New York', 'London', 'Tokyo', 'Singapore', 'Berlin'][Math.floor(Math.random() * 5)],
    manager: ['John Manager', 'Sarah Lead', 'Mike Director', 'Anna Head', 'Tom Chief'][Math.floor(Math.random() * 5)],
    team: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][Math.floor(Math.random() * 5)]
  }));

  const columnDefs = useMemo(() => [
    {
      headerName: 'Employee Details',
      children: [
        {
          field: 'name',
          headerName: 'Name',
          filter: 'agTextColumnFilter',
          checkboxSelection: true,
          headerCheckboxSelection: true,
          floatingFilter: true,
          pinned: 'left',
          width: 180,
        },
        {
          field: 'position',
          headerName: 'Position',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
        },
        {
          field: 'department',
          headerName: 'Department',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          enableRowGroup: true,
        }
      ]
    },
    {
      headerName: 'Contact Information',
      children: [
        {
          field: 'email',
          headerName: 'Email',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
        },
        {
          field: 'phone',
          headerName: 'Phone',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
        }
      ]
    },
    {
      headerName: 'Employment',
      children: [
        {
          field: 'status',
          headerName: 'Status',
          filter: 'agSetColumnFilter',
          cellRenderer: (params: any) => {
            const status = params.value;
            const colorClass = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            return (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {status}
              </span>
            );
          },
          floatingFilter: true,
          enableRowGroup: true,
        },
        {
          field: 'joinDate',
          headerName: 'Join Date',
          filter: 'agDateColumnFilter',
          floatingFilter: true,
        },
        {
          field: 'salary',
          headerName: 'Salary',
          filter: 'agNumberColumnFilter',
          valueFormatter: (params: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(params.value);
          },
          floatingFilter: true,
          aggFunc: 'avg',
        }
      ]
    },
    {
      headerName: 'Performance',
      children: [
        {
          field: 'performance',
          headerName: 'Performance Score',
          filter: 'agNumberColumnFilter',
          cellRenderer: (params: any) => {
            const score = params.value;
            const getColor = (score: number) => {
              if (score >= 80) return 'bg-green-100 text-green-800';
              if (score >= 60) return 'bg-yellow-100 text-yellow-800';
              return 'bg-red-100 text-red-800';
            };
            return (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColor(score)}`}>
                {score}%
              </span>
            );
          },
          floatingFilter: true,
          aggFunc: 'avg',
        },
        {
          field: 'projects',
          headerName: 'Active Projects',
          filter: 'agNumberColumnFilter',
          floatingFilter: true,
          aggFunc: 'sum',
        }
      ]
    },
    {
      headerName: 'Organization',
      children: [
        {
          field: 'location',
          headerName: 'Location',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          enableRowGroup: true,
        },
        {
          field: 'manager',
          headerName: 'Manager',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          enableRowGroup: true,
        },
        {
          field: 'team',
          headerName: 'Team',
          filter: 'agTextColumnFilter',
          floatingFilter: true,
          enableRowGroup: true,
        }
      ]
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 150,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    floatingFilter: true,
  }), []);

  const onGridReady = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  }, []);

  const sideBar = useMemo(() => ({
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
    ],
    defaultToolPanel: 'columns',
    position: 'right',
  }), []);

  const statusBar = useMemo(() => ({
    statusPanels: [
      { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
      { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
      { statusPanel: 'agAggregationComponent', align: 'right' },
    ],
  }), []);

  return (
    <div className="ag-theme-alpine w-full h-[calc(100vh-88px)]">
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        enableRangeSelection={true}
        rowSelection="multiple"
        onGridReady={onGridReady}
        sideBar={sideBar}
        statusBar={statusBar}
        rowGroupPanelShow="always"
        groupSelectsChildren={true}
        suppressRowClickSelection={true}
        pagination={true}
        paginationPageSize={25}
        enableCharts={true}
        enableRangeHandle={true}
        enableFillHandle={true}
        suppressMenuHide={true}
        animateRows={true}
        groupDisplayType="groupRows"
        groupDefaultExpanded={1}
      />
    </div>
  );
};

export default EmployeeTable;