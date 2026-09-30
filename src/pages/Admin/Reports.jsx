import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import './reports.css';

const SvgDownload = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
  </svg>
);

const SvgFilePdf = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 2H6v20h12V6l-4-4zM14 2v4h4" />
    <path d="M8 15h8M8 18h5" />
  </svg>
);

const SvgFileExcel = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 2H6v20h12V6l-4-4zM14 2v4h4M9 11l5 6M14 11l-5 6" />
  </svg>
);

const ReportLineIcon = ({ type }) => {
  const paths = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    report: <><path d="M14 2H6v20h12V6l-4-4Z" /><path d="M14 2v4h4M9 17v-5M12 17v-8M15 17v-3" /></>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    file: <><path d="M14 2H6v20h12V6l-4-4Z" /><path d="M14 2v4h4M9 14h6M9 18h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
  };

  return (
    <svg className="rep-line-icon" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function Reports() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedType, setSelectedType] = useState('attendance');
  const [exportFormat, setExportFormat] = useState('PDF');

  const fetchData = async () => {
    try {
      const snapRes = await fetch('/api/reports/snapshot').then((r) => r.json());
      const recentRes = await fetch('/api/reports/recent').then((r) => r.json());
      if (snapRes.success) setSnapshot(snapRes.data);
      if (recentRes.success) setRecentReports(recentRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setSelectedReports([]);
    await fetchData();
    Swal.fire({
      icon: 'success',
      title: 'Reports refreshed',
      showConfirmButton: false,
      timer: 900
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportName: `${selectedType.toUpperCase()} Export - ${new Date().toLocaleDateString()}`,
          reportType: selectedType,
          format: exportFormat,
          generatedBy: 'System Admin'
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchData();
        Swal.fire({ icon: 'success', title: 'Generated', showConfirmButton: false, timer: 1500 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('EduSync Official Report', 105, 20, { align: 'center' });
    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['ID', report.report_id],
        ['Name', report.report_name],
        ['Type', report.report_type],
        ['Date', new Date(report.created_at).toLocaleString()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });
    doc.save(`${report.report_name}.pdf`);
  };

  const downloadCSV = (report) => {
    const filename = `${report.report_name.replace(/\s+/g, '_')}.csv`;
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['ID,Name,Type,Date', `${report.report_id},${report.report_name},${report.report_type},${report.created_at}`].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = filename;
    link.click();
  };

  const getFormat = (report) => report.format || 'PDF';
  const getReportDate = (report) => {
    if (!report.created_at) return '-';
    return new Date(report.created_at).toLocaleDateString();
  };

  const handleSelectReport = (reportId) => {
    setSelectedReports((prev) => (
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    ));
  };

  const handleExportReports = () => {
    if (selectedReports.length === 0) {
      Swal.fire('No reports selected', 'Select at least one report first.', 'info');
      return;
    }
    const selected = recentReports.filter((report) => selectedReports.includes(report.report_id));
    selected.forEach((report) => {
      getFormat(report).toLowerCase().includes('excel') ? downloadCSV(report) : generatePDF(report);
    });
  };

  const handleDeleteReports = async () => {
    if (selectedReports.length === 0) {
      Swal.fire('No reports selected', 'Select reports to remove from this list.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete selected reports?',
      text: `This will delete ${selectedReports.length} generated report record(s) from the database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/reports/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedReports })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Could not delete reports.');

      setSelectedReports([]);
      await fetchData();
      Swal.fire('Deleted', data.message, 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const templateReports = [
    { report_id: 'template-attendance', report_name: 'Attendance Summary', report_type: 'attendance', format: 'PDF', created_at: new Date().toISOString() },
    { report_id: 'template-fees', report_name: 'Fee Collection', report_type: 'fees', format: 'Excel', created_at: new Date().toISOString() },
    { report_id: 'template-academic', report_name: 'Academic Progress', report_type: 'academic', format: 'PDF', created_at: new Date().toISOString() },
    { report_id: 'template-classes', report_name: 'Class Capacity', report_type: 'classes', format: 'PDF', created_at: new Date().toISOString() },
    { report_id: 'template-students', report_name: 'Student Directory', report_type: 'students', format: 'Excel', created_at: new Date().toISOString() },
    { report_id: 'template-teachers', report_name: 'Teacher Workload', report_type: 'teachers', format: 'PDF', created_at: new Date().toISOString() },
    { report_id: 'template-subjects', report_name: 'Subject Coverage', report_type: 'subjects', format: 'PDF', created_at: new Date().toISOString() },
    { report_id: 'template-snapshot', report_name: 'School Snapshot', report_type: 'overview', format: 'PDF', created_at: new Date().toISOString() }
  ];
  const displayReports = recentReports.length > 0 ? recentReports : templateReports;
  const filteredCards = displayReports;
  const reportAccentClasses = ['pink', 'green', 'blue', 'orange', 'purple', 'cyan', 'rose', 'indigo'];

  return (
    <DashboardLayout userRole="admin" currentPath="/reports" userName="System Admin" userInitials="SA">
      <div className="rep-page-header">
        <div className="rep-header-left">
          <h2>Reports</h2>
          <p>Generate and view school data exports</p>
        </div>
        <div className="rep-header-right">
          <button className="rep-btn-primary" onClick={() => setIsModalOpen(true)}>
            <SvgDownload />
            Generate report
          </button>
          <div className="rep-avatar">SA</div>
        </div>
      </div>

      <Header
        onEdit={() => {
          const report = recentReports.find((item) => item.report_id === selectedReports[0]);
          selectedReports.length === 1 && report
            ? Swal.fire(report.report_name, `${getFormat(report)} - ${getReportDate(report)}`, 'info')
            : Swal.fire('Select one report', 'Choose exactly one report checkbox, then click Edit.', 'info');
        }}
        onRefresh={handleRefresh}
        onDelete={handleDeleteReports}
        onExport={handleExportReports}
      />

      <section className="rep-board">
        <div className="rep-card-grid">
          {filteredCards.map((report, index) => {
            const format = getFormat(report);
            const isExcel = format.toLowerCase().includes('excel');
            const isRealReport = typeof report.report_id === 'number';
            const selected = selectedReports.includes(report.report_id);
            return (
              <article className={`rep-report-card ${selected ? 'selected' : ''}`} key={report.report_id}>
                <div className="rep-card-top">
                  <span className={`rep-report-icon ${reportAccentClasses[index % reportAccentClasses.length]}`}>
                    {isExcel ? <SvgFileExcel /> : <SvgFilePdf />}
                  </span>
                  {isRealReport && (
                    <input
                      className="rep-card-check"
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleSelectReport(report.report_id)}
                      aria-label={`Select ${report.report_name}`}
                    />
                  )}
                </div>
                <div className="rep-card-copy">
                  <h4>{report.report_name}</h4>
                  <p>{report.report_type || 'Report'} report</p>
                </div>
                <div className="rep-card-meta">
                  <span>{format}</span>
                  <span>{getReportDate(report)}</span>
                </div>
                <div className="rep-card-footer">
                  <div className="rep-card-users">
                    <span />
                    <span />
                    <span />
                  </div>
                  <button
                    className="rep-card-link"
                    type="button"
                    onClick={() => {
                      if (isRealReport) {
                        isExcel ? downloadCSV(report) : generatePDF(report);
                      } else {
                        setSelectedType(report.report_type || 'attendance');
                        setExportFormat(format);
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    {isRealReport ? 'Download' : 'Create'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {isModalOpen && (
        <div className="rep-modal-overlay">
          <div className="rep-modal rep-generate-modal">
            <div className="rep-modal-header">
              <div className="rep-modal-title-group">
                <div className="rep-modal-icon"><ReportLineIcon type="report" /></div>
                <div className="rep-modal-title">
                  <h2>Generate Report</h2>
                  <p>Create a fresh school data export.</p>
                </div>
              </div>
              <button className="rep-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close report form">
                <ReportLineIcon type="close" />
              </button>
            </div>
            <div className="rep-modal-body">
              <div className="rep-modal-card">
                <div className="rep-option-block">
                  <span className="rep-option-icon"><ReportLineIcon type="list" /></span>
                  <div className="rep-option-content">
                    <h3>Report Type</h3>
                    <p>Select the type of report you want to generate.</p>
                    <div className="rep-select-shell">
                      <ReportLineIcon type="calendar" />
                      <select className="rep-input" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                        <option value="attendance">Attendance</option>
                        <option value="fees">Fees</option>
                        <option value="academic">Academic</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rep-option-block">
                  <span className="rep-option-icon"><ReportLineIcon type="file" /></span>
                  <div className="rep-option-content">
                    <h3>Export Format</h3>
                    <p>Choose the format for your exported report.</p>
                    <div className="rep-select-shell">
                      <ReportLineIcon type="file" />
                      <select className="rep-input" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                        <option value="PDF">PDF Document</option>
                        <option value="Excel">Excel Sheet</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rep-info-banner">
                <ReportLineIcon type="info" />
                <span>Reports are saved to recent exports.</span>
              </div>
            </div>
            <div className="rep-modal-footer">
              <div className="rep-footer-actions">
                <button className="rep-btn-discard" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="rep-btn-publish" onClick={handleGenerate} disabled={loading}>
                  <SvgDownload /> {loading ? 'Wait...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
