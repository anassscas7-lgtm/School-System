import Swal from 'sweetalert2';

export const showTeacherPopup = ({ title, text, html, icon = 'info', confirmButtonText = 'OK' }) => {
  Swal.fire({
    title,
    text,
    html,
    icon,
    confirmButtonText,
    confirmButtonColor: '#1d4ed8',
    background: '#ffffff',
    color: '#0f172a',
    width: 460,
    customClass: {
      popup: 'teacher-swal-popup',
      title: 'teacher-swal-title',
      htmlContainer: 'teacher-swal-content',
      confirmButton: 'teacher-swal-confirm'
    }
  });
};

export const showTeacherDetails = (title, details) => {
  const rows = details
    .filter((item) => item.value !== undefined && item.value !== null)
    .map((item) => `
      <div class="teacher-swal-row">
        <span>${item.label}</span>
        <strong>${item.value || '-'}</strong>
      </div>
    `)
    .join('');

  showTeacherPopup({
    title,
    html: `<div class="teacher-swal-details">${rows}</div>`
  });
};

const escapeCsvValue = (value) => {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
};

const downloadCsv = ({ fileName, columns, rows }) => {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCsvValue(row[column.key])).join(','))
    .join('\n');
  const blob = new Blob([[header, body].filter(Boolean).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getTeacherHeaderActions = ({
  pageName,
  exportFileName,
  exportColumns = [],
  exportRows = [],
  onRefresh
}) => ({
  showEdit: false,
  showDelete: false,
  onRefresh: onRefresh || (() => window.location.reload()),
  onExport: () => {
    if (!exportRows.length || !exportColumns.length) {
      showTeacherPopup({
        title: 'Nothing to export',
        text: `There are no ${pageName.toLowerCase()} records available to export.`
      });
      return;
    }

    downloadCsv({
      fileName: exportFileName || `${pageName.toLowerCase().replace(/\s+/g, '-')}.csv`,
      columns: exportColumns,
      rows: exportRows
    });
  }
});
