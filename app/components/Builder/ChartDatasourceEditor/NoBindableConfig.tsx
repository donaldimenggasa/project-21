import React, { useState, memo } from 'react';
import { cn } from '~/lib/utils';
import { Plus, Trash2, Edit2, Settings, Download, X, Maximize2, GripVertical } from 'lucide-react';
import { Component } from "~/lib/types";
import Papa from 'papaparse';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DataRow {
  [key: string]: any;
  id: string;
}

interface Column {
  key: string;
  name: string;
  type: 'text' | 'number';
}

interface ColumnFormProps {
  column?: Column;
  onSave: (column: Column) => void;
  onCancel: () => void;
}

interface DownloadModalProps {
  onClose: () => void;
  onDownload: (filename: string, format: string) => void;
}

interface TableModalProps {
  onClose: () => void;
  columns: Column[];
  value: DataRow[];
  handleUpdateCell: (rowIndex: number, field: string, newValue: any) => void;
  handleDeleteRow: (index: number) => void;
  handleAddRow: () => void;
  handleEditColumn: (column: Column) => void;
  handleDeleteColumn: (columnKey: string) => void;
  setShowColumnForm: (show: boolean) => void;
  setEditingColumn: (column: Column | null) => void;
  setShowDownloadModal: (show: boolean) => void;
  handleMoveRow: (activeIndex: number, overIndex: number) => void;
}

interface SortableRowProps {
  row: DataRow;
  rowIndex: number;
  columns: Column[];
  handleUpdateCell: (rowIndex: number, field: string, newValue: any) => void;
  handleDeleteRow: (index: number) => void;
}

const SortableRow = memo(({
  row,
  rowIndex,
  columns,
  handleUpdateCell,
  handleDeleteRow
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-gray-800/50 hover:bg-gray-800/30 group",
        isDragging && "bg-gray-800/70"
      )}
    >
      <td className="p-2 w-10">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-700/50 rounded flex items-center justify-center"
        >
          <GripVertical className="h-3.5 w-3.5 text-gray-500" />
        </div>
      </td>
      {columns.map(column => (
        <td key={column.key} className="p-2">
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            value={row[column.key]}
            onChange={(e) => handleUpdateCell(rowIndex, column.key, e.target.value)}
            className={cn(
              "w-full px-2 py-1 text-sm rounded bg-transparent",
              "border border-transparent hover:border-gray-700 focus:border-gray-600",
              "text-gray-300",
              column.type === 'number' && "font-mono",
              "focus:outline-hidden"
            )}
          />
        </td>
      ))}
      <td className="p-2">
        <button
          onClick={() => handleDeleteRow(rowIndex)}
          className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
});

SortableRow.displayName = 'SortableRow';

