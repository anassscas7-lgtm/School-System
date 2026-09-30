import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout'; 
import Header from '../../components/Header/header'; 
import AdminListView from '../../components/AdminListView';
import Swal from 'sweetalert2'; 
import './Attendance.css';

/* Action Icons */
const IconCalendar = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>;
const IconSettings = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47,0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>;
const IconInfo = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>;
const IconKey = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>;
const IconEdit = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
const IconRefresh = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>;
const IconDelete = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
const IconExport = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>;
const SvgGroup = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 11c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3Z"/><path d="M16 14c-2.7 0-5 1.3-5 3v2h10v-2c0-1.7-2.3-3-5-3Z"/><path d="M8 14c-2.7 0-5 1.3-5 3v2h5"/></svg>;
const SvgAbsent = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M7 20v-1a5 5 0 0 1 5-5h1"/><path d="M18 14v6M15 17h6"/></svg>;
const SvgClock = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>;
const SvgLeave = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5h6v2"/><path d="M8 12h8"/></svg>;
const SvgUsersMini = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M3 19c0-2.2 2.2-4 5-4"/><path d="M11 19c0-2.2 2.2-4 5-4"/></svg>;
const SvgTrend = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 18h16"/><path d="m6 14 4-4 3 3 5-6"/><path d="M17 7h1v1"/></svg>;
const SvgList = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 7h11M9 12h11M9 17h11"/><path d="M4 7h.01M4 12h.01M4 17h.01"/></svg>;
const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z"/></svg>;
const AttendanceLineIcon = ({ type }) => {
  const paths = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    check: <path d="m5 12 4 4L19 6" />,
    absent: <path d="M18 6 6 18M6 6l12 12" />,
    remark: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
  };

  return (
    <svg className="att-line-icon" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
}

