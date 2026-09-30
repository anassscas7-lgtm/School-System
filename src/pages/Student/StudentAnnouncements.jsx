import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import StudentListView from './StudentListView';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName } from './studentAccess';
import { getStudentHeaderActions, showStudentDetails } from './studentHeaderActions';
import './StudentModule.css';

const AnnouncementIcon = ({ type }) => {
  const paths = {
    urgent: <><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-6 6v3.2L4 15v1h16v-1l-2-2.8V9a6 6 0 0 0-6-6Z" /></>,
    event: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    fee: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 14h3" /></>,
    dots: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="sm-announcement-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const announcements = [
  {
    id: 1,
    title: 'Mid-term exams begin April 25',
    type: 'Urgent',
    date: 'Apr 20, 2025',
    time: '10:30 AM',
    detail: 'Check your exam timetable and arrive at least 20 minutes early.',
  },
  {
    id: 2,
    title: 'Sports day registration open',
    type: 'Event',
    date: 'Apr 18, 2025',
    time: '09:15 AM',
    detail: 'Register for cricket, football, or athletics before the deadline.',
  },
  {
    id: 3,
    title: 'Fee payment deadline',
    type: 'Fee',
    date: 'Apr 15, 2025',
    time: '02:45 PM',
    detail: 'Monthly fees should be submitted before the end of the month.',
  },
];

export default function StudentAnnouncements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [student, setStudent] = useState(null);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const result = await fetch(`${API_BASE}/students`).then((r) => r.json());
        setStudent(result.success ? findCurrentStudent(result.data, user) : null);
      } catch (error) {
        console.error('Student announcement profile fetch failed:', error);
      }
    };

    fetchStudent();
  }, [user]);

  const filtered = announcements.filter((item) => {
    const query = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(query) || item.detail.toLowerCase().includes(query) || item.type.toLowerCase().includes(query);
  });

  const columns = [
    { key: 'announcement', label: 'Announcement', defaultWidth: 420, visible: true },
    { key: 'type', label: 'Type', defaultWidth: 180, visible: true },
    { key: 'detail', label: 'Detail', defaultWidth: 560, visible: true }
  ];

  const getTone = (type) => type === 'Urgent' ? 'urgent' : type === 'Fee' ? 'fee' : 'event';
  const headerActions = getStudentHeaderActions({
    pageName: 'Announcements',
    exportFileName: 'student-announcements.csv',
    exportColumns: [
      { key: 'title', label: 'Announcement' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'detail', label: 'Detail' }
    ],
    exportRows: filtered
  });

  const renderCell = (item, column) => {
    const tone = getTone(item.type);
    switch (column.key) {
      case 'announcement':
        return (
          <div className="sm-announcement-title-cell">
            <span className={`sm-announcement-type-icon ${tone}`}><AnnouncementIcon type={tone} /></span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.date} - {item.time}</small>
            </span>
          </div>
        );
      case 'type':
        return <span className={`sm-pill ${tone === 'urgent' ? 'red' : tone === 'fee' ? 'green' : ''}`}>{item.type}</span>;
      case 'detail':
        return item.detail;
      default:
        return '-';
    }
  };

  return (
    <DashboardLayout userRole="student" currentPath="/student/announcement" userName={studentName} userInitials={initials}>
      <div className="student-announcements-page">
        <div className="sm-page-header">
          <div>
            <h2>Announcements</h2>
            <p>Important notices from your school</p>
          </div>
          <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
        </div>

        <Header {...headerActions} />

        <StudentListView
          storageKey="student-announcements-columns-v2"
          columnDefinitions={columns}
          rows={filtered}
          getRowId={(item) => item.id}
          renderCell={renderCell}
          isLoading={false}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search announcements..."
          emptyMessage="No announcements found."
          itemLabel="announcements"
          actionsHeader=""
          actionsWidth={72}
          renderActions={(item) => (
            <button
              className="sm-announcement-action"
              type="button"
              aria-label="Announcement options"
              onClick={() => showStudentDetails(item.title, [
                { label: 'Type', value: item.type },
                { label: 'Date', value: `${item.date} - ${item.time}` },
                { label: 'Detail', value: item.detail }
              ])}
            >
              <AnnouncementIcon type="dots" />
            </button>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
