import React from 'react';
import './AdminListView.css';

export default function AdminListView({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search visible columns...',
  searchIcon,
  configureIcon,
  onConfigure,
  filterButton,
  columns,
  rows,
  getRowId,
  renderCell,
  isLoading,
  selectedRows,
  isAllSelected,
  onSelectAll,
  onSelectRow,
  tableDragColumnKey,
  tableDragTargetKey,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragLeave,
  onColumnDrop,
  onColumnDragEnd,
  onColumnResizeStart,
  minWidthExtra = 190,
  actionsHeader = 'Actions',
  actionsWidth = 150,
  renderActions,
  renderExpandedRow,
  isRowExpanded,
  emptyMessage = 'No records found.',
  loadingMessage = 'Loading data...',
  paginationLabel,
  currentPage,
  totalPages,
  onPageChange,
  showConfigure = true,
  showToolbar = true
}) {
  const hasActions = typeof renderActions === 'function';
  const hasExpandedRows = typeof renderExpandedRow === 'function';
  const columnsAreConfigurable = showConfigure && Boolean(onConfigure);
  const tableMinWidth = columns.reduce((total, column) => total + column.width, 220) + (hasActions ? minWidthExtra : 40);
  const columnSpan = columns.length + (hasActions ? 2 : 1);
  const noopDrag = (event) => event?.preventDefault?.();
  const handleColumnDragStart = onColumnDragStart || noopDrag;
  const handleColumnDragOver = onColumnDragOver || noopDrag;
  const handleColumnDragLeave = onColumnDragLeave || (() => {});
  const handleColumnDrop = onColumnDrop || noopDrag;
  const handleColumnDragEnd = onColumnDragEnd || (() => {});
  const handleColumnResizeStart = onColumnResizeStart || noopDrag;

  return (
    <div className="admin-list-card">
      {showToolbar && (
        <div className="admin-list-toolbar">
          <div className="admin-list-search">
            {searchIcon}
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="admin-list-tools">
            {showConfigure && onConfigure && (
              <button className="admin-list-configure-btn" type="button" onClick={onConfigure}>
                {configureIcon}
                Configure columns
              </button>
            )}
            {filterButton}
          </div>
        </div>
      )}

      <div className="admin-list-scroll">
        <table className="admin-list-table" style={{ minWidth: `${tableMinWidth}px` }}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={isAllSelected} onChange={onSelectAll} />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={columnsAreConfigurable ? `admin-list-configurable-th ${tableDragColumnKey === column.key ? 'is-table-dragging' : ''} ${tableDragTargetKey === column.key && tableDragColumnKey !== column.key ? 'is-table-drag-over' : ''}` : undefined}
                  draggable={columnsAreConfigurable}
                  onDragStart={(event) => handleColumnDragStart(event, column.key)}
                  onDragOver={(event) => handleColumnDragOver(event, column.key)}
                  onDragLeave={() => handleColumnDragLeave(column.key)}
                  onDrop={(event) => handleColumnDrop(event, column.key)}
                  onDragEnd={handleColumnDragEnd}
                  style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                >
                  <span className="admin-list-column-label">{column.label}</span>
                  {columnsAreConfigurable && (
                    <>
                      <span className="admin-list-column-drag-hint">Drag</span>
                      <span className="admin-list-resize-handle" onMouseDown={(event) => handleColumnResizeStart(event, column.key)} />
                    </>
                  )}
                </th>
              ))}
              {hasActions && <th style={{ width: `${actionsWidth}px`, minWidth: `${actionsWidth}px` }}>{actionsHeader}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columnSpan} className="admin-list-empty">{loadingMessage}</td></tr>
            ) : rows.length > 0 ? (
              rows.map((row) => {
                const rowId = getRowId(row);
                return (
                  <React.Fragment key={rowId}>
                    <tr className={selectedRows.includes(rowId) ? 'selected-row' : ''}>
                      <td>
                        <input type="checkbox" checked={selectedRows.includes(rowId)} onChange={() => onSelectRow(rowId)} />
                      </td>
                      {columns.map((column) => (
                        <td key={column.key} style={{ width: `${column.width}px`, minWidth: `${column.width}px`, maxWidth: `${column.width}px` }}>
                          <div className="admin-list-cell-content">{renderCell(row, column)}</div>
                        </td>
                      ))}
                      {hasActions && <td>{renderActions(row)}</td>}
                    </tr>
                    {hasExpandedRows && isRowExpanded?.(row) && (
                      <tr className="admin-list-expanded-row">
                        <td colSpan={columnSpan}>{renderExpandedRow(row)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr><td colSpan={columnSpan} className="admin-list-empty">{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {paginationLabel && (
        <div className="admin-list-pagination">
          <span className="admin-list-page-info">{paginationLabel}</span>
          <div className="admin-list-page-buttons">
            <button className="admin-list-page-btn" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>&lt;</button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`admin-list-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button className="admin-list-page-btn" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}