export default function Attendance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbStudents, setDbStudents] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]); 
  const [attendanceRecords, setAttendanceRecords] = useState([]); 

  // Checkbox State
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  
  // 👉 NEW: Pagination State Added
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7; 

  const today = new Date();
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getDateKey = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).split('T')[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [tableFilters, setTableFilters] = useState({
    grade: '', 
    section: '', 
    startDate: getMonday(new Date()).toISOString().split('T')[0]
  });

  const [modalConfig, setModalConfig] = useState({
    date: todayDateString,
    grade: 'Grade 7',
    section: 'A', 
    session: 'Full day',
    markedBy: '' 
  });
  

  const fetchData = async () => {
    try {
      const [stuRes, teaRes, attRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/teachers"),
        fetch("/api/attendance")
      ]);

      const stuResult = await stuRes.json();
      if (stuResult.success) {
        setDbStudents(stuResult.data.map(s => ({
          student_id: s.student_id || s.id, 
          name: `${s.first_name} ${s.last_name}`,
          roll: s.roll_no,
          grade: s.grade, 
          section: s.section,
          status: 'P',
          remarks: ''
        })));
      }

      const teaResult = await teaRes.json();
      if (teaResult.success) setDbTeachers(teaResult.data);

      const attResult = await attRes.json();
      if (attResult.success) setAttendanceRecords(attResult.data);

    } catch (err) { console.error(err); }
  };
  

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setSelectedRows([]);
    await fetchData();
    Swal.fire({
      icon: 'success',
      title: 'Attendance refreshed',
      showConfirmButton: false,
      timer: 900
    });
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Selection', text: 'Bhai, pehle attendance delete karne ke liye student select toh karein!', confirmButtonColor: '#2563eb' });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Selected attendance records for ${selectedRows.length} students on the visible dates will be cleared!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, clear it!'
    });

    if (result.isConfirmed) {
      try {
        const dateRange = displayDates.map(d => d.fullDateStr);
        const response = await fetch("/api/attendance/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows, dates: dateRange })
        });
        const data = await response.json();
        
        if (data.success) {
          // ✅ FIX: Database se delete hone ke baad frontend state ko bhi filter karein
          setAttendanceRecords(prev => 
            prev.filter(rec => 
              !(selectedRows.includes(rec.student_id) && dateRange.includes(getDateKey(rec.attendance_date)))
            )
          );

          Swal.fire({ icon: 'success', title: 'Cleared!', showConfirmButton: false, timer: 1500 });
          setSelectedRows([]);
          // fetchData(); // Refresh backup ke liye
        } else { 
          Swal.fire('Error', data.message, 'error'); 
        }
      } catch (err) { 
        Swal.fire('Error', 'Server connection failed', 'error'); 
      }
    }
  };
  

  const todaysAttendance = attendanceRecords.filter(a => getDateKey(a.attendance_date) === todayDateString);
  const totalPresent = todaysAttendance.filter(a => a.status === 'Present').length;
  const totalAbsent = todaysAttendance.filter(a => a.status === 'Absent').length;
  const totalLate = todaysAttendance.filter(a => a.status === 'Late').length;
  const totalHoliday = todaysAttendance.filter(a => a.status === 'Holiday').length;
  const totalMarked = todaysAttendance.length;
  const presentPercent = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;
  const absentPercent = totalMarked > 0 ? ((totalAbsent / totalMarked) * 100).toFixed(1) : 0;

  const uniqueGrades = [...new Set(dbStudents.map(s => s.grade))].filter(Boolean).sort();
  const dynamicGradeChart = uniqueGrades.map(grade => {
    const gradeStudents = dbStudents.filter(s => s.grade === grade).map(s => s.student_id);
    const gradeAttToday = todaysAttendance.filter(a => gradeStudents.includes(a.student_id));
    
    const totalG = gradeAttToday.length;
    const presentG = gradeAttToday.filter(a => a.status === 'Present').length;
    const p = totalG > 0 ? Math.round((presentG / totalG) * 100) : 0;
    
    let c = 'empty';
    if (totalG > 0) {
      if (p >= 95) c = 'green';
      else if (p >= 85) c = 'blue';
      else if (p >= 75) c = 'yellow';
      else c = 'red';
    }
    return { g: grade, p, c };
  });

  const dynamicWeeklyTrend = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

    const dayRecords = attendanceRecords.filter(a => getDateKey(a.attendance_date) === dateStr);
    const totalD = dayRecords.length;
    const presentD = dayRecords.filter(a => a.status === 'Present').length;
    const p = totalD > 0 ? Math.round((presentD / totalD) * 100) : 0;

    let c = 'empty';
    if (totalD > 0) {
      if (p >= 95) c = 'green';
      else if (p >= 85) c = 'blue';
      else if (p >= 75) c = 'yellow';
      else c = 'red';
    }
    dynamicWeeklyTrend.push({ d: dayName, p, c });
  }

  const displayedStudents = dbStudents.filter(s => {
    const matchGrade = tableFilters.grade === '' || s.grade === tableFilters.grade;
    const matchSection = tableFilters.section === '' || s.section === tableFilters.section;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchSearch = !normalizedSearch ||
      s.name.toLowerCase().includes(normalizedSearch) ||
      (s.grade || '').toLowerCase().includes(normalizedSearch) ||
      (s.section || '').toLowerCase().includes(normalizedSearch);
    return matchGrade && matchSection && matchSearch;
  });

  // 👉 NEW: Pagination Calculation Logic Added
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = displayedStudents.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(displayedStudents.length / recordsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRows([]); 
  };

  const displayDates = Array.from({length: 5}).map((_, i) => {
    const d = new Date(tableFilters.startDate);
    d.setDate(d.getDate() + i);
    return {
      fullDateStr: d.toISOString().split('T')[0],
      displayStr: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  const getStatusForSpecificDate = (studentId, dateStr) => {
    const record = attendanceRecords.find(a => a.student_id === studentId && getDateKey(a.attendance_date) === dateStr);
    return record ? record.status.charAt(0) : null;
  };

  const normalizeStatusKey = (status) => {
    const key = (status || '').charAt(0).toUpperCase();
    return key || null;
  };

  const getStatusLabel = (status) => {
    const key = normalizeStatusKey(status);
    return { P: 'Present', A: 'Absent', L: 'Late', H: 'Holiday' }[key] || status || 'Not marked';
  };

  const getTeacherName = (value) => {
    if (!value) return '-';
    const teacher = dbTeachers.find(t => String(t.teacher_id) === String(value) || String(t.id) === String(value));
    return teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : value;
  };

  const formatAttendanceDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStudentAttendanceSummary = (studentId) => {
    const records = attendanceRecords
      .filter(a => a.student_id === studentId)
      .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));

    const countByStatus = (key) => records.filter(record => normalizeStatusKey(record.status) === key).length;
    const week = displayDates.map((dateItem) => {
      const record = records.find(a => getDateKey(a.attendance_date) === dateItem.fullDateStr);
      return {
        ...dateItem,
        record,
        status: record ? normalizeStatusKey(record.status) : null
      };
    });

    return {
      records,
      week,
      latest: records[0],
      present: countByStatus('P'),
      absent: countByStatus('A'),
      late: countByStatus('L'),
      holiday: countByStatus('H')
    };
  };

  // Checkbox Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(currentRecords.map(s => s.student_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const isAllSelected = currentRecords.length > 0 && selectedRows.length === currentRecords.length;

  const attendanceColumns = [
    { key: 'expand', label: '', width: 56 },
    { key: 'student', label: 'Student', width: 220 },
    { key: 'grade', label: 'Grade', width: 120 },
    { key: 'section', label: 'Section', width: 120 },
    { key: 'week', label: 'Visible week', width: 260 },
    { key: 'latest', label: 'Latest status', width: 150 },
    { key: 'present', label: 'Present', width: 120 }
  ];

  const renderAttendanceCell = (student, column) => {
    const summary = getStudentAttendanceSummary(student.student_id);
    const latestStatusKey = normalizeStatusKey(summary.latest?.status);
    const expanded = expandedStudentId === student.student_id;

    if (column.key === 'expand') {
      return (
        <button
          type="button"
          className="att-expand-btn"
          onClick={() => setExpandedStudentId(expanded ? null : student.student_id)}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${student.name}`}
        >
          <span>{expanded ? 'v' : '>'}</span>
        </button>
      );
    }
    if (column.key === 'student') {
      return (
        <button
          type="button"
          className="att-student-link"
          onClick={() => {
            setSelectedRows([student.student_id]);
            setModalConfig(prev => ({
              ...prev,
              grade: student.grade || prev.grade,
              section: student.section || prev.section
            }));
            setIsModalOpen(true);
          }}
        >
          {student.name}
        </button>
      );
    }
    if (column.key === 'grade') return student.grade || '-';
    if (column.key === 'section') return student.section ? `Sec ${student.section}` : '-';
    if (column.key === 'week') {
      return (
        <div className="att-week-dots">
          {summary.week.map((item) => (
            <span
              key={item.fullDateStr}
              className={`att-status-dot ${item.status ? item.status.toLowerCase() : 'empty'}`}
              title={`${item.displayStr}: ${getStatusLabel(item.status)}`}
            >
              {item.status || '-'}
            </span>
          ))}
        </div>
      );
    }
    if (column.key === 'latest') {
      return (
        <span className={`att-status-text ${latestStatusKey ? latestStatusKey.toLowerCase() : 'empty'}`}>
          {summary.latest ? getStatusLabel(summary.latest.status) : 'Not marked'}
        </span>
      );
    }
    if (column.key === 'present') return `${summary.present}/${summary.records.length || 0}`;
    return '-';
  };

  const renderAttendanceExpandedRow = (student) => {
    const summary = getStudentAttendanceSummary(student.student_id);

    return (
      <div className="att-child-panel">
        <div className="att-detail-grid">
          <div>
            <span>Roll no</span>
            <strong>{student.roll || '-'}</strong>
          </div>
          <div>
            <span>Total marked</span>
            <strong>{summary.records.length}</strong>
          </div>
          <div>
            <span>Absent</span>
            <strong>{summary.absent}</strong>
          </div>
          <div>
            <span>Late</span>
            <strong>{summary.late}</strong>
          </div>
          <div>
            <span>Holiday</span>
            <strong>{summary.holiday}</strong>
          </div>
        </div>

        <div className="att-child-sections">
          <section className="att-child-section">
            <h4>Selected week</h4>
            <div className="att-week-list">
              {summary.week.map((item) => (
                <div className="att-week-item" key={item.fullDateStr}>
                  <span>{item.displayStr}</span>
                  <strong className={`att-status-text ${item.status ? item.status.toLowerCase() : 'empty'}`}>
                    {getStatusLabel(item.status)}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="att-child-section">
            <h4>Recent attendance</h4>
            {summary.records.length > 0 ? (
              <div className="att-recent-list">
                {summary.records.slice(0, 5).map((record) => {
                  const statusKey = normalizeStatusKey(record.status);
                  return (
                    <div className="att-recent-item" key={`${record.student_id}-${record.attendance_date}`}>
                      <span>{formatAttendanceDate(record.attendance_date)}</span>
                      <strong className={`att-status-text ${statusKey ? statusKey.toLowerCase() : 'empty'}`}>
                        {getStatusLabel(record.status)}
                      </strong>
                      <span>{record.remarks || '-'}</span>
                      <span>{getTeacherName(record.marked_by)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="att-empty-state compact">No attendance marked yet for this student.</div>
            )}
          </section>
        </div>
      </div>
    );
  };

  // Export Logic
  const handleExport = () => {
    if (selectedRows.length === 0) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'No Selection', 
        text: 'Please select students from the table to export.', 
        confirmButtonColor: '#2563eb' 
      });
      return;
    }

    const selectedData = displayedStudents.filter(s => selectedRows.includes(s.student_id));
    const dateHeaders = displayDates.map(d => d.displayStr.toUpperCase());
    const headers = ["ID", "Name", "Roll No", "Grade", "Section", ...dateHeaders];

    const csvRows = selectedData.map(s => {
      const attendanceStatus = displayDates.map(dObj => {
        const status = getStatusForSpecificDate(s.student_id, dObj.fullDateStr);
        return status ? status : "-";
      });

      return [
        s.student_id, 
        `"${s.name}"`, 
        `"${s.roll}"`, 
        `"${s.grade}"`, 
        `"${s.section}"`,
        ...attendanceStatus
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Detailed_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalStudents = dbStudents.filter(s => s.grade === modalConfig.grade && s.section === modalConfig.section);

  const updateStatus = (id, status) => {
    setDbStudents(prev => prev.map(s => s.student_id === id ? {...s, status} : s));
  };

  const markAll = (status) => {
    setDbStudents(prev => prev.map(s => {
      if(s.grade === modalConfig.grade && s.section === modalConfig.section) return {...s, status};
      return s;
    }));
  };

  const focusAttendanceForm = () => {
    setTimeout(() => {
      const modalBody = document.querySelector('.att-modal-body');
      const markedByField = document.querySelector('.att-modal [name="markedBy"]');
      modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
      markedByField?.focus?.({ preventScroll: true });
    }, 120);
  };

  const showAttendanceFormNotice = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Marked by required',
      text: 'Please select a teacher in the Marked by field before submitting attendance.',
      confirmButtonText: 'Review form',
      buttonsStyling: false,
      customClass: {
        container: 'att-swal-container',
        popup: 'att-swal-popup',
        title: 'att-swal-title',
        htmlContainer: 'att-swal-text',
        confirmButton: 'att-swal-confirm'
      }
    }).then(focusAttendanceForm);
  };

  const submitAttendance = async () => {
    if (!modalConfig.markedBy) {
      showAttendanceFormNotice();
      return;
    }
    if (modalStudents.length === 0) {
      Swal.fire('Empty List', 'There are no students to mark attendance for.', 'info');
      return;
    }
    
    try {
      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: modalConfig.date,
          classId: 1, 
          markedBy: modalConfig.markedBy,
          attendanceList: modalStudents 
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire('Success', 'Attendance saved in DB successfully!', 'success');
        setIsModalOpen(false);
        fetchData(); 
      } else {
        Swal.fire('Error', data.message, 'error');
      }
    } catch (err) { Swal.fire('Error', 'Connection failed. Is the server running?', 'error'); }
  };

  return (
    <DashboardLayout userRole="admin" currentPath="/attendance" userName="System Admin" userInitials="SA">
      
      <div className="att-page-header">
        <div className="att-header-left">
          <h2>Attendance</h2>
          <p>Today - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="att-header-right">
          <button className="att-btn-primary" onClick={() => setIsModalOpen(true)}>Mark attendance</button>
          <div className="att-avatar">SA</div>
        </div>
      </div>

      <Header
        onExport={handleExport}
        onRefresh={handleRefresh}
        onDelete={handleDelete}
        onEdit={() => {
          if (selectedRows.length === 0) {
            Swal.fire('No selection', 'Select students first, then click Edit to open attendance marking.', 'info');
            return;
          }
          setIsModalOpen(true);
        }}
      />

      <div className="att-page-wrapper">

        <div className="att-table-card">
          <div className="att-table-header">
            <div>
              <h3>Attendance records</h3>
              <p>Expand a student to review week status, recent marks, remarks, and teacher details.</p>
            </div>
            <div className="att-table-controls">
              <label className="att-search-box">
                <SvgSearch />
                <input
                  type="text"
                  placeholder="Filter by student, grade, class..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    setSelectedRows([]);
                  }}
                />
              </label>
              <label className="att-control-field">
                <span>Grade</span>
                <select value={tableFilters.grade} onChange={(e) => { setTableFilters({...tableFilters, grade: e.target.value}); setCurrentPage(1); }}>
                  <option value="">All Grades</option>
                  {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label className="att-control-field">
                <span>Section</span>
                <select value={tableFilters.section} onChange={(e) => { setTableFilters({...tableFilters, section: e.target.value}); setCurrentPage(1); }}>
                  <option value="">All</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </label>
              <label className="att-control-field">
                <span>Start Date</span>
                <input type="date" value={tableFilters.startDate} onChange={(e) => setTableFilters({...tableFilters, startDate: e.target.value})} />
              </label>
            </div>
          </div>

          <AdminListView
            showToolbar={false}
            showConfigure={false}
            columns={attendanceColumns}
            rows={currentRecords}
            getRowId={(student) => student.student_id}
            renderCell={renderAttendanceCell}
            selectedRows={selectedRows}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            isRowExpanded={(student) => expandedStudentId === student.student_id}
            renderExpandedRow={renderAttendanceExpandedRow}
            emptyMessage="No students found matching these filters."
            paginationLabel={`Showing ${displayedStudents.length > 0 ? indexOfFirstRecord + 1 : 0} to ${Math.min(indexOfLastRecord, displayedStudents.length)} of ${displayedStudents.length} records`}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />

          {false && <>
          <div className="att-table-scroll att-accordion-scroll">
            <div className="att-accordion-list">
              <div className="att-list-head">
                <span className="att-head-select">
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} aria-label="Select all students" />
                </span>
                <span>Student</span>
                <span>Grade</span>
                <span>Section</span>
                <span>Visible week</span>
                <span>Latest status</span>
                <span>Present</span>
              </div>

              {currentRecords.length > 0 ? currentRecords.map((student) => {
                const summary = getStudentAttendanceSummary(student.student_id);
                const expanded = expandedStudentId === student.student_id;
                const latestStatusKey = normalizeStatusKey(summary.latest?.status);

                return (
                  <div className={`att-accordion-item ${expanded ? 'open' : ''}`} key={student.student_id}>
                    <div className="att-accordion-row">
                      <div className="att-row-select">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(student.student_id)}
                          onChange={() => handleSelectRow(student.student_id)}
                          aria-label={`Select ${student.name}`}
                        />
                        <button
                          type="button"
                          className="att-expand-btn"
                          onClick={() => setExpandedStudentId(expanded ? null : student.student_id)}
                          aria-expanded={expanded}
                          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${student.name}`}
                        >
                          <span>{expanded ? 'v' : '>'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="att-student-link"
                        onClick={() => {
                          setSelectedRows([student.student_id]);
                          setModalConfig(prev => ({
                            ...prev,
                            grade: student.grade || prev.grade,
                            section: student.section || prev.section
                          }));
                          setIsModalOpen(true);
                        }}
                      >
                        {student.name}
                      </button>
                      <span>{student.grade || '-'}</span>
                      <span>{student.section ? `Sec ${student.section}` : '-'}</span>
                      <div className="att-week-dots">
                        {summary.week.map((item) => (
                          <span
                            key={item.fullDateStr}
                            className={`att-status-dot ${item.status ? item.status.toLowerCase() : 'empty'}`}
                            title={`${item.displayStr}: ${getStatusLabel(item.status)}`}
                          >
                            {item.status || '-'}
                          </span>
                        ))}
                      </div>
                      <span className={`att-status-text ${latestStatusKey ? latestStatusKey.toLowerCase() : 'empty'}`}>
                        {summary.latest ? getStatusLabel(summary.latest.status) : 'Not marked'}
                      </span>
                      <span>{summary.present}/{summary.records.length || 0}</span>
                    </div>

                    {expanded && (
                      <div className="att-child-panel">
                        <div className="att-detail-grid">
                          <div>
                            <span>Roll no</span>
                            <strong>{student.roll || '-'}</strong>
                          </div>
                          <div>
                            <span>Total marked</span>
                            <strong>{summary.records.length}</strong>
                          </div>
                          <div>
                            <span>Absent</span>
                            <strong>{summary.absent}</strong>
                          </div>
                          <div>
                            <span>Late</span>
                            <strong>{summary.late}</strong>
                          </div>
                          <div>
                            <span>Holiday</span>
                            <strong>{summary.holiday}</strong>
                          </div>
                        </div>

                        <div className="att-child-sections">
                          <section className="att-child-section">
                            <h4>Selected week</h4>
                            <div className="att-week-list">
                              {summary.week.map((item) => (
                                <div className="att-week-item" key={item.fullDateStr}>
                                  <span>{item.displayStr}</span>
                                  <strong className={`att-status-text ${item.status ? item.status.toLowerCase() : 'empty'}`}>
                                    {getStatusLabel(item.status)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          </section>

                          <section className="att-child-section">
                            <h4>Recent attendance</h4>
                            {summary.records.length > 0 ? (
                              <div className="att-recent-list">
                                {summary.records.slice(0, 5).map((record) => {
                                  const statusKey = normalizeStatusKey(record.status);
                                  return (
                                    <div className="att-recent-item" key={`${record.student_id}-${record.attendance_date}`}>
                                      <span>{formatAttendanceDate(record.attendance_date)}</span>
                                      <strong className={`att-status-text ${statusKey ? statusKey.toLowerCase() : 'empty'}`}>
                                        {getStatusLabel(record.status)}
                                      </strong>
                                      <span>{record.remarks || '-'}</span>
                                      <span>{getTeacherName(record.marked_by)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="att-empty-state compact">No attendance marked yet for this student.</div>
                            )}
                          </section>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="att-empty-state">No students found matching these filters.</div>
              )}
            </div>
          </div>

          {false && <div className="att-table-scroll">
            <table className="att-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', verticalAlign: 'middle' }}>
                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                  </th>
                  <th style={{ width: '25%', verticalAlign: 'middle' }}>
                    STUDENT
                    <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: '500', color: '#94a3b8', textTransform: 'none' }}>Filter to view specific classes 👇</div>
                  </th>
                  <th style={{ width: '15%', verticalAlign: 'middle' }}>
                    GRADE
                    <select className="att-col-filter" value={tableFilters.grade} onChange={(e) => setTableFilters({...tableFilters, grade: e.target.value})}>
                      <option value="">All Grades</option>
                      {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </th>
                  <th style={{ width: '12%', verticalAlign: 'middle' }}>
                    SECTION
                    <select className="att-col-filter" value={tableFilters.section} onChange={(e) => setTableFilters({...tableFilters, section: e.target.value})}>
                      <option value="">All</option>
                      <option value="A">Sec A</option>
                      <option value="B">Sec B</option>
                    </select>
                  </th>
                  
                  {displayDates.map((dObj, idx) => (
                    <th key={idx} style={{ textAlign: 'center', width: '9%', verticalAlign: 'middle' }}>
                      {idx === 0 ? (
                        <>
                          <span style={{ display: 'block', marginBottom: '4px' }}>START DATE</span>
                          <input type="date" className="att-col-filter" style={{ cursor: 'pointer', padding: '5px' }} value={tableFilters.startDate} onChange={(e) => setTableFilters({...tableFilters, startDate: e.target.value})} />
                        </>
                      ) : (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: '18px' }}>
                          {dObj.displayStr.toUpperCase()}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 👇 NEW: currentRecords map Added for Pagination */}
                {currentRecords.length > 0 ? currentRecords.map((student) => (
                  <tr key={student.student_id}>
                    <td style={{ verticalAlign: 'middle' }}>
                      <input type="checkbox" checked={selectedRows.includes(student.student_id)} onChange={() => handleSelectRow(student.student_id)} />
                    </td>
                    <td className="att-student-name" style={{ verticalAlign: 'middle' }}>{student.name}</td>
                    <td style={{ color: '#64748b', verticalAlign: 'middle' }}>{student.grade}</td>
                    <td style={{ color: '#64748b', verticalAlign: 'middle' }}>Sec {student.section}</td>
                    
                    {displayDates.map((dObj, idx) => {
                      const status = getStatusForSpecificDate(student.student_id, dObj.fullDateStr);
                      return (
                        <td key={idx} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          {status ? <span className={`att-status-circle ${status}`}>{status}</span> : <span className="att-status-circle empty">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                )) : <tr><td colSpan="9" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No students found matching these filters.</td></tr>}
              </tbody>
            </table>
          </div>}

          {/* 👉 NEW: Pagination Footer Row Added */}
          <div className="att-pagination-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, displayedStudents.length)} of {displayedStudents.length} records</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="att-page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index + 1} onClick={() => paginate(index + 1)} className={`att-page-btn ${currentPage === index + 1 ? 'active' : ''}`}>{index + 1}</button>
              ))}
              <button className="att-page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
            </div>
          </div>
          </>}

          <div className="att-legend-row">
            <div className="att-legend-item"><span className="att-status-circle P">P</span> Present</div>
            <div className="att-legend-item"><span className="att-status-circle A">A</span> Absent</div>
            <div className="att-legend-item"><span className="att-status-circle L">L</span> Late</div>
            <div className="att-legend-item"><span className="att-status-circle H">H</span> Holiday/Med</div>
          </div>
        </div>

        {isModalOpen && (
          <div className="att-modal-overlay">
            <div className="att-modal">
              <div className="att-modal-header">
                <div className="att-modal-title-group">
                  <div className="att-modal-icon"><IconCalendar /></div>
                  <div className="att-modal-title">
                    <h2>Mark Attendance</h2>
                    <p>Neon Database Sync Mode</p>
                  </div>
                </div>
                <button className="att-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close mark attendance form">
                  <AttendanceLineIcon type="close" />
                </button>
              </div>

              <div className="att-modal-body">
                <div className="att-modal-card att-session-card">
                  <div className="att-section-title"><IconSettings /> SESSION CONFIGURATION</div>
                  <div className="att-form-row-3">
                    <div className="att-form-group">
                      <label>Date *</label>
                      <input type="date" className="att-input" value={modalConfig.date} onChange={(e) => setModalConfig({...modalConfig, date: e.target.value})} />
                    </div>
                    <div className="att-form-group">
                      <label>Grade *</label>
                      <select className="att-input" value={modalConfig.grade} onChange={(e) => setModalConfig({...modalConfig, grade: e.target.value})}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={`Grade ${n}`}>Grade {n}</option>)}
                      </select>
                    </div>
                    <div className="att-form-group">
                      <label>Section *</label>
                      <select className="att-input" value={modalConfig.section} onChange={(e) => setModalConfig({...modalConfig, section: e.target.value})}>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                      </select>
                    </div>
                  </div>

                  <div className="att-form-row-2">
                    <div className="att-form-group">
                      <label>Period</label>
                      <select className="att-input"><option>Full day</option></select>
                    </div>
                    <div className="att-form-group">
                      <label>Marked by</label>
                      <select name="markedBy" className="att-input" value={modalConfig.markedBy} onChange={(e) => setModalConfig({...modalConfig, markedBy: e.target.value})}>
                        <option value="">Select Teacher</option>
                        {dbTeachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="att-modal-card att-bulk-card">
                  <div className="att-section-title"><IconKey /> BULK ACTIONS</div>
                  <div className="att-bulk-btns">
                    <button className="att-btn-bulk-p" onClick={() => markAll('P')}><AttendanceLineIcon type="check" /> Mark all present</button>
                    <button className="att-btn-bulk-a" onClick={() => markAll('A')}><AttendanceLineIcon type="absent" /> Mark all absent</button>
                  </div>

                  <table className="att-modal-table" style={{marginTop: '15px'}}>
                    <thead>
                      <tr><th>Student</th><th>Roll No</th><th>Status</th><th>Remark</th></tr>
                    </thead>
                    <tbody>
                      {modalStudents.length > 0 ? modalStudents.map((stu) => (
                        <tr key={stu.student_id}>
                          <td>
                            <div className="att-student-modal-cell">
                              <span className="att-student-modal-avatar">
                                {stu.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                              <span>{stu.name}</span>
                            </div>
                          </td>
                          <td>{stu.roll}</td>
                          <td>
                            <div className="att-toggles">
                              {['P', 'A', 'L', 'H'].map(st => (
                                <div key={st} className={`att-toggle-btn ${st.toLowerCase()} ${stu.status === st ? 'active' : ''}`} 
                                  onClick={() => updateStatus(stu.student_id, st)}>{st}</div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="att-remark-field">
                              <AttendanceLineIcon type="remark" />
                              <input type="text" className="att-remark-input" placeholder="Write remark..."
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDbStudents(prev => prev.map(s => s.student_id === stu.student_id ? {...s, remarks: val} : s));
                                }} />
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No students found for this Grade and Section.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="att-modal-footer">
                <div className="att-required-note"><span>*</span> Required fields</div>
                <div className="att-footer-actions">
                  <button className="att-btn-discard" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button className="att-btn-publish" onClick={submitAttendance}>Submit attendance <AttendanceLineIcon type="check" /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
