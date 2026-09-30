import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName } from './studentAccess';
import StudentListView from './StudentListView';
import { getStudentHeaderActions, showStudentDetails } from './studentHeaderActions';
import './StudentModule.css';

const AttendanceIcon = ({ type }) => {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4" /></>,
    present: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    absent: <><circle cx="10" cy="8" r="4" /><path d="M3 21a7 7 0 0 1 12 0" /><path d="m17 10 4 4M21 10l-4 4" /></>,
    late: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    dots: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="sm-attendance-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentAttendance() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const [studentsRes, attendanceRes, teachersRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/attendance`).then((r) => r.json()),
          fetch(`${API_BASE}/teachers`).then((r) => r.json()),
        ]);
        const currentStudent = studentsRes.success ? findCurrentStudent(studentsRes.data, user) : null;
        setStudent(currentStudent);
        const records = attendanceRes.success ? attendanceRes.data : [];
        setAttendance(records.filter((item) => Number(item.student_id) === Number(currentStudent?.student_id)));
        setTeachers(teachersRes.success ? teachersRes.data : []);
      } catch (error) {
        console.error('Student attendance fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const present = attendance.filter((item) => item.status === 'Present').length;
  const absent = attendance.filter((item) => item.status === 'Absent').length;
  const late = attendance.filter((item) => item.status === 'Late').length;
  const percent = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  const getMarkedByName = (markedBy) => {
    if (!markedBy) return '-';

    const teacher = teachers.find((item) => Number(item.teacher_id) === Number(markedBy));
    if (teacher) {
      return `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email || `Teacher ${markedBy}`;
    }

    return String(markedBy);
  };

  const filteredAttendance = attendance.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.status?.toLowerCase().includes(query) ||
      item.remarks?.toLowerCase().includes(query) ||
      getMarkedByName(item.marked_by).toLowerCase().includes(query)
    );
  });

  const columns = [
    { key: 'date', label: 'Date', defaultWidth: 200, visible: true },
    { key: 'status', label: 'Status', defaultWidth: 220, visible: true },
    { key: 'remarks', label: 'Remarks', defaultWidth: 300, visible: true },
    { key: 'markedBy', label: 'Marked by', defaultWidth: 260, visible: true }
  ];
  const headerActions = getStudentHeaderActions({
    pageName: 'Attendance',
    exportFileName: 'student-attendance.csv',
    exportColumns: [
      { key: 'dateLabel', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'remarks', label: 'Remarks' },
      { key: 'markedByLabel', label: 'Marked by' }
    ],
    exportRows: filteredAttendance.map((item) => ({
      ...item,
      dateLabel: item.attendance_date ? new Date(item.attendance_date).toLocaleDateString() : '-',
      remarks: item.remarks || '-',
      markedByLabel: getMarkedByName(item.marked_by)
    }))
  });

  const renderCell = (item, column) => {
    switch (column.key) {
      case 'date':
        return item.attendance_date ? new Date(item.attendance_date).toLocaleDateString() : '-';
      case 'status':
        return <span className={`sm-attendance-status ${item.status === 'Present' ? 'present' : item.status === 'Absent' ? 'absent' : 'late'}`}><span />{item.status}</span>;
      case 'remarks':
        return item.remarks || '-';
      case 'markedBy':
        return getMarkedByName(item.marked_by);
      default:
        return '-';
    }
  };

  return (
    <DashboardLayout userRole="student" currentPath="/student/attendance" userName={studentName} userInitials={initials}>
      <div className="student-attendance-page">
        <div className="sm-page-header">
          <div>
            <h2>Attendance</h2>
            <p>Your attendance record and daily status history</p>
          </div>
          <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
        </div>

        <Header {...headerActions} />

        <div className="sm-attendance-stats">
          <div className="sm-attendance-stat">
            <span className="sm-attendance-stat-icon blue"><AttendanceIcon type="calendar" /></span>
            <div><span>Attendance</span><strong>{percent}%</strong><small>Overall present rate</small><div className="sm-dashboard-progress"><span style={{ width: `${Math.max(4, percent)}%` }} /></div></div>
          </div>
          <div className="sm-attendance-stat">
            <span className="sm-attendance-stat-icon green"><AttendanceIcon type="present" /></span>
            <div><span>Present</span><strong>{present}</strong><small>Total present days</small></div>
          </div>
          <div className="sm-attendance-stat">
            <span className="sm-attendance-stat-icon orange"><AttendanceIcon type="absent" /></span>
            <div><span>Absent</span><strong>{absent}</strong><small>Total absent days</small></div>
          </div>
          <div className="sm-attendance-stat">
            <span className="sm-attendance-stat-icon red"><AttendanceIcon type="late" /></span>
            <div><span>Late</span><strong>{late}</strong><small>Late arrivals</small></div>
          </div>
        </div>

        <StudentListView
          storageKey="student-attendance-columns-v2"
          columnDefinitions={columns}
          rows={filteredAttendance}
          getRowId={(item) => item.attendance_id}
          renderCell={renderCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search attendance..."
          emptyMessage="No attendance records found."
          itemLabel="records"
          actionsHeader=""
          actionsWidth={72}
          renderActions={(item) => (
            <button
              className="sm-attendance-action"
              type="button"
              aria-label="Attendance options"
              onClick={() => showStudentDetails('Attendance record', [
                { label: 'Date', value: item.attendance_date ? new Date(item.attendance_date).toLocaleDateString() : '-' },
                { label: 'Status', value: item.status || '-' },
                { label: 'Remarks', value: item.remarks || '-' },
                { label: 'Marked by', value: getMarkedByName(item.marked_by) }
              ])}
            >
              <AttendanceIcon type="dots" />
            </button>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
