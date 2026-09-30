import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import './TeacherModule.css';
import { API_BASE, findCurrentTeacher, getInitials, getStoredUser, getTeacherName } from './teacherModuleData';
import { getTeacherHeaderActions, showTeacherPopup } from './teacherHeaderActions';

const announcements = [
  {
    id: 1,
    title: 'Mid-term exams begin April 25',
    audience: 'All students',
    type: 'Urgent',
    detail: 'Students are advised to review their timetables and bring required stationery.',
    date: 'May 17, 2025',
    icon: 'calendar'
  },
  {
    id: 2,
    title: 'Parent-teacher meeting',
    audience: 'Teachers',
    type: 'General',
    detail: 'Subject teachers should prepare class progress notes before the meeting.',
    date: 'May 16, 2025',
    icon: 'users'
  },
  {
    id: 3,
    title: 'Fee deadline reminder',
    audience: 'Grades 6-10',
    type: 'Fee',
    detail: 'Please remind students to submit monthly dues before the end of the month.',
    date: 'May 15, 2025',
    icon: 'wallet'
  },
];

const AnnouncementIcon = ({ type }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    megaphone: <><path d="m3 11 18-5v12L3 13v-2Z" /><path d="M11 15v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></>,
    wallet: <><path d="M20 7H5a2 2 0 0 0 0 4h15v8H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h15v4Z" /><path d="M16 14h.01" /></>,
    chevron: <path d="m9 18 6-6-6-6" />
  };

  return (
    <svg className="tm-ann-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function TeacherAnnouncements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherInitials, setTeacherInitials] = useState('TR');

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        const user = getStoredUser();
        const result = await fetch(`${API_BASE}/teachers`).then((r) => r.json());
        const name = getTeacherName(findCurrentTeacher(result.success ? result.data : [], user));
        setTeacherName(name);
        setTeacherInitials(getInitials(name));
      } catch (error) {
        console.error('Teacher identity fetch failed:', error);
      }
    };

    loadTeacher();
  }, []);

  const filtered = announcements.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(query) ||
      item.audience.toLowerCase().includes(query) ||
      item.detail.toLowerCase().includes(query);
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });
  const headerActions = getTeacherHeaderActions({
    pageName: 'Announcements',
    exportFileName: 'teacher-announcements.csv',
    exportColumns: [
      { key: 'title', label: 'Title' },
      { key: 'audience', label: 'Audience' },
      { key: 'type', label: 'Type' },
      { key: 'detail', label: 'Detail' },
      { key: 'date', label: 'Date' }
    ],
    exportRows: filtered
  });

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/announcement" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-ann-page">
        <div className="tm-ann-header">
          <div>
            <h1>Announcements</h1>
            <p>School notices and messages relevant to teachers</p>
          </div>
          <div className="tm-profile-chip tm-ann-profile">{teacherInitials}</div>
        </div>
        <Header {...headerActions} />

        <div className="tm-ann-toolbar">
          <label className="tm-ann-search">
            <AnnouncementIcon type="search" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search announcements..." />
          </label>
          <label className="tm-ann-filter">
            <AnnouncementIcon type="filter" />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option>All</option>
              <option>Urgent</option>
              <option>General</option>
              <option>Fee</option>
            </select>
          </label>
        </div>

        <section className="tm-ann-card">
          <div className="tm-ann-card-header">
            <div className="tm-ann-card-title">
              <span><AnnouncementIcon type="megaphone" /></span>
              <h2>Recent announcements</h2>
            </div>
            <button
              type="button"
              className="tm-ann-new-btn"
              onClick={() => showTeacherPopup({
                title: 'New announcement',
                text: 'Announcement creation is managed from the admin module.',
                icon: 'info'
              })}
            >
              <AnnouncementIcon type="plus" /> New announcement
            </button>
          </div>

          <div className="tm-ann-list">
            {filtered.length > 0 ? filtered.map((item) => (
              <article className="tm-ann-row" key={item.id}>
                <span className={`tm-ann-row-icon ${item.type.toLowerCase()}`}><AnnouncementIcon type={item.icon} /></span>
                <div className="tm-ann-row-copy">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <div className="tm-ann-meta">
                  <span className={`tm-ann-badge ${item.type.toLowerCase()}`}>{item.type}</span>
                  <time><AnnouncementIcon type="calendar" /> {item.date}</time>
                </div>
              </article>
            )) : <div className="tm-empty">No announcements found.</div>}
          </div>

          <div className="tm-ann-footer">
            <span>Showing 1 to {filtered.length} of {filtered.length} announcements</span>
            <div className="tm-ann-pages">
              <button type="button" aria-label="Previous page">&lt;</button>
              <button type="button" className="active">1</button>
              <button type="button" aria-label="Next page"><AnnouncementIcon type="chevron" /></button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
