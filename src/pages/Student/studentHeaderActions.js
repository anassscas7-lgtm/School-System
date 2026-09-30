import Swal from 'sweetalert2';

export const showStudentPopup = ({ title, text, html, icon = 'info', confirmButtonText = 'OK' }) => {
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
      popup: 'student-swal-popup',
      title: 'student-swal-title',
      htmlContainer: 'student-swal-content',
      confirmButton: 'student-swal-confirm'
    }
  });
};

export const showStudentDetails = (title, details) => {
  const rows = details
    .filter((item) => item.value !== undefined && item.value !== null)
    .map((item) => `
      <div class="student-swal-row">
        <span>${item.label}</span>
        <strong>${item.value || '-'}</strong>
      </div>
    `)
    .join('');

  showStudentPopup({
    title,
    html: `<div class="student-swal-details">${rows}</div>`,
    icon: 'info'
  });
};

const escapeCsvValue = (value) => {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const downloadCsv = (fileName, columns, rows) => {
  const safeColumns = columns.length > 0 ? columns : [{ key: 'value', label: 'Value' }];
  const header = safeColumns.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows.map((row) => safeColumns.map((column) => escapeCsvValue(row[column.key])).join(',')).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getStudentHeaderActions = ({ pageName, exportFileName, exportColumns = [], exportRows = [] }) => ({
  showEdit: false,
  showDelete: false,
  onRefresh: () => window.location.reload(),
  onExport: () => {
    if (!exportRows.length) {
      showStudentPopup({
        title: 'No data to export',
        text: `No ${pageName.toLowerCase()} data is available to export.`
      });
      return;
    }
    downloadCsv(exportFileName || `${pageName.toLowerCase().replace(/\s+/g, '-')}.csv`, exportColumns, exportRows);
  }
});
