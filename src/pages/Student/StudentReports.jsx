import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName, isStudentClassRecord } from './studentAccess';
import { getStudentHeaderActions } from './studentHeaderActions';
import { buildStudentFeeRows, getStudentFeeSummary } from './studentFeeSummary';
import './StudentModule.css';

const ReportIcon = ({ type }) => {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4" /></>,
    wallet: <><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z" /><path d="M4 7V5a2 2 0 0 1 2-2h10M16 13h4" /></>,
    document: <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>,
    class: <><path d="M3 10 12 5l9 5-9 5-9-5Z" /><path d="M6 12v5c2 2 10 2 12 0v-5" /></>
  };

  return (
    <svg className="sm-report-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentReports() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [studentsRes, attendanceRes, feesRes, examsRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/attendance`).then((r) => r.json()),
          fetch(`${API_BASE}/fees`).then((r) => r.json()),
          fetch(`${API_BASE}/exams`).then((r) => r.json()),
        ]);

        const currentStudent = studentsRes.success ? findCurrentStudent(studentsRes.data, user) : null;
        setStudent(currentStudent);

        const attendanceRows = attendanceRes.success ? attendanceRes.data : [];
        const feeRows = feesRes.success ? feesRes.data : [];
        const examRows = examsRes.success ? examsRes.data : [];

        setAttendance(attendanceRows.filter((item) => Number(item.student_id) === Number(currentStudent?.student_id)));
        setFees(feeRows.filter((item) => Number(item.student_id) === Number(currentStudent?.student_id)));
        setExams(examRows.filter((item) => isStudentClassRecord(item, currentStudent)));
        if (currentStudent?.student_id) {
          const voucherRes = await fetch(`${API_BASE}/fee-vouchers?studentId=${currentStudent.student_id}`).then((r) => r.json());
          setVouchers(voucherRes.success ? voucherRes.data : []);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error('Student reports fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const present = attendance.filter((item) => item.status === 'Present').length;
  const attendancePercent = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
  const feeRows = buildStudentFeeRows(fees, vouchers);
  const { totalPaid, totalDue } = getStudentFeeSummary(feeRows);
  const reportStats = [
    { label: 'Attendance report', value: `${attendancePercent}%`, detail: `${attendance.length} marked days`, icon: 'calendar', tone: 'blue' },
    { label: 'Fee report', value: totalPaid, detail: 'PKR paid', icon: 'wallet', tone: 'green' },
    { label: 'Exam report', value: exams.length, detail: 'Scheduled for your class', icon: 'document', tone: 'purple' },
    { label: 'Class', value: student?.grade || '-', detail: `Section ${student?.section || '-'}`, icon: 'class', tone: 'orange' }
  ];

  const summaries = [
    {
      title: 'Attendance summary',
      detail: `${present} present days out of ${attendance.length} records`,
      badge: `${attendancePercent}%`,
      icon: 'calendar',
      tone: 'blue',
      badgeTone: ''
    },
    {
      title: 'Fee payment summary',
      detail: `${feeRows.length} fee records connected to your profile`,
      badge: totalDue > 0 ? `PKR ${totalDue} due` : `PKR ${totalPaid} paid`,
      icon: 'wallet',
      tone: 'green',
      badgeTone: 'green'
    },
    {
      title: 'Exam schedule summary',
      detail: `${exams.length} exams found for your grade and section`,
      badge: 'View only',
      icon: 'document',
      tone: 'purple',
      badgeTone: ''
    }
  ];
  const headerActions = getStudentHeaderActions({
    pageName: 'My reports',
    exportFileName: 'student-reports.csv',
    exportColumns: [
      { key: 'title', label: 'Summary' },
      { key: 'detail', label: 'Detail' },
      { key: 'badge', label: 'Value' }
    ],
    exportRows: summaries
  });

  return (
    <DashboardLayout userRole="student" currentPath="/student/reports" userName={studentName} userInitials={initials}>
      <div className="student-reports-page">
        <div className="sm-page-header">
          <div>
            <h2>My reports</h2>
            <p>Personal academic, attendance, and fee summary</p>
          </div>
          <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
        </div>

        <Header {...headerActions} />

        <div className="sm-report-stats">
          {reportStats.map((item) => (
            <div className="sm-report-stat" key={item.label}>
              <span className={`sm-report-stat-icon ${item.tone}`}><ReportIcon type={item.icon} /></span>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </div>
            </div>
          ))}
        </div>

        <section className="sm-report-panel">
          <div className="sm-report-panel-header">
            <h3>Available summaries</h3>
          </div>
          {loading ? (
            <div className="sm-empty">Loading reports...</div>
          ) : student ? (
            <div className="sm-report-summary-list">
              {summaries.map((item) => (
                <div className="sm-report-summary-row" key={item.title}>
                  <span className={`sm-report-summary-icon ${item.tone}`}><ReportIcon type={item.icon} /></span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <span className={`sm-pill ${item.badgeTone}`}>{item.badge}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="sm-empty">No student profile is linked with this login account.</div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
