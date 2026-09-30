import React, { useEffect, useMemo, useState } from 'react';
import AdminColumnDrawer from '../../components/AdminColumnDrawer';
import AdminListView from '../../components/AdminListView';
import { showTeacherPopup } from './teacherHeaderActions';

const TeacherListIcon = ({ type }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    columns: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18" /><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" /><path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.3 3.4" /><path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 7 10 7a9.9 9.9 0 0 0 4.2-.9" /></>,
    grip: <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>
  };

  return (
    <svg className="tm-list-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const buildColumns = (definitions) => definitions.map((column, index) => ({
  ...column,
  width: column.defaultWidth,
  order: index
}));

export default function TeacherListView({
  storageKey,
  columnDefinitions,
  rows,
  getRowId,
  renderCell,
  isLoading,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  emptyMessage,
  itemLabel,
  filterButton,
  renderExpandedRow,
  isRowExpanded
}) {
  const [columns, setColumns] = useState(() => {
    const defaults = buildColumns(columnDefinitions);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!Array.isArray(saved)) return defaults;
      return defaults.map((column) => {
        const savedColumn = saved.find((item) => item.key === column.key);
        return savedColumn
          ? {
              ...column,
              visible: savedColumn.visible !== false,
              width: Number(savedColumn.width) || column.defaultWidth,
              order: Number.isFinite(savedColumn.order) ? savedColumn.order : column.order
            }
          : column;
      });
    } catch {
      return defaults;
    }
  });
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [draftColumns, setDraftColumns] = useState([]);
  const [draggedColumnKey, setDraggedColumnKey] = useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState(null);
  const [tableDragColumnKey, setTableDragColumnKey] = useState(null);
  const [tableDragTargetKey, setTableDragTargetKey] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 7;

  useEffect(() => {
    const compactColumns = columns.map(({ key, visible, width, order }) => ({ key, visible, width, order }));
    localStorage.setItem(storageKey, JSON.stringify(compactColumns));
  }, [columns, storageKey]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
  }, [searchTerm, rows.length]);

  const visibleColumns = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order).filter((column) => column.visible),
    [columns]
  );
  const modalColumns = useMemo(() => {
    const query = columnSearchTerm.toLowerCase();
    return [...draftColumns]
      .sort((a, b) => a.order - b.order)
      .filter((column) => column.label.toLowerCase().includes(query));
  }, [columnSearchTerm, draftColumns]);
  const draftVisibleCount = draftColumns.filter((column) => column.visible).length;
  const totalPages = Math.max(1, Math.ceil(rows.length / recordsPerPage));
  const firstRecordIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = rows.slice(firstRecordIndex, firstRecordIndex + recordsPerPage);
  const currentIds = currentRecords.map(getRowId);
  const isAllSelected = currentIds.length > 0 && currentIds.every((id) => selectedRows.includes(id));

  const moveColumn = (list, fromKey, toKey) => {
    const next = [...list].sort((a, b) => a.order - b.order);
    const fromIndex = next.findIndex((column) => column.key === fromKey);
    const toIndex = next.findIndex((column) => column.key === toKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return list;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next.map((column, index) => ({ ...column, order: index }));
  };

  const openColumnModal = () => {
    setDraftColumns(columns.map((column) => ({ ...column })));
    setColumnSearchTerm('');
    setIsColumnModalOpen(true);
  };

  const handleColumnDrop = (event, targetKey) => {
    event.preventDefault();
    if (tableDragColumnKey) {
      setColumns((current) => moveColumn(current, tableDragColumnKey, targetKey));
    }
    setTableDragColumnKey(null);
    setTableDragTargetKey(null);
  };

  const startColumnResize = (event, key) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = columns.find((column) => column.key === key)?.width || 140;
    const onMove = (moveEvent) => {
      const nextWidth = Math.max(90, startWidth + moveEvent.clientX - startX);
      setColumns((current) => current.map((column) => column.key === key ? { ...column, width: nextWidth } : column));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <>
      <AdminListView
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchIcon={<TeacherListIcon type="search" />}
        configureIcon={<TeacherListIcon type="columns" />}
        onConfigure={openColumnModal}
        filterButton={filterButton || (
          <button
            className="admin-list-filter-btn"
            type="button"
            aria-label="Filter"
            onClick={() => showTeacherPopup({
              title: 'Filter options',
              text: 'Use the search field or configure columns to narrow this list.'
            })}
          >
            <TeacherListIcon type="filter" />
          </button>
        )}
        columns={visibleColumns}
        rows={currentRecords}
        getRowId={getRowId}
        renderCell={renderCell}
        isLoading={isLoading}
        selectedRows={selectedRows}
        isAllSelected={isAllSelected}
        onSelectAll={() => setSelectedRows((current) => isAllSelected ? current.filter((id) => !currentIds.includes(id)) : [...new Set([...current, ...currentIds])])}
        onSelectRow={(id) => setSelectedRows((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
        tableDragColumnKey={tableDragColumnKey}
        tableDragTargetKey={tableDragTargetKey}
        onColumnDragStart={(_, key) => setTableDragColumnKey(key)}
        onColumnDragOver={(event, key) => {
          event.preventDefault();
          setTableDragTargetKey(key);
        }}
        onColumnDragLeave={(key) => setTableDragTargetKey((current) => current === key ? null : current)}
        onColumnDrop={handleColumnDrop}
        onColumnDragEnd={() => {
          setTableDragColumnKey(null);
          setTableDragTargetKey(null);
        }}
        onColumnResizeStart={startColumnResize}
        renderExpandedRow={renderExpandedRow}
        isRowExpanded={isRowExpanded}
        emptyMessage={emptyMessage}
        loadingMessage="Loading data..."
        paginationLabel={`Showing ${rows.length > 0 ? firstRecordIndex + 1 : 0} to ${Math.min(firstRecordIndex + recordsPerPage, rows.length)} of ${rows.length} ${itemLabel}`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSelectedRows([]);
        }}
      />

      <AdminColumnDrawer
        isOpen={isColumnModalOpen}
        title="Fields"
        description="Choose which columns appear in this list."
        searchTerm={columnSearchTerm}
        onSearchChange={setColumnSearchTerm}
        columns={modalColumns}
        visibleCount={draftVisibleCount}
        onVisibleFirst={() => setDraftColumns((current) => [...current].sort((a, b) => Number(b.visible) - Number(a.visible)).map((column, index) => ({ ...column, order: index })))}
        onClose={() => setIsColumnModalOpen(false)}
        onApply={() => {
          setColumns(draftColumns);
          setIsColumnModalOpen(false);
        }}
        onToggleColumn={(key) => setDraftColumns((current) => current.map((column) => column.key === key ? { ...column, visible: !column.visible } : column))}
        onDragStart={(_, key) => setDraggedColumnKey(key)}
        onDragOver={(event, key) => {
          event.preventDefault();
          setDragOverColumnKey(key);
        }}
        onDragLeave={(key) => setDragOverColumnKey((current) => current === key ? null : current)}
        onDrop={(event, key) => {
          event.preventDefault();
          if (draggedColumnKey) setDraftColumns((current) => moveColumn(current, draggedColumnKey, key));
          setDraggedColumnKey(null);
          setDragOverColumnKey(null);
        }}
        onDragEnd={() => {
          setDraggedColumnKey(null);
          setDragOverColumnKey(null);
        }}
        draggedColumnKey={draggedColumnKey}
        dragOverColumnKey={dragOverColumnKey}
        searchIcon={<TeacherListIcon type="search" />}
        visibleIcon={<TeacherListIcon type="eye" />}
        hiddenIcon={<TeacherListIcon type="eyeOff" />}
        gripIcon={<TeacherListIcon type="grip" />}
      />
    </>
  );
}
