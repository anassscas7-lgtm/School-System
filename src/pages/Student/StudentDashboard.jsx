import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName, isStudentClassRecord } from './studentAccess';
import { getStudentHeaderActions } from './studentHeaderActions';
import { buildStudentFeeRows, getStudentFeeSummary } from './studentFeeSummary';
import './StudentModule.css';

const StudentDashIcon = ({ type }) => {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4" /></>,
    exam: <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>,
    wallet: <><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z" /><path d="M4 7V5a2 2 0 0 1 2-2h10M16 13h4" /></>,
    id: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.7-1.4 5.3-1.4 6 0M14 10h4M14 14h4" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    school: <><path d="M3 10 12 5l9 5-9 5-9-5Z" /><path d="M6 12v5c2 2 10 2 12 0v-5" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
  };

  return (
    <svg className="sm-dash-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [fees, setFees] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [studentsRes, attendanceRes, examsRes, feesRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/attendance`).then((r) => r.json()),
          fetch(`${API_BASE}/exams`).then((r) => r.json()),
          fetch(`${API_BASE}/fees`).then((r) => r.json()),
        ]);

        const students = studentsRes.success ? studentsRes.data : [];
        const currentStudent = findCurrentStudent(students, user);
        setStudent(currentStudent);
        setAttendance(attendanceRes.success ? attendanceRes.data : []);
        setExams(examsRes.success ? examsRes.data : []);
        setFees(feesRes.success ? feesRes.data : []);
        if (currentStudent?.student_id) {
          const voucherRes = await fetch(`${API_BASE}/fee-vouchers?studentId=${currentStudent.student_id}`).then((r) => r.json());
          setVouchers(voucherRes.success ? voucherRes.data : []);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error('Student dashboard fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const myAttendance = attendance.filter((item) => Number(item.student_id) === Number(student?.student_id));
  const presentCount = myAttendance.filter((item) => item.status === 'Present').length;
  const attendancePercent = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;

  const myExams = useMemo(() => exams.filter((exam) => isStudentClassRecord(exam, student)), [exams, student]);

  const myFees = fees.filter((item) => Number(item.student_id) === Number(student?.student_id));
  const feeRows = buildStudentFeeRows(myFees, vouchers);
  const { totalPaid: paidTotal } = getStudentFeeSummary(feeRows);
  const upcomingExams = myExams
    .filter((exam) => !exam.exam_date || new Date(exam.exam_date) >= new Date(new Date().toDateString()))
    .slice(0, 3);
  const academicYear = student?.academic_year || student?.academic_session || '2025 - 2026';

  const stats = [
    {
      label: 'Attendance',
      value: `${attendancePercent}%`,
      detail: `${myAttendance.length} marked days`,
      icon: 'calendar',
      tone: 'blue',
      progress: attendancePercent
    },
    {
      label: 'Upcoming exams',
      value: upcomingExams.length,
      detail: 'For your grade',
      icon: 'exam',
      tone: 'purple'
    },
    {
      label: 'Fee paid',
      value: paidTotal,
      detail: 'PKR received',
      icon: 'wallet',
      tone: 'green'
    },
    {
      label: 'Roll no',
      value: student?.roll_no || '-',
      detail: 'Current enrollment',
      icon: 'id',
      tone: 'orange'
    }
  ];

  const quickLinks = [
    { label: 'My subjects', detail: 'View all your enrolled subjects', href: '/student/subjects', icon: 'book', tone: 'blue' },
    { label: 'Attendance', detail: 'Check your attendance record', href: '/student/attendance', icon: 'calendar', tone: 'purple' },
    { label: 'Exams', detail: 'View your exam schedule and results', href: '/student/exams', icon: 'exam', tone: 'green' },
    { label: 'Fee management', detail: 'View your fee history', href: '/student/fees', icon: 'wallet', tone: 'orange' }
  ];
  const headerActions = getStudentHeaderActions({
    pageName: 'Student dashboard',
    exportFileName: 'student-dashboard.csv',
    exportColumns: [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'detail', label: 'Detail' }
    ],
    exportRows: stats.map((item) => ({ metric: item.label, value: item.value, detail: item.detail }))
  });

  return (
    <DashboardLayout userRole="student" currentPath="/student/dashboard" userName={studentName} userInitials={initials}>
      <div className="sm-page-header sm-dashboard-header">
        <div>
          <h2>Student dashboard</h2>
          <p>{loading ? 'Loading your portal...' : `${student?.grade || 'Grade'} - Section ${student?.section || '-'}`}</p>
        </div>
        <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
      </div>

      <Header {...headerActions} />

      <div className="sm-dashboard-stats">
        {stats.map((item) => (
          <div className="sm-dashboard-stat" key={item.label}>
            <div className={`sm-dashboard-icon ${item.tone}`}>
              <StudentDashIcon type={item.icon} />
            </div>
            <div className="sm-dashboard-stat-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
              {typeof item.progress === 'number' && (
                <div className="sm-dashboard-progress">
                  <span style={{ width: `${Math.max(4, item.progress)}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sm-dashboard-grid">
        <section className="sm-panel sm-dashboard-exams">
          <div className="sm-panel-header">
            <h3>Upcoming exams</h3>
            <a href="/student/exams">View all</a>
          </div>
          {upcomingExams.length > 0 ? (
            <div className="sm-list">
              {upcomingExams.map((exam) => (
                <div className="sm-list-row" key={exam.exam_id}>
                  <div>
                    <strong>{exam.exam_title}</strong>
                    <span>{exam.subject_name || 'Subject'} | {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'Unscheduled'}</span>
                  </div>
                  <span className="sm-pill">{exam.status || 'Scheduled'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="sm-dashboard-empty">
              <div className="sm-empty-illustration">
                <StudentDashIcon type="exam" />
              </div>
              <h3>No exams scheduled</h3>
              <p>You don't have any upcoming exams for your grade.</p>
              <a href="/student/subjects">Explore subjects</a>
            </div>
          )}
        </section>

        <section className="sm-panel sm-dashboard-profile">
          <div className="sm-panel-header">
            <h3>My profile</h3>
            <a href="/student/profile">Details</a>
          </div>
          <div className="sm-dashboard-profile-grid">
            <div className="sm-dashboard-info"><StudentDashIcon type="user" /><span>Name</span><strong>{studentName}</strong></div>
            <div className="sm-dashboard-info"><StudentDashIcon type="user" /><span>Guardian</span><strong>{student?.guardian_name || '-'}</strong></div>
            <div className="sm-dashboard-info"><StudentDashIcon type="exam" /><span>Email</span><strong>{student?.email || '-'}</strong></div>
            <div className="sm-dashboard-info"><StudentDashIcon type="shield" /><span>Status</span><strong><span className="sm-pill green">{student?.status || 'Active'}</span></strong></div>
            <div className="sm-dashboard-info sm-dashboard-year"><StudentDashIcon type="school" /><span>Academic year</span><strong>{academicYear}</strong></div>
          </div>
        </section>
      </div>

      <section className="sm-dashboard-quick">
        <h3>Quick access</h3>
        <div className="sm-dashboard-quick-grid">
          {quickLinks.map((item) => (
            <a className="sm-dashboard-quick-card" href={item.href} key={item.label}>
              <div className={`sm-dashboard-icon ${item.tone}`}>
                <StudentDashIcon type={item.icon} />
              </div>
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
              <StudentDashIcon type="chevron" />
            </a>
          ))}
        </div>
      </section>

      <div className="sm-dashboard-note">
        <StudentDashIcon type="info" />
        <strong>Stay updated</strong>
        <span>Check announcements regularly and keep track of your attendance, exams and fees.</span>
      </div>
    </DashboardLayout>
  );
}