const TableModal = ({
  onClose,
  columns,
  value,
  handleUpdateCell,
  handleDeleteRow,
  handleAddRow,
  handleEditColumn,
  handleDeleteColumn,
  setShowColumnForm,
  setEditingColumn,
  setShowDownloadModal,
  handleMoveRow
}: TableModalProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = value.findIndex(row => row.id === active.id);
      const overIndex = value.findIndex(row => row.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        handleMoveRow(activeIndex, overIndex);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-[90vw] h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-200">Table View</h3>
            <button
              onClick={() => {
                setEditingColumn(null);
                setShowColumnForm(true);
              }}
              className="px-2 py-1 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded flex items-center gap-1"
            >
              <Settings className="h-3.5 w-3.5" />
              Add Column
            </button>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="px-2 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddRow}
              className="px-2 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="border-b border-gray-800">
                <th className="p-2 w-10"></th>
                {columns.map(column => (
                  <th key={column.key} className="p-2 text-xs font-medium text-gray-400 min-w-[150px]">
                    <div className="flex items-center justify-between gap-2 group">
                      <span>{column.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEditColumn(column)}
                          className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-blue-400"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        {columns.length > 1 && (
                          <button
                            onClick={() => handleDeleteColumn(column.key)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={value.map(row => row.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {value.map((row: DataRow, rowIndex: number) => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      rowIndex={rowIndex}
                      columns={columns}
                      handleUpdateCell={handleUpdateCell}
                      handleDeleteRow={handleDeleteRow}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DownloadModal = ({ onClose, onDownload }: DownloadModalProps) => {
  const [filename, setFilename] = useState('data');
  const [format, setFormat] = useState('json');

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">Download Data</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm rounded-md",
                "bg-gray-900 border border-gray-700",
                "text-gray-200 placeholder-gray-500",
                "focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
              )}
              placeholder="Enter file name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={cn(
                "w-full px-3 py-2 text-sm rounded-md",
                "bg-gray-900 border border-gray-700",
                "text-gray-200",
                "focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
              )}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDownload(filename, format)}
              className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColumnForm = memo(({ column, onSave, onCancel }: ColumnFormProps) => {
  const [formData, setFormData] = useState<Column>(column || {
    key: '',
    name: '',
    type: 'text'
  });

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-96">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Column Key
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500 font-mono",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
              placeholder="column_key"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
              placeholder="Column Name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Data Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'number' })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                "text-gray-300 hover:bg-gray-700"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {column ? 'Update Column' : 'Add Column'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ColumnForm.displayName = "ColumnForm";








function NoBindableConfig({ value, onChange }: any) {


  const [columns, setColumns] = useState<Column[]>([
    { key: 'name', name: 'Name', type: 'text' },
    { key: 'pv', name: 'Page Views', type: 'number' },
    { key: 'uv', name: 'Unique Views', type: 'number' }
  ]);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);


  console.log(value)



  // Ensure all rows have an id for drag and drop
  const rowsWithIds = React.useMemo(() => {
    return value.map((row: any, index: number) => ({
      ...row,
      id: row.id || `row-${index}-${Date.now()}`
    }));
  }, [value]);



  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );




  const handleAddRow = () => {
    const newRow: DataRow = { id: `row-${Date.now()}` };
    columns.forEach(col => {
      newRow[col.key] = col.type === 'number' ? 0 : '';
    });
    const newData = [...rowsWithIds, newRow];
    onChange({ value: newData });
  };



  const handleDeleteRow = (index: number) => {
    const newData = rowsWithIds.filter((_: any, i: number) => i !== index);
    onChange({ value: newData });
  };

  const handleUpdateCell = (rowIndex: number, field: string, newValue: any) => {
    const column = columns.find(col => col.key === field);
    const parsedValue = column?.type === 'number' ? Number(newValue) : newValue;

    const newData = [...rowsWithIds];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: parsedValue
    };
    onChange({ value: newData });
  };

  const handleMoveRow = (activeIndex: number, overIndex: number) => {
    const newData = arrayMove(rowsWithIds, activeIndex, overIndex);
    onChange({ value: newData });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = rowsWithIds.findIndex(row => row.id === active.id);
      const overIndex = rowsWithIds.findIndex(row => row.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        handleMoveRow(activeIndex, overIndex);
      }
    }
  };

  const handleAddColumn = (column: Column) => {
    if (editingColumn) {
      // Update existing column
      const oldKey = editingColumn.key;
      const newColumns = columns.map(col =>
        col.key === oldKey ? column : col
      );
      setColumns(newColumns);

      // Update data with new column key if changed
      if (oldKey !== column.key) {
        const newData = rowsWithIds.map((row: DataRow) => {
          const { [oldKey]: oldValue, ...rest } = row;
          return {
            ...rest,
            [column.key]: oldValue
          };
        });
        onChange({ value: newData });
      }
    } else {
      // Add new column
      setColumns([...columns, column]);

      // Add the new column to existing rows with default value
      const defaultValue = column.type === 'number' ? 0 : '';
      const newData = rowsWithIds.map((row: DataRow) => ({
        ...row,
        [column.key]: defaultValue
      }));
      onChange({ value: newData });
    }

    setShowColumnForm(false);
    setEditingColumn(null);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setShowColumnForm(true);
  };

  const handleDeleteColumn = (columnKey: string) => {
    // Remove column from columns list
    setColumns(columns.filter(col => col.key !== columnKey));

    // Remove column from all rows
    const newData = rowsWithIds.map((row: DataRow) => {
      const { [columnKey]: removed, ...rest } = row;
      return rest;
    });
    onChange({ value: newData });
  };



  const handleDownload = (filename: string, format: string) => {
    const data = rowsWithIds;
    let content: string | Blob;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        content = Papa.unparse(data);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'excel':
        // Convert data to CSV with specific Excel formatting
        const csvContent = Papa.unparse(data, {
          delimiter: '\t', // Use tab delimiter for Excel
          header: true,
          quotes: true // Quote all fields
        });

        // Add BOM for Excel UTF-8 detection
        const BOM = '\ufeff';
        content = BOM + csvContent;

        mimeType = 'application/vnd.ms-excel;charset=utf-8';
        extension = 'xls';
        break;
      case 'pdf':
        // For PDF, we'd need to implement PDF generation
        alert('PDF export is not yet implemented');
        setShowDownloadModal(false);
        return;
      default:
        alert('Invalid format');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border border-gray-800">
        <div className="flex flex-row w-full mx-auto">
          <button className={cn(
            'w-1/4 h-6 rounded-tl-sm rounded-bl-sm text-xs text-gray-300 cursor-pointer border-r border-gray-800',
            'hover:bg-purple-700'
          )}
            onClick={handleAddRow}>
            <span className="text-xs text-gray-300">ADD ROW</span>
          </button>

          <button className={cn(
            'w-1/4 h-6 text-xs text-gray-300 cursor-pointer',
            'hover:bg-purple-700'
          )}
            onClick={() => {
              setEditingColumn(null);
              setShowColumnForm(true);
            }}>
            <span className="text-xs text-gray-300">ADD COL</span>
          </button>

          <button className={cn(
            'w-1/4 h-6 text-xs text-gray-300 cursor-pointer',
            'hover:bg-purple-700'
          )}
            onClick={() => {
              setShowDownloadModal(true)
            }}>
            <span className="text-xs text-gray-300">DOWNLOAD</span>
          </button>

          <button className={cn(
            'w-1/4 h-6 rounded-tr-sm rounded-br-sm text-xs text-gray-300 cursor-pointer',
            'hover:bg-purple-700'
          )}
            onClick={() => setShowTableModal(true)}>
            <span className="text-xs text-gray-300">FULL VIEW</span>
          </button>








        </div>

      </div>

      {showColumnForm && (
        <ColumnForm
          column={editingColumn || undefined}
          onSave={handleAddColumn}
          onCancel={() => {
            setShowColumnForm(false);
            setEditingColumn(null);
          }}
        />
      )}

      {showDownloadModal && (
        <DownloadModal
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
        />
      )}


      {showTableModal && (
        <TableModal
          onClose={() => setShowTableModal(false)}
          columns={columns}
          value={rowsWithIds}
          handleUpdateCell={handleUpdateCell}
          handleDeleteRow={handleDeleteRow}
          handleAddRow={handleAddRow}
          handleEditColumn={handleEditColumn}
          handleDeleteColumn={handleDeleteColumn}
          setShowColumnForm={setShowColumnForm}
          setEditingColumn={setEditingColumn}
          setShowDownloadModal={setShowDownloadModal}
          handleMoveRow={handleMoveRow}
        />
      )}


      {/* Table Container with Fixed Header */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="border-b border-gray-800">
                <th className="p-2 w-10"></th>
                {columns.map(column => (
                  <th key={column.key} className="p-2 text-xs font-medium text-gray-400 min-w-[150px]">
                    <div className="flex items-center justify-between gap-2 group">
                      <span>{column.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEditColumn(column)}
                          className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-blue-400"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        {columns.length > 1 && (
                          <button
                            onClick={() => handleDeleteColumn(column.key)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-gray-900/50">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={rowsWithIds.map(row => row.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {rowsWithIds.map((row: DataRow, rowIndex: number) => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      rowIndex={rowIndex}
                      columns={columns}
                      handleUpdateCell={handleUpdateCell}
                      handleDeleteRow={handleDeleteRow}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NoBindableConfig;