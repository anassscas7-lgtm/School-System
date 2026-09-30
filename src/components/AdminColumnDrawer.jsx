import React from 'react';
import './AdminColumnDrawer.css';

export default function AdminColumnDrawer({
  isOpen,
  title = 'Configure View',
  description,
  searchTerm,
  onSearchChange,
  columns,
  visibleCount,
  onVisibleFirst,
  onClose,
  onApply,
  onToggleColumn,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedColumnKey,
  dragOverColumnKey,
  searchIcon,
  visibleIcon,
  hiddenIcon,
  gripIcon,
  headerIcon,
  variant = 'drawer',
  totalLabel,
  helperText,
  onReset
}) {
  if (!isOpen) return null;

  const isShowcase = variant === 'showcase';

  return (
    <div className={`admin-column-overlay ${isShowcase ? 'is-showcase' : ''}`}>
      <aside className={`admin-column-drawer ${isShowcase ? 'is-showcase' : ''}`} aria-label={title}>
        <div className="admin-column-header">
          <div className="admin-column-title-wrap">
            {headerIcon && <div className="admin-column-header-icon">{headerIcon}</div>}
            <div>
              <h2>{title}</h2>
              {description && <p>{description}</p>}
            </div>
          </div>
          <button className="admin-column-close" type="button" onClick={onClose} aria-label="Close configure view">x</button>
        </div>

        <div className="admin-column-search">
          {searchIcon}
          <input
            type="text"
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="admin-column-list-header">
          <div className="admin-column-list-title">
            <span>Columns</span>
            {totalLabel && <strong>{totalLabel}</strong>}
          </div>
          <button type="button" onClick={onVisibleFirst}>Visible first ({visibleCount})</button>
        </div>

        <div className="admin-column-list">
          {columns.map((column) => (
            <div
              className={`admin-column-row ${draggedColumnKey === column.key ? 'is-dragging' : ''} ${dragOverColumnKey === column.key && draggedColumnKey !== column.key ? 'is-drag-over' : ''}`}
              key={column.key}
              draggable
              onDragStart={(event) => onDragStart(event, column.key)}
              onDragOver={(event) => onDragOver(event, column.key)}
              onDragLeave={() => onDragLeave(column.key)}
              onDrop={(event) => onDrop(event, column.key)}
              onDragEnd={onDragEnd}
            >
              <button
                className={`admin-column-visibility ${column.visible ? 'visible' : 'hidden'}`}
                type="button"
                onClick={() => onToggleColumn(column.key)}
                aria-label={`${column.visible ? 'Hide' : 'Show'} ${column.label}`}
              >
                {column.visible ? visibleIcon : hiddenIcon}
              </button>
              <span className="admin-column-row-label">{column.label}</span>
              <button
                className="admin-column-grip"
                type="button"
                draggable
                onDragStart={(event) => onDragStart(event, column.key)}
                onDragEnd={onDragEnd}
                aria-label={`Drag ${column.label}`}
              >
                {gripIcon}
              </button>
            </div>
          ))}
        </div>

        {helperText && (
          <div className="admin-column-helper">
            {headerIcon}
            <span>{helperText}</span>
          </div>
        )}

        <div className="admin-column-footer">
          {onReset && <button className="admin-column-reset" type="button" onClick={onReset}>Reset to default</button>}
          <div className="admin-column-footer-actions">
            <button className="admin-column-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="admin-column-apply" type="button" onClick={onApply}>Apply Changes</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
