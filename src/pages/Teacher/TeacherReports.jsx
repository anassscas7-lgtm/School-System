import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import './TeacherModule.css';
import { API_BASE, findCurrentTeacher, getInitials, getStoredUser, getTeacherName } from './teacherModuleData';
import { showTeacherPopup } from './teacherHeaderActions';

const reportFallbacks = [
  { report_id: 'academic-05292026', report_name: 'ACADEMIC Export - 5/29/2026', report_type: 'Academic', format: 'PDF', file_name: 'academic_5_29_2026.pdf', created_at: '2026-05-29T10:30:00' },
  { report_id: 'academic-05292026-b', report_name: 'ACADEMIC Export - 5/29/2026', report_type: 'Academic', format: 'PDF', file_name: 'academic_5_29_2026.pdf', created_at: '2026-05-28T10:30:00' },
  { report_id: 'fees-05282026', report_name: 'FEES Export - 5/28/2026', report_type: 'Fees', format: 'Excel', file_name: 'fees_5_28_2026.xlsx', created_at: '2026-05-28T09:15:00' },
  { report_id: 'attendance-05072026', report_name: 'ATTENDANCE Export - 5/7/2026', report_type: 'Attendance', format: 'PDF', file_name: 'attendance_5_7_2026.pdf', created_at: '2026-05-07T16:45:00' },
  { report_id: 'fees-05072026', report_name: 'FEES Export - 5/7/2026', report_type: 'Fees', format: 'PDF', file_name: 'fees_5_7_2026.pdf', created_at: '2026-05-07T14:20:00' },
  { report_id: 'attendance-05072026-b', report_name: 'ATTENDANCE Export - 5/7/2026', report_type: 'Attendance', format: 'PDF', file_name: 'attendance_5_7_2026.pdf', created_at: '2026-05-07T12:45:00' },
  { report_id: 'fees-05072026-b', report_name: 'FEES Export - 5/7/2026', report_type: 'Fees', format: 'PDF', file_name: 'fees_5_7_2026.pdf', created_at: '2026-05-07T11:20:00' },
  { report_id: 'fees-05072026-c', report_name: 'FEES Export - 5/7/2026', report_type: 'Fees', format: 'PDF', file_name: 'fees_5_7_2026.pdf', created_at: '2026-05-07T09:20:00' },
  { report_id: 'attendance-05072026-c', report_name: 'ATTENDANCE Export - 5/7/2026', report_type: 'Attendance', format: 'Excel', file_name: 'attendance_5_7_2026.xlsx', created_at: '2026-05-06T16:45:00' },
  { report_id: 'fees-05062026', report_name: 'FEES Export - 5/7/2026', report_type: 'Fees', format: 'PDF', file_name: 'fees_5_7_2026.pdf', created_at: '2026-05-06T14:20:00' }
];

const ReportPageIcon = ({ type }) => {
  const paths = {
    chart: <><path d="M5 20V10" /><path d="M12 20V4" /><path d="M19 20v-7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>,
    fileExcel: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="m9 12 6 6M15 12l-6 6" /></>
  };

  return (
    <svg className="tm-rep-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const formatReportDate = (value) => {
  if (!value) return { date: 'No date', time: '' };
  const date = new Date(value);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  };
};

