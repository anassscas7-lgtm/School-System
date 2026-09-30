import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DashboardLayout from '../../components/DashboardLayout';
import './Dashboard.css';

const adminData = {
  name: 'System Admin',
  dateText: 'Monday, 20 April 2026',
  initials: 'SA',
};

const attendancePeriodOptions = ['This Month', 'Last Month', 'This Week', 'Today'];
const avatarTones = ['rose', 'blue', 'pink', 'slate'];
const attendanceChartColors = ['blue', 'orange', 'green', 'purple', 'cyan'];

const formatEnrollmentDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatEventDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getStudentName = (student) => (
  `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
  student.student_name ||
  'Student'
);

const getStudentInitials = (student) => {
  const name = getStudentName(student);
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || 'S'}${parts[1]?.[0] || ''}`.toUpperCase();
};

const normalizeFeeStatus = (value) => {
  const status = String(value || 'Pending').trim();
  const key = status.toLowerCase();
  if (key === 'paid') return { label: 'Paid', className: 'paid' };
  if (key === 'overdue') return { label: 'Overdue', className: 'overdue' };
  return { label: 'Pending', className: 'pending' };
};

const getPakistanDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const parseMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const formatPkrCompact = (amount) => {
  if (!amount) return 'PKR 0 collected';
  if (amount >= 1000000) return `PKR ${(amount / 1000000).toFixed(1)}M collected`;
  if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(1)}K collected`;
  return `PKR ${amount.toLocaleString()} collected`;
};

const sortGrades = (a, b) => {
  const aNumber = Number(String(a).match(/\d+/)?.[0] || 0);
  const bNumber = Number(String(b).match(/\d+/)?.[0] || 0);
  if (aNumber !== bNumber) return aNumber - bNumber;
  return String(a).localeCompare(String(b));
};

const getDateFromKey = (key) => new Date(`${key}T00:00:00`);

const isAttendanceInPeriod = (dateValue, period) => {
  const recordKey = getPakistanDateKey(dateValue);
  const todayKey = getPakistanDateKey();
  if (!recordKey) return false;
  if (period === 'Today') return recordKey === todayKey;

  const recordDate = getDateFromKey(recordKey);
  const todayDate = getDateFromKey(todayKey);

  if (period === 'This Week') {
    const day = todayDate.getDay() || 7;
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - day + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return recordDate >= weekStart && recordDate <= weekEnd;
  }

  const targetDate = new Date(todayDate);
  if (period === 'Last Month') {
    targetDate.setMonth(targetDate.getMonth() - 1);
  }

  return recordDate.getFullYear() === targetDate.getFullYear()
    && recordDate.getMonth() === targetDate.getMonth();
};

const getAnnouncementEventMeta = (announcement) => {
  const category = String(announcement.category || '').toLowerCase();
  const title = String(announcement.title || '').toLowerCase();
  if (category.includes('fee') || title.includes('fee')) return { color: 'yellow', icon: 'fee' };
  if (category.includes('event') || title.includes('sport')) return { color: 'pink', icon: 'sports' };
  if (title.includes('parent') || title.includes('meeting')) return { color: 'green', icon: 'meeting' };
  return { color: 'blue', icon: 'exam' };
};

const SvgSearch = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const SvgBell = () => (
  <svg fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
  </svg>
);

const IconClip = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
);

const IconCard = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </svg>
);

const SvgChevronDown = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
  </svg>
);

const MiniLine = () => (
  <svg className="ad-mini-line" viewBox="0 0 120 54" fill="none" aria-hidden="true">
    <path d="M4 38C18 40 22 14 38 22c12 6 13 20 26 14s12-27 27-18c10 6 16 10 25-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M4 42C18 44 22 18 38 26c12 6 13 20 26 14s12-27 27-18c10 6 16 10 25-8v40H4z" fill="currentColor" opacity="0.12" />
  </svg>
);

const MiniBars = () => (
  <div className="ad-mini-bars" aria-hidden="true">
    {[34, 52, 75, 62, 88].map((height, index) => (
      <span key={index} style={{ height: `${height}%` }} />
    ))}
  </div>
);

const ActionIcon = ({ type }) => {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    report: <><path d="M5 20V10" /><path d="M12 20V4" /><path d="M19 20v-7" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
    more: <><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>,
    arrow: <path d="m9 18 6-6-6-6" />
  };

  return (
    <svg className="ad-action-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const EventIcon = ({ type }) => {
  const paths = {
    exam: (
      <>
        <path d="M7 3.75h7.2L18 7.55v10.7A1.75 1.75 0 0 1 16.25 20H7a1.75 1.75 0 0 1-1.75-1.75V5.5A1.75 1.75 0 0 1 7 3.75Z" />
        <path d="M14 4v4h4M8.5 11h6M8.5 14h5M8.5 17h3" />
      </>
    ),
    meeting: (
      <>
        <path d="M8.5 11.2a2.35 2.35 0 1 0 0-4.7 2.35 2.35 0 0 0 0 4.7ZM15.6 11.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z" />
        <path d="M3.9 18.4c.45-2.7 2.2-4.25 4.6-4.25s4.15 1.55 4.6 4.25M12.7 14.35c.72-.42 1.56-.63 2.55-.63 2.25 0 3.82 1.35 4.2 3.75" />
      </>
    ),
    fee: (
      <>
        <path d="M4.75 7.25h14.5v9.5H4.75z" />
        <path d="M7.25 10h9.5M7.25 14h4.25M15.25 14h1.5" />
      </>
    ),
    sports: (
      <>
        <path d="M12 4.5v15M6.4 7.2c3.35 1.4 7.85 1.4 11.2 0M6.4 16.8c3.35-1.4 7.85-1.4 11.2 0" />
        <path d="M19.5 12A7.5 7.5 0 1 1 4.5 12a7.5 7.5 0 0 1 15 0Z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[type]}
    </svg>
  );
};

export default function AdminDashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAttendancePeriodOpen, setIsAttendancePeriodOpen] = useState(false);
  const [attendancePeriod, setAttendancePeriod] = useState('This Month');
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [feeVouchers, setFeeVouchers] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const endpoints = ['/api/students', '/api/teachers', '/api/attendance', '/api/fee-vouchers', '/api/fees', '/api/announcements'];
        const results = await Promise.all(endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint);
            const data = await response.json();
            return data.success ? data.data : [];
          } catch (error) {
            console.error(`Admin dashboard fetch failed for ${endpoint}:`, error);
            return [];
          }
        }));

        setStudents(results[0]);
        setTeachers(results[1]);
        setAttendanceRecords(results[2]);
        setFeeVouchers(results[3]);
        setFeePayments(results[4]);
        setAnnouncements(results[5]);
      } catch (error) {
        console.error('Admin dashboard data fetch failed:', error);
        setStudents([]);
        setTeachers([]);
        setAttendanceRecords([]);
        setFeeVouchers([]);
        setFeePayments([]);
        setAnnouncements([]);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const recentEnrollments = useMemo(() => students.slice(0, 4).map((student, index) => {
    const fee = normalizeFeeStatus(student.fee_status);
    return {
      id: student.student_id,
      name: getStudentName(student),
      grade: student.grade || '-',
      sec: student.section || '-',
      date: formatEnrollmentDate(student.admission_date || student.created_at),
      status: fee.label,
      statusClass: fee.className,
      avatar: getStudentInitials(student),
      tone: avatarTones[index % avatarTones.length],
    };
  }), [students]);

  const summaryCards = useMemo(() => {
    const todayKey = getPakistanDateKey();
    const todayAttendance = attendanceRecords.filter((record) => getPakistanDateKey(record.attendance_date) === todayKey);
    const presentToday = todayAttendance.filter((record) => String(record.status || '').toLowerCase() === 'present').length;
    const attendancePercent = todayAttendance.length ? Math.round((presentToday / todayAttendance.length) * 100) : 0;
    const activeTeachers = teachers.filter((teacher) => String(teacher.status || 'Active').toLowerCase() === 'active').length;
    const totalBilled = feeVouchers.reduce((sum, voucher) => sum + parseMoney(voucher.amount_due), 0);
    const totalCollected = feePayments.reduce((sum, payment) => sum + parseMoney(payment.amount_received), 0);
    const feePercent = totalBilled ? Math.min(100, Math.round((totalCollected / totalBilled) * 100)) : 0;

    return [
      {
        name: 'Total Students',
        status: dashboardLoading ? '...' : students.length.toLocaleString(),
        sub: students.length === 1 ? '1 active record' : `${students.length} active records`,
        color: 'blue',
        icon: 'Users',
        visual: 'line'
      },
      {
        name: 'Teachers',
        status: dashboardLoading ? '...' : teachers.length.toLocaleString(),
        sub: activeTeachers === 1 ? '1 active record' : `${activeTeachers} active records`,
        color: 'purple',
        icon: 'Briefcase',
        visual: 'line'
      },
      {
        name: 'Attendance Today',
        status: dashboardLoading ? '...' : `${attendancePercent}%`,
        sub: todayAttendance.length ? `${presentToday}/${todayAttendance.length} present today` : 'No records today',
        color: 'orange',
        icon: 'ClipboardCheck',
        visual: 'line'
      },
      {
        name: 'Fee Collection',
        status: dashboardLoading ? '...' : `${feePercent}%`,
        sub: formatPkrCompact(totalCollected),
        color: 'green',
        icon: 'CreditCard',
        visual: 'bars'
      },
    ];
  }, [attendanceRecords, dashboardLoading, feePayments, feeVouchers, students.length, teachers]);

  const attendanceChart = useMemo(() => {
    const studentsById = new Map(students.map((student) => [Number(student.student_id), student]));
    const grades = [...new Set(students.map((student) => student.grade).filter(Boolean))].sort(sortGrades);
    const filteredAttendance = attendanceRecords.filter((record) => isAttendanceInPeriod(record.attendance_date, attendancePeriod));

    return grades.map((grade, index) => {
      const gradeRecords = filteredAttendance.filter((record) => {
        const student = studentsById.get(Number(record.student_id));
        return student?.grade === grade;
      });
      const presentCount = gradeRecords.filter((record) => String(record.status || '').toLowerCase() === 'present').length;
      const percent = gradeRecords.length ? Math.round((presentCount / gradeRecords.length) * 100) : 0;

      return {
        grade,
        percent,
        color: attendanceChartColors[index % attendanceChartColors.length],
      };
    });
  }, [attendancePeriod, attendanceRecords, students]);

  const upcomingEvents = useMemo(() => announcements.slice(0, 4).map((announcement) => {
    const meta = getAnnouncementEventMeta(announcement);
    return {
      id: announcement.announcement_id,
      title: announcement.title || 'Untitled announcement',
      sub: `${formatEventDate(announcement.created_at)} - ${announcement.audience || announcement.category || 'All'}`,
      message: announcement.message || 'No details available.',
      color: meta.color,
      icon: meta.icon,
    };
  }), [announcements]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const handleEnrollmentSelectAll = (e) => {
    setSelectedEnrollments(e.target.checked ? recentEnrollments.map((row) => row.id) : []);
  };

  const handleEnrollmentSelect = (id) => {
    setSelectedEnrollments((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const isAllEnrollmentsSelected = recentEnrollments.length > 0 && selectedEnrollments.length === recentEnrollments.length;

  return (
    <DashboardLayout
      userRole="admin"
      currentPath="/admin/dashboard"
      userName={adminData.name}
      userInitials={adminData.initials}
    >
      <header className="ad-main-header">
        <div className="ad-greeting">
          <div className="ad-title-dropdown-wrapper">
            <button
              className="ad-title-trigger"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="ad-wave" aria-hidden="true">👋</span>
              <h2>Good Morning, {adminData.name}</h2>
            </button>

            {isDropdownOpen && (
              <div className="ad-dropdown-menu">
                <button type="button" className="ad-dropdown-item" onClick={() => handleNavigation('/teacher/dashboard')}>
                  Teacher Dashboard
                </button>
                <button type="button" className="ad-dropdown-item" onClick={() => handleNavigation('/student/dashboard')}>
                  Student Dashboard
                </button>
                <button type="button" className="ad-dropdown-item" onClick={() => Swal.fire('Coming soon', 'Parent dashboard is not available yet.', 'info')}>
                  Parent Dashboard
                </button>
              </div>
            )}
          </div>

          <p>School Overview <span>•</span> {adminData.dateText}</p>
        </div>

        <div className="ad-header-right">
          <div className="ad-search-box">
            <span className="ad-search-icon"><SvgSearch /></span>
            <input type="text" placeholder="Search records..." className="ad-search-input" />
          </div>
          <button type="button" className="ad-notification-group" aria-label="Notifications" onClick={() => Swal.fire('Notifications', 'You have 5 recent school updates.', 'info')}>
            <SvgBell />
            <span className="ad-notification-badge-num">5</span>
          </button>
          <div className="ad-avatar--hdr">{adminData.initials}</div>
        </div>
      </header>

      <div className="ad-top-actions">
        <button type="button" className="ad-quick-btn add-student" onClick={() => navigate('/students')}>
          <ActionIcon type="plus" />
          Add Student
        </button>
        <button type="button" className="ad-quick-btn add-teacher" onClick={() => navigate('/teachers')}>
          <ActionIcon type="plus" />
          Add Teacher
        </button>
        <button type="button" className="ad-quick-btn generate-report" onClick={() => navigate('/reports')}>
          <ActionIcon type="report" />
          Generate Report
        </button>
      </div>

      <div className="ad-summary-row">
        {summaryCards.map((card) => (
          <div key={card.name} className={`ad-stat-card ad-stat-card--${card.color}`}>
            <div className="ad-stat-left">
              <div className="ad-stat-icon-group">
                {card.icon === 'Users' && <IconUsers />}
                {card.icon === 'Briefcase' && <IconBriefcase />}
                {card.icon === 'ClipboardCheck' && <IconClip />}
                {card.icon === 'CreditCard' && <IconCard />}
              </div>
              <div className="ad-stat-content">
                <h4>{card.name}</h4>
                <div className="ad-stat-status">{card.status}</div>
                <span>{card.sub}</span>
              </div>
            </div>
            {card.visual === 'line' && <MiniLine />}
            {card.visual === 'bars' && <MiniBars />}
          </div>
        ))}
      </div>

      <div className="ad-middle-grid">
        <section className="ad-card ad-chart-card">
          <div className="ad-section-header">
            <h3>Attendance by Grade</h3>
            <div
              className="ad-period-dropdown"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsAttendancePeriodOpen(false);
                }
              }}
            >
              <button
                className="ad-period-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isAttendancePeriodOpen}
                onClick={() => setIsAttendancePeriodOpen((open) => !open)}
              >
                {attendancePeriod} <SvgChevronDown />
              </button>
              {isAttendancePeriodOpen && (
                <div className="ad-period-menu" role="listbox" tabIndex={-1}>
                  {attendancePeriodOptions.map((option) => (
                    <button
                      className={option === attendancePeriod ? 'active' : ''}
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={option === attendancePeriod}
                      onClick={() => {
                        setAttendancePeriod(option);
                        setIsAttendancePeriodOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="ad-attendance-bars">
            {dashboardLoading && (
              <div className="ad-attendance-empty">Loading attendance data...</div>
            )}
            {!dashboardLoading && attendanceChart.length === 0 && (
              <div className="ad-attendance-empty">No grade attendance data found.</div>
            )}
            {!dashboardLoading && attendanceChart.map((item) => (
              <div className="ad-attendance-row" key={item.grade}>
                <span>{item.grade}</span>
                <div className="ad-attendance-track">
                  <i className={item.color} style={{ width: `${item.percent}%` }} />
                </div>
                <strong>{item.percent}%</strong>
              </div>
            ))}
            <div className="ad-attendance-scale">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        <section className="ad-card ad-events-card">
          <div className="ad-section-header">
            <h3>Upcoming Events</h3>
            <button className="ad-view-link" type="button" onClick={() => navigate('/admin/announcement')}>View all</button>
          </div>
          <div className="ad-events-list">
            {dashboardLoading && (
              <div className="ad-events-empty">Loading announcements...</div>
            )}
            {!dashboardLoading && upcomingEvents.length === 0 && (
              <div className="ad-events-empty">No upcoming events found.</div>
            )}
            {!dashboardLoading && upcomingEvents.map((event) => (
              <button key={event.id} type="button" className="ad-event-item" onClick={() => Swal.fire(event.title, event.message, 'info')}>
                <div className={`ad-event-icon ${event.color}`}>
                  <EventIcon type={event.icon} />
                </div>
                <div className="ad-event-details">
                  <h4>{event.title}</h4>
                  <p>{event.sub}</p>
                </div>
                <ActionIcon type="arrow" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="ad-card full">
        <div className="ad-section-header">
          <h3>Recent Enrollments</h3>
          <button className="ad-view-link" type="button" onClick={() => navigate('/students')}>View all</button>
        </div>
        <div className="ad-table-responsive">
          <table className="ad-data-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  <input type="checkbox" checked={isAllEnrollmentsSelected} onChange={handleEnrollmentSelectAll} />
                </th>
                <th>Student</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Enrolled</th>
                <th>Fee status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardLoading && (
                <tr>
                  <td className="ad-empty-row" colSpan="7">Loading recent enrollments...</td>
                </tr>
              )}
              {!dashboardLoading && recentEnrollments.length === 0 && (
                <tr>
                  <td className="ad-empty-row" colSpan="7">No recent enrollments found.</td>
                </tr>
              )}
              {!dashboardLoading && recentEnrollments.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input type="checkbox" checked={selectedEnrollments.includes(row.id)} onChange={() => handleEnrollmentSelect(row.id)} />
                  </td>
                  <td>
                    <div className="ad-student-cell">
                      <span className={`ad-student-avatar ${row.tone}`}>{row.avatar}</span>
                      <strong>{row.name}</strong>
                    </div>
                  </td>
                  <td>{row.grade}</td>
                  <td>{row.sec}</td>
                  <td><span className="ad-date-cell"><ActionIcon type="calendar" />{row.date}</span></td>
                  <td>
                    <span className={`ad-status-pill ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button className="ad-more-btn" type="button" onClick={() => Swal.fire(row.name, `${row.grade} - Section ${row.sec}`, 'info')}>
                      <ActionIcon type="more" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ad-table-footer">
          <span>Showing {recentEnrollments.length ? 1 : 0} to {recentEnrollments.length} of {students.length} enrollments</span>
          <div className="ad-pagination">
            <button type="button"><ActionIcon type="arrow" /></button>
            <button type="button" className="active">1</button>
            <button type="button"><ActionIcon type="arrow" /></button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
