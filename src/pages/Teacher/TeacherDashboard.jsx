import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import './TeacherModule.css';
import { API_BASE, filterAssignedClasses, filterByClassKeys, findCurrentTeacher, getClassKey, getInitials, getPakistanDateKey, getStoredUser, getTeacherName } from './teacherModuleData';
import { getTeacherHeaderActions, showTeacherPopup } from './teacherHeaderActions';

const DashboardIcon = ({ type }) => {
  const paths = {
    cap: <><path d="m22 10-10-5-10 5 10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    clipboard: <><path d="M9 5h6" /><path d="M9 3h6v4H9z" /><rect x="5" y="5" width="14" height="16" rx="2" /><path d="m9 14 2 2 4-5" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
    class: <><path d="M4 6h16v12H4z" /><path d="M8 10h8M8 14h5" /></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    seats: <><path d="M7 13V9a5 5 0 0 1 10 0v4" /><path d="M5 13h14v5H5z" /><path d="M8 18v3M16 18v3" /></>,
    arrow: <path d="M5 12h14M13 5l7 7-7 7" />
  };

  return (
    <svg className="tm-line-icon" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const EmptyExamIllustration = () => (
  <svg className="tm-empty-illustration" viewBox="0 0 260 180" fill="none" aria-hidden="true">
    <circle cx="132" cy="94" r="72" fill="#eff6ff" />
    <path d="M91 47h72c7 0 12 5 12 12v82c0 7-5 12-12 12H91c-7 0-12-5-12-12V59c0-7 5-12 12-12Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="5" />
    <path d="M107 75h42M107 99h44M107 123h32" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" />
    <path d="m91 76 7 7 11-15M91 100l7 7 11-15M91 124l7 7 11-15" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="177" cy="126" r="29" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="5" />
    <path d="m198 147 26 26" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
    <path d="M62 128c-11-17-10-32 2-46M208 55l5 9 9 5-9 5-5 9-5-9-9-5 9-5 5-9ZM55 72l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" stroke="#bfdbfe" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const normalizeStatus = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'p' || value === 'present') return 'present';
  if (value === 'a' || value === 'absent') return 'absent';
  if (value === 'l' || value === 'late') return 'late';
  return 'notMarked';
};

const goTo = (path) => {
  window.location.href = path;
};

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => getStoredUser(), []);
  const userEmail = user?.email;
  const userId = user?.id;
  const teacherName = getTeacherName(teacher);
  const teacherInitials = getInitials(teacherName);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [teachersRes, classesRes, studentsRes, attendanceRes, examsRes] = await Promise.all([
          fetch(`${API_BASE}/teachers`).then((r) => r.json()),
          fetch(`${API_BASE}/classes`).then((r) => r.json()),
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/attendance`).then((r) => r.json()),
          fetch(`${API_BASE}/exams`).then((r) => r.json()),
        ]);

        const teachers = teachersRes.success ? teachersRes.data : [];
        const matchedTeacher = findCurrentTeacher(teachers, user);

        setTeacher(matchedTeacher);
        setClasses(classesRes.success ? classesRes.data : []);
        setStudents(studentsRes.success ? studentsRes.data : []);
        setAttendance(attendanceRes.success ? attendanceRes.data : []);
        setExams(examsRes.success ? examsRes.data : []);
      } catch (error) {
        console.error('Teacher dashboard fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, userEmail, userId]);

  const assignedClasses = useMemo(() => {
    return filterAssignedClasses(classes, teacherName);
  }, [classes, teacherName]);

  const classKeys = useMemo(
    () => new Set(assignedClasses.map(getClassKey)),
    [assignedClasses]
  );

  const assignedStudents = filterByClassKeys(students, classKeys);
  const assignedStudentIds = new Set(assignedStudents.map((student) => Number(student.student_id)));
  const today = getPakistanDateKey();
  const scopedAttendance = attendance.filter((item) => assignedStudentIds.size === 0 || assignedStudentIds.has(Number(item.student_id)));
  const todayAttendance = scopedAttendance.filter((item) => getPakistanDateKey(item.attendance_date) === today);
  const attendanceSummary = todayAttendance.reduce((summary, item) => {
    const key = normalizeStatus(item.status);
    return { ...summary, [key]: summary[key] + 1 };
  }, { present: 0, absent: 0, late: 0, notMarked: Math.max(assignedStudents.length - todayAttendance.length, 0) });
  const presentToday = attendanceSummary.present;
  const upcomingExams = exams
    .filter((exam) => !exam.exam_date || new Date(exam.exam_date) >= new Date(today))
    .slice(0, 5);
  const totalAssignedSeats = assignedClasses.reduce((total, item) => total + Number(item.max_capacity || 0), 0);
  const notificationCount = upcomingExams.length + attendanceSummary.notMarked;

  const statCards = [
    {
      label: 'Assigned Classes',
      value: assignedClasses.length,
      note: 'Homeroom or co-teacher',
      icon: 'cap',
      tone: 'blue',
      spark: 'bars'
    },
    {
      label: 'My Students',
      value: assignedStudents.length,
      note: 'Across assigned classes',
      icon: 'users',
      tone: 'purple',
      spark: 'wave'
    },
    {
      label: 'Present Today',
      value: presentToday,
      note: 'Marked attendance records',
      icon: 'clipboard',
      tone: 'green',
      spark: 'wave'
    },
    {
      label: 'Upcoming Exams',
      value: upcomingExams.length,
      note: 'Scheduled from today onward',
      icon: 'calendar',
      tone: 'amber',
      spark: 'pulse'
    }
  ];
  const headerActions = getTeacherHeaderActions({
    pageName: 'Dashboard',
    exportFileName: 'teacher-dashboard.csv',
    exportColumns: [
      { key: 'label', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'note', label: 'Note' }
    ],
    exportRows: statCards.map(({ label, value, note }) => ({ label, value, note }))
  });
  const openProfile = () => showTeacherPopup({
    title: teacherName,
    html: `
      <div class="teacher-swal-details">
        <div class="teacher-swal-row"><span>Role</span><strong>Teacher</strong></div>
        <div class="teacher-swal-row"><span>Assigned classes</span><strong>${assignedClasses.length}</strong></div>
        <div class="teacher-swal-row"><span>Students</span><strong>${assignedStudents.length}</strong></div>
      </div>
    `
  });

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/dashboard" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-dashboard-shell">
      <div className="tm-dashboard-hero">
        <div>
          <h1>{getGreeting()}, {teacherName}!</h1>
          <p>{loading ? 'Loading your workspace...' : "Here's what's happening in your classes today."}</p>
        </div>
        <div className="tm-hero-actions">
          <button
            className="tm-notification-btn"
            type="button"
            aria-label="Notifications"
            onClick={() => showTeacherPopup({
              title: 'Notifications',
              text: notificationCount ? `You have ${notificationCount} dashboard updates to review.` : 'No new notifications right now.'
            })}
          >
            <DashboardIcon type="bell" />
            {notificationCount > 0 && <span />}
          </button>
          <button className="tm-profile-chip tm-dashboard-profile" type="button" onClick={openProfile}>{teacherInitials}</button>
        </div>
      </div>
      <Header {...headerActions} />

      <div className="tm-dashboard-stats">
        {statCards.map((card) => (
          <article className={`tm-dashboard-stat ${card.tone}`} key={card.label}>
            <div className="tm-stat-icon"><DashboardIcon type={card.icon} /></div>
            <div className="tm-stat-copy">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </div>
            <div className={`tm-stat-spark ${card.spark}`} aria-hidden="true">
              <i /><i /><i /><i />
            </div>
          </article>
        ))}
      </div>

      <div className="tm-dashboard-grid">
        <section className="tm-dashboard-panel tm-classes-panel">
          <div className="tm-dashboard-panel-header">
            <div className="tm-panel-title">
              <span><DashboardIcon type="class" /></span>
              <h2>My Classes</h2>
            </div>
            <button className="tm-panel-link" type="button" onClick={() => goTo('/teacher/classes')}>View all <DashboardIcon type="arrow" /></button>
          </div>
          <div className="tm-class-list">
            {assignedClasses.length > 0 ? assignedClasses.slice(0, 4).map((item, index) => (
              <button
                className="tm-class-card"
                key={item.class_id}
                type="button"
                onClick={() => showTeacherPopup({
                  title: `${item.grade} - Section ${item.section}`,
                  html: `
                    <div class="teacher-swal-details">
                      <div class="teacher-swal-row"><span>Room</span><strong>${item.room_number || 'N/A'}</strong></div>
                      <div class="teacher-swal-row"><span>Academic year</span><strong>${item.academic_year || 'Current year'}</strong></div>
                      <div class="teacher-swal-row"><span>Seats</span><strong>${item.max_capacity || 0}</strong></div>
                    </div>
                  `
                })}
              >
                <span className={`tm-class-icon color-${index % 4}`}><DashboardIcon type="class" /></span>
                <div>
                  <strong>{item.grade} - Section {item.section}</strong>
                  <span>Room {item.room_number || 'N/A'} <em>|</em> {item.academic_year || 'Current year'}</span>
                </div>
                <b>{item.max_capacity || 0} seats</b>
              </button>
            )) : <div className="tm-empty">No classes assigned yet.</div>}
          </div>
          <div className="tm-seat-total">
            <span><DashboardIcon type="seats" /> Total Assigned Seats</span>
            <strong>{totalAssignedSeats} seats</strong>
          </div>
        </section>

        <section className="tm-dashboard-panel tm-exams-panel">
          <div className="tm-dashboard-panel-header">
            <div className="tm-panel-title">
              <span><DashboardIcon type="calendar" /></span>
              <h2>Upcoming Exams</h2>
            </div>
            <button className="tm-panel-link" type="button" onClick={() => goTo('/teacher/exams')}>View all <DashboardIcon type="arrow" /></button>
          </div>
          {upcomingExams.length > 0 ? (
            <div className="tm-exam-list">
              {upcomingExams.map((exam) => (
                <div className="tm-exam-card" key={exam.exam_id}>
                  <span><DashboardIcon type="calendar" /></span>
                  <div>
                    <strong>{exam.exam_title}</strong>
                    <p>{exam.subject_name || 'Subject'} | {exam.grade || 'Class'} {exam.section || ''}</p>
                  </div>
                  <b>{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'Unscheduled'}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="tm-empty-exams">
              <EmptyExamIllustration />
              <h3>No upcoming exams found</h3>
              <p>You don't have any exams scheduled from today onward.</p>
            </div>
          )}
        </section>
      </div>
      </div>
    </DashboardLayout>
  );
}
