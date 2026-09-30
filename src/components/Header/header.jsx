import React from 'react';
import Swal from 'sweetalert2';
import './header.css';

/* Professional SVGs matching the D365 vibe */
const SvgEdit = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const SvgRefresh = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const SvgDelete = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

/* Naya Export Icon */
const SvgExport = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
  </svg>
);

export default function Header({ onEdit, onRefresh, onDelete, onExport, showEdit = true, showDelete = true }) {
  const fallbackAction = (label) => () => {
    Swal.fire({
      icon: 'info',
      title: `${label} action`,
      text: 'Select a record or use the page-specific controls to continue.',
      confirmButtonColor: '#2563eb'
    });
  };

  return (
    <div className="action-header-bar">
      {showEdit && (
        <>
          <button className="action-btn" onClick={onEdit || fallbackAction('Edit')}>
            <SvgEdit /> Edit
          </button>

          <div className="action-divider"></div>
        </>
      )}
      
      <button className="action-btn" onClick={onRefresh || fallbackAction('Refresh')}>
        <SvgRefresh /> Refresh
      </button>

      {showDelete && <div className="action-divider"></div>}
      
      {showDelete && (
        <button className="action-btn delete-btn" onClick={onDelete || fallbackAction('Delete')}>
          <SvgDelete /> Delete
        </button>
      )}

      {/* 👇 Yahan marginLeft: 'auto' lagaya hai taake ye right side pe chala jaye 👇 */}
      <button 
        className="action-btn export-btn" 
        onClick={onExport || fallbackAction('Export')} 
        style={{ marginLeft: 'auto' }}
      >
        <SvgExport /> Export
      </button>
    </div>
  );
}
