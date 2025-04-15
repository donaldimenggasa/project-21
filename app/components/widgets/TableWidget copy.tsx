import React, { useMemo, useState, memo } from 'react';
import { Component } from './types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { commonProperties } from './types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from 'lucide-react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { EditorProps } from './types';

interface TableColumn {
  id: string;
  header: string;
  accessorKey: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  cell?: string;
  columns?: TableColumn[]; // Support for nested columns
}

interface TableProps {
  data: any[];
  columns: TableColumn[];
  pagination?: boolean;
  pageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

interface WidgetProps {
  component: Component;
}

const TableColumnEditor = memo(({ value = [], onChange }: EditorProps) => {
  const [columns, setColumns] = useState<TableColumn[]>(value);
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newColumns);
      onChange(newColumns);
    }
  };

  const handleSaveColumn = (column: TableColumn) => {
    let newColumns: TableColumn[];
    
    if (editingColumn) {
      newColumns = columns.map((col) => 
        col.id === editingColumn.id ? column : col
      );
    } else {
      newColumns = [...columns, column];
    }
    
    setColumns(newColumns);
    onChange(newColumns);
    setEditingColumn(null);
    setShowForm(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    const newColumns = columns.filter((col) => col.id !== columnId);
    setColumns(newColumns);
    onChange(newColumns);
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {columns.map((column) => (
              <SortableColumnItem
                key={column.id}
                column={column}
                onEdit={() => {
                  setEditingColumn(column);
                  setShowForm(true);
                }}
                onDelete={() => handleDeleteColumn(column.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showForm ? (
        <ColumnForm
          column={editingColumn || undefined}
          onSave={handleSaveColumn}
          onCancel={() => {
            setEditingColumn(null);
            setShowForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className={cn(
            "w-full px-4 py-2 text-sm rounded-lg transition-colors",
            "border border-dashed border-gray-700",
            "text-gray-400 hover:text-gray-200 hover:border-gray-600",
            "flex items-center justify-center gap-2"
          )}
        >
          <Plus className="h-4 w-4" />
          Add Column
        </button>
      )}
    </div>
  );
});

export const tableConfig = {
  type: 'table',
  props: {
    // Data Properties
    data: {
      type: 'array',
      defaultValue: [],
      displayName: 'Table Data',
      description: 'Array of objects containing the table data',
      section: 'data',
      bindable: true,
      order: 0
    },
    columns: {
      type: 'array',
      defaultValue: [
        {
          id: 'group1',
          header: 'Group 1',
          columns: [
            { 
              id: 'col1', 
              header: 'Column 1', 
              accessorKey: 'col1', 
              sortable: true,
              width: 200 
            },
            { 
              id: 'col2', 
              header: 'Column 2', 
              accessorKey: 'col2', 
              sortable: true,
              width: 200
            }
          ]
        },
        {
          id: 'group2',
          header: 'Group 2',
          columns: [
            { 
              id: 'col3', 
              header: 'Column 3', 
              accessorKey: 'col3', 
              sortable: true,
              width: 200 
            },
            { 
              id: 'col4', 
              header: 'Column 4', 
              accessorKey: 'col4', 
              sortable: true,
              width: 200
            }
          ]
        }
      ],
      displayName: 'Column Configuration',
      description: 'Define table columns with headers, keys, and options',
      section: 'data',
      bindable: true,
      order: 1
    },

    // Basic Properties
    pagination: {
      type: 'boolean',
      defaultValue: true,
      displayName: 'Enable Pagination',
      description: 'Show pagination controls at the bottom of the table',
      section: 'basic',
      bindable: true,
      order: 0
    },
    pageSize: {
      type: 'select',
      defaultValue: '10',
      displayName: 'Default Page Size',
      description: 'Number of rows to show per page',
      options: ['5', '10', '25', '50', '100'],
      section: 'basic',
      bindable: true,
      order: 1
    },
    sorting: {
      type: 'boolean',
      defaultValue: true,
      displayName: 'Enable Sorting',
      description: 'Allow users to sort columns by clicking headers',
      section: 'basic',
      bindable: true,
      order: 2
    },
    filtering: {
      type: 'boolean',
      defaultValue: true,
      displayName: 'Enable Filtering',
      description: 'Show search box for filtering table data',
      section: 'basic',
      bindable: true,
      order: 3
    },

    // Style Properties
    striped: {
      type: 'boolean',
      defaultValue: true,
      displayName: 'Striped Rows',
      description: 'Alternate row background colors',
      section: 'style',
      bindable: true,
      order: 0
    },
    hoverable: {
      type: 'boolean',
      defaultValue: true,
      displayName: 'Hover Effect',
      description: 'Highlight rows on mouse hover',
      section: 'style',
      bindable: true,
      order: 1
    },
    bordered: {
      type: 'boolean',
      defaultValue: true,
      displayName: 'Show Borders',
      description: 'Add borders around cells and table',
      section: 'style',
      bindable: true,
      order: 2
    },
    compact: {
      type: 'boolean',
      defaultValue: false,
      displayName: 'Compact Mode',
      description: 'Reduce cell padding for denser layout',
      section: 'style',
      bindable: true,
      order: 3
    },
    className: {
      type: 'string',
      defaultValue: '',
      displayName: 'CSS Classes',
      description: 'Additional CSS classes to apply to the table wrapper',
      section: 'style',
      bindable: true,
      order: 4
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      description: 'Custom CSS styles for the table wrapper',
      section: 'style',
      bindable: true,
      order: 5
    },
    ...commonProperties
  },
  /*sections: {
    data: {
      name: 'Data Configuration',
      order: 0
    },
    basic: {
      name: 'Basic Features',
      order: 1
    },
    style: {
      name: 'Style & Appearance',
      order: 2
    }
  }*/
};

const TableComponent: React.FC<TableProps> = ({
  data,
  columns,
  pagination = true,
  pageSize = 10,
  sorting = true,
  filtering = true,
  striped = true,
  hoverable = true,
  bordered = true,
  compact = false,
}) => {
  const [sortingState, setSortingState] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columnHelper = createColumnHelper<any>();

  const flattenColumns = (cols: TableColumn[]): ColumnDef<any>[] => {
    return cols.map((col) => {
      if (col.columns) {
        // This is a group column
        return columnHelper.group({
          id: col.id,
          header: col.header,
          columns: flattenColumns(col.columns)
        });
      }

      // This is a regular column
      return columnHelper.accessor(col.accessorKey, {
        id: col.id,
        header: ({ column }) => {
          if (!col.sortable) return col.header;
          return (
            <button
              className={cn(
                'flex items-center gap-1',
                column.getIsSorted() && 'text-blue-600'
              )}
              onClick={() => column.toggleSorting()}
            >
              {col.header}
              {{
                asc: <ChevronUp className="h-4 w-4" />,
                desc: <ChevronDown className="h-4 w-4" />,
              }[column.getIsSorted() as string] ?? (
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          );
        },
        cell: (info) => info.getValue(),
        size: col.width,
        minSize: col.minWidth,
        maxSize: col.maxWidth,
      });
    });
  };

  const tableColumns = useMemo(
    () => flattenColumns(columns),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting: sortingState,
      globalFilter,
    },
    onSortingChange: setSortingState,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: sorting,
    enableFiltering: filtering,
  });

  return (
    <div className="space-y-4">
      {filtering && (
        <div className="flex justify-end">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              "bg-white border border-gray-300",
              "focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            )}
          />
        </div>
      )}

      <div className="relative overflow-x-auto">
        <table className={cn(
          'w-full text-sm text-left rtl:text-right',
          bordered && 'border-collapse border border-gray-200',
          'rounded-lg overflow-hidden'
        )}>
          <thead className="bg-gray-50 text-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'px-6',
                      compact ? 'py-2' : 'py-3',
                      bordered && 'border border-gray-200',
                      'font-semibold',
                      header.colSpan > 1 && 'text-center bg-gray-100'
                    )}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  striped && i % 2 === 0 && 'bg-gray-50',
                  hoverable && 'hover:bg-gray-100 transition-colors'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      'px-6',
                      compact ? 'py-2' : 'py-4',
                      bordered && 'border border-gray-200'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                'p-1 rounded-lg transition-colors',
                'hover:bg-gray-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                'p-1 rounded-lg transition-colors',
                'hover:bg-gray-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                'p-1 rounded-lg transition-colors',
                'hover:bg-gray-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className={cn(
                'p-1 rounded-lg transition-colors',
                'hover:bg-gray-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors',
              'bg-white border border-gray-300',
              'focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
            )}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component }) => {
  const { props } = component;
  const { 
    data = [], 
    columns = [],
    className,
    style,
    hidden,
    loading,
    ...tableProps
  } = props;

  if (hidden) return null;

  return (
    <div 
      className={cn(
        'w-full',
        loading && 'opacity-50 pointer-events-none',
        className
      )} 
      style={style}
    >
      <TableComponent data={data} columns={columns} {...tableProps} />
    </div>
  );
});

componentRenderer.displayName = 'TableWidget';

export const tableWidget = new ComponentBuilder()
  .setType(tableConfig.type)
  .setDefaultProps(
    Object.entries(tableConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: config.defaultValue
    }), {})
  )
  /*.addPropertySection({
    name: tableConfig.sections.data.name,
    view: (props) => <PropertyEditor {...props} config={tableConfig} />
  })
  .addPropertySection({
    name: tableConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={tableConfig} />
  })
  .addPropertySection({
    name: tableConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={tableConfig} />
  })*/
  .setRender(componentRenderer)
  .build();