export default function TeacherReports() {
  const [recentReports, setRecentReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherInitials, setTeacherInitials] = useState('TR');
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const user = getStoredUser();
      const [recentRes, teachersRes] = await Promise.all([
        fetch(`${API_BASE}/reports/recent`).then((r) => r.json()),
        fetch(`${API_BASE}/teachers`).then((r) => r.json()),
      ]);
      const name = getTeacherName(findCurrentTeacher(teachersRes.success ? teachersRes.data : [], user));
      setTeacherName(name);
      setTeacherInitials(getInitials(name));
      setRecentReports(recentRes.success ? recentRes.data : []);
    } catch (error) {
      console.error('Teacher reports fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const reportLoadTimer = window.setTimeout(() => {
      fetchReports();
    }, 0);

    return () => window.clearTimeout(reportLoadTimer);
  }, [fetchReports]);

  const reportRows = recentReports.length > 0 ? recentReports : reportFallbacks;
  const reportAccentClasses = ['blue', 'green', 'blue', 'blue', 'blue', 'green', 'blue', 'blue', 'blue', 'green'];

  const getFormat = (report) => report.format || 'PDF';
  const getReportDate = (report) => formatReportDate(report.created_at).date;
  const isExcelReport = (report) => getFormat(report).toLowerCase().includes('excel');

  const toggleReportSelection = (reportId) => {
    setSelectedReports((current) => current.includes(reportId)
      ? current.filter((id) => id !== reportId)
      : [...current, reportId]);
  };

  const downloadReport = (report) => {
    const csvContent = [
      'Report Name,Type,Format,Created',
      `"${report.report_name}","${report.report_type || 'Report'}","${getFormat(report)}","${report.created_at || ''}"`
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.file_name || `${String(report.report_name || 'report').replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportSelected = () => {
    const selected = reportRows.filter((report) => selectedReports.includes(report.report_id));
    if (!selected.length) {
      showTeacherPopup({
        title: 'No reports selected',
        text: 'Select at least one report card first.'
      });
      return;
    }
    selected.forEach(downloadReport);
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportName: `TEACHER Export - ${new Date().toLocaleDateString()}`,
          reportType: 'teacher',
          format: 'PDF',
          generatedBy: teacherName
        })
      });
      const data = await response.json();
      if (data.success) {
        showTeacherPopup({
          title: 'Generated',
          text: 'Report generated successfully.',
          icon: 'success'
        });
        fetchReports();
      } else {
        showTeacherPopup({
          title: 'Error',
          text: data.message || 'Could not generate report.',
          icon: 'error'
        });
      }
    } catch {
      showTeacherPopup({
        title: 'Error',
        text: 'Server connection failed.',
        icon: 'error'
      });
    }
  };

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/reports" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-rep-page">
        <div className="tm-rep-header">
          <div>
            <h1>Reports</h1>
            <p>Generate and view school data exports</p>
          </div>
          <div className="tm-rep-header-actions">
            <button className="tm-rep-generate-btn" type="button" onClick={handleGenerateReport}>
              <ReportPageIcon type="download" />
              Generate report
            </button>
            <div className="tm-profile-chip tm-rep-profile">{teacherInitials}</div>
          </div>
        </div>

        <Header
          showEdit={false}
          showDelete={false}
          onRefresh={fetchReports}
          onExport={handleExportSelected}
        />

        <section className="tm-rep-board">
          {loading ? (
            <div className="tm-empty">Loading reports...</div>
          ) : (
            <div className="tm-rep-card-grid">
              {reportRows.map((report, index) => {
                const selected = selectedReports.includes(report.report_id);
                const format = getFormat(report);
                return (
                  <article className={`tm-rep-report-card ${selected ? 'selected' : ''}`} key={report.report_id}>
                    <div className="tm-rep-card-top">
                      <span className={`tm-rep-report-icon ${reportAccentClasses[index % reportAccentClasses.length]}`}>
                        <ReportPageIcon type={isExcelReport(report) ? 'fileExcel' : 'file'} />
                      </span>
                      <input
                        className="tm-rep-card-check"
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleReportSelection(report.report_id)}
                        aria-label={`Select ${report.report_name}`}
                      />
                    </div>
                    <div className="tm-rep-card-copy">
                      <h4>{report.report_name}</h4>
                      <p>{report.report_type || 'Report'} Report</p>
                    </div>
                    <div className="tm-rep-card-meta">
                      <span>{format}</span>
                      <span>{getReportDate(report)}</span>
                    </div>
                    <div className="tm-rep-card-footer">
                      <div className="tm-rep-card-dots"><span /><span /><span /></div>
                      <button className="tm-rep-card-link" type="button" onClick={() => downloadReport(report)}>Download</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
