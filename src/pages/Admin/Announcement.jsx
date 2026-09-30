import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import './Announcement.css';

const announcementList = [
  {
    title: 'Mid-term exams begin April 25',
    meta: 'Posted Apr 10 · Admin · All students',
    desc: 'Exams will be held from April 25 to May 2. Students are advised to check their timetables.',
    month: 'APR',
    day: '25',
    tags: [{ text: 'All students', color: 'blue' }, { text: 'Read by 94%', color: 'gray' }],
    badge: { text: 'Urgent', type: 'urgent' },
  },
  {
    title: 'Parent-teacher meeting - April 28',
    meta: 'Posted Apr 12 · Admin · All',
    desc: 'PTM scheduled from 9 AM to 1 PM. All subject teachers are required to be present.',
    month: 'APR',
    day: '28',
    tags: [{ text: 'All students', color: 'blue' }, { text: 'All teachers', color: 'green' }, { text: 'Read by 82%', color: 'gray' }],
    badge: { text: 'General', type: 'general' },
  },
  {
    title: 'Sports day registration open',
    meta: 'Posted Apr 15 · Admin · All students',
    desc: 'Register for sports day events by April 22. Available events: cricket, football, athletics.',
    month: 'MAY',
    day: '15',
    tags: [{ text: 'All students', color: 'blue' }, { text: 'Read by 74%', color: 'gray' }],
    badge: { text: 'Event', type: 'event' },
  },
];

const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>;
const SvgPlus = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>;
const SvgArrowRight = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" /></svg>;
const SvgPaperPlane = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>;
const SvgCalendar = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" /></svg>;
const SvgPeople = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;
const SvgTrend = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4L19.7 9.71 22 12V6h-6z" /></svg>;

const getPakistanMonthKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
  }).format(date);
};

const getBadgeType = (item) => {
  if ((item.priority || '').toLowerCase() === 'urgent') return 'urgent';
  const category = (item.category || '').toLowerCase();
  if (category.includes('event')) return 'event';
  if (category.includes('fee')) return 'fee';
  return 'general';
};

const formatAnnouncement = (row) => {
  const createdAt = row.created_at ? new Date(row.created_at) : new Date();
  const badgeType = getBadgeType(row);
  return {
    id: row.announcement_id,
    title: row.title,
    meta: `Posted ${createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${row.created_by || 'Admin'} - ${row.audience || 'All'}`,
    desc: row.message,
    month: createdAt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: createdAt.toLocaleDateString('en-US', { day: '2-digit' }),
    category: row.category || 'General',
    priority: row.priority || 'Normal',
    audience: row.audience || 'All students',
    status: row.status || 'Published',
    readRate: row.read_rate || 0,
    createdAt: row.created_at,
    tags: [
      { text: row.audience || 'All students', color: (row.audience || '').toLowerCase().includes('teacher') ? 'green' : 'blue' },
      { text: `Read by ${row.read_rate || 0}%`, color: 'gray' }
    ],
    badge: { text: badgeType === 'urgent' ? 'Urgent' : row.category || 'General', type: badgeType },
  };
};

export default function Announcements() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Exam',
    priority: 'Normal',
    message: '',
    audience: 'All students'
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/announcements');
      const result = await response.json();
      if (result.success) {
        setAnnouncements(result.data.map(formatAnnouncement));
      } else {
        throw new Error(result.message || 'Unable to load announcements.');
      }
    } catch (err) {
      console.error('Announcement fetch error:', err);
      setAnnouncements(announcementList.map((item, index) => ({ ...item, id: `fallback-${index}` })));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const filteredAnnouncements = announcements.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);

    let matchesCategory = true;
    if (activeFilter === 'Students') {
      matchesCategory = item.tags.some((tag) => tag.text.toLowerCase().includes('student'));
    } else if (activeFilter === 'Teachers') {
      matchesCategory = item.tags.some((tag) => tag.text.toLowerCase().includes('teacher'));
    } else if (activeFilter === 'Urgent') {
      matchesCategory = item.badge.type === 'urgent';
    }

    return matchesSearch && matchesCategory;
  });

  const announcementStats = useMemo(() => {
    const currentMonthKey = getPakistanMonthKey();
    const thisMonth = announcements.filter((item) => getPakistanMonthKey(item.createdAt) === currentMonthKey);
    const urgentCount = announcements.filter((item) => item.badge.type === 'urgent' || String(item.priority).toLowerCase() === 'urgent').length;
    const studentsAudience = announcements.some((item) => String(item.audience).toLowerCase().includes('student'));
    const teachersAudience = announcements.some((item) => String(item.audience).toLowerCase().includes('teacher'));
    const audienceLabels = [];
    if (studentsAudience) audienceLabels.push('Students');
    if (teachersAudience) audienceLabels.push('Teachers');
    if (!audienceLabels.length && announcements.length) audienceLabels.push('All users');
    const averageReadRate = announcements.length
      ? Math.round(announcements.reduce((sum, item) => sum + Number(item.readRate || 0), 0) / announcements.length)
      : 0;

    return {
      totalSent: announcements.length,
      thisMonth: thisMonth.length,
      urgentCount,
      audienceReach: audienceLabels.length ? audienceLabels.join(' + ') : 'No audience yet',
      averageReadRate,
    };
  }, [announcements]);

  const handleSelectAll = (e) => {
    setSelectedAnnouncements(e.target.checked ? filteredAnnouncements.map((item) => item.id) : []);
  };

  const handleSelectAnnouncement = (id) => {
    setSelectedAnnouncements((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const handleExport = () => {
    if (selectedAnnouncements.length === 0) {
      Swal.fire('No selection', 'Please select at least one announcement to export.', 'info');
      return;
    }
    const selectedRows = announcements.filter((item) => selectedAnnouncements.includes(item.id));
    const csv = [
      'Title,Posted,Description,Category',
      ...selectedRows.map((item) => `"${item.title}","${item.meta}","${item.desc}","${item.badge.text}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Announcements_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedAnnouncementId(null);
    setFormData({ title: '', category: 'Exam', priority: 'Normal', message: '', audience: 'All students' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setSelectedAnnouncementId(item.id);
    setFormData({
      title: item.title,
      category: item.category || 'General',
      priority: item.priority || 'Normal',
      message: item.desc,
      audience: item.audience || 'All students'
    });
    setIsModalOpen(true);
  };

  const saveAnnouncement = async (status = 'Published') => {
    if (!formData.title || !formData.message) {
      Swal.fire('Required', 'Please enter both title and message.', 'warning');
      return;
    }

    try {
      const url = modalMode === 'edit'
        ? `/api/announcements/${selectedAnnouncementId}`
        : '/api/announcements';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status, createdBy: 'Admin' })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Could not save announcement.');

      setIsModalOpen(false);
      setSelectedAnnouncements([]);
      await fetchAnnouncements();
      Swal.fire(status === 'Draft' ? 'Draft saved' : 'Published', result.message, 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (selectedAnnouncements.length === 0) {
      Swal.fire('No selection', 'Please select announcements to delete.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete selected announcements?',
      text: `This will delete ${selectedAnnouncements.length} announcement(s) from the database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/announcements/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedAnnouncements })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Could not delete announcements.');

      setSelectedAnnouncements([]);
      await fetchAnnouncements();
      Swal.fire('Deleted', data.message, 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const isAllSelected = filteredAnnouncements.length > 0 && filteredAnnouncements.every((item) => selectedAnnouncements.includes(item.id));

  return (
    <DashboardLayout userRole="admin" currentPath="/admin/announcement" userName="System Admin" userInitials="SA">
      <header className="ann-header">
        <div className="ann-header-left">
          <h2>Announcements</h2>
          <p>Broadcast messages to students, teachers, or everyone</p>
        </div>
        <div className="ann-header-right">
          <button className="ann-btn-primary" onClick={openAddModal} type="button">
            <SvgPlus /> New announcement
          </button>
          <div className="ann-avatar">SA</div>
        </div>
      </header>

      <Header
        onEdit={() => {
          const item = announcements.find((announcement) => announcement.id === selectedAnnouncements[0]);
          selectedAnnouncements.length === 1 && item
            ? openEditModal(item)
            : Swal.fire('Select one announcement', 'Choose exactly one announcement checkbox, then click Edit.', 'info');
        }}
        onRefresh={() => { setSelectedAnnouncements([]); fetchAnnouncements(); }}
        onDelete={handleDelete}
        onExport={handleExport}
      />

      <div className="ann-stats-row">
        <div className="ann-stat-card">
          <div className="ann-stat-icon blue"><SvgPaperPlane /></div>
          <div className="ann-stat-copy"><span>Total sent</span><strong>{announcementStats.totalSent}</strong><small>Current records</small></div>
        </div>
        <div className="ann-stat-card">
          <div className="ann-stat-icon purple"><SvgCalendar /></div>
          <div className="ann-stat-copy"><span>This month</span><strong>{announcementStats.thisMonth}</strong><small className="purple">{announcementStats.urgentCount} urgent</small></div>
        </div>
        <div className="ann-stat-card">
          <div className="ann-stat-icon green"><SvgPeople /></div>
          <div className="ann-stat-copy"><span>Audience reach</span><strong>{announcementStats.totalSent}</strong><small>{announcementStats.audienceReach}</small></div>
        </div>
        <div className="ann-stat-card">
          <div className="ann-stat-icon orange"><SvgTrend /></div>
          <div className="ann-stat-copy"><span>Avg read rate</span><strong>{announcementStats.averageReadRate}%</strong><small className="green">Based on saved records</small></div>
        </div>
      </div>

      <div className="ann-controls">
        <div className="ann-search">
          <SvgSearch />
          <input type="text" placeholder="Search announcements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="ann-filters">
          {['All', 'Students', 'Teachers', 'Urgent'].map((filter) => (
            <button key={filter} className={`ann-filter-btn ${activeFilter === filter ? 'active' : ''}`} onClick={() => setActiveFilter(filter)} type="button">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="ann-list-container">
        <div className="ann-list-header">
          <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
          <span>Recent announcements</span>
        </div>
        <div className="ann-list-scroll">
          {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((item) => (
            <div key={item.id} className="ann-item">
              <input className="ann-row-checkbox" type="checkbox" checked={selectedAnnouncements.includes(item.id)} onChange={() => handleSelectAnnouncement(item.id)} />
              <div className={`ann-date-tile ${item.badge.type}`}>
                <span>{item.month}</span>
                <strong>{item.day}</strong>
              </div>
              <div className="ann-item-content">
                <div className="ann-title-row">
                  <span className="ann-item-title">{item.title}</span>
                  <span className={`ann-badge ${item.badge.type}`}>{item.badge.text}</span>
                </div>
                <span className="ann-item-meta">{item.meta}</span>
                <p className="ann-item-desc">{item.desc}</p>
                <div className="ann-tags">
                  {item.tags.map((tag) => <span key={tag.text} className={`ann-tag ${tag.color}`}>{tag.text}</span>)}
                </div>
              </div>
              <button className="ann-row-action" type="button" aria-label={`Open ${item.title}`} onClick={() => Swal.fire(item.title, item.desc, 'info')}><SvgArrowRight /></button>
            </div>
          )) : (
            <div className="ann-empty">No announcements match your search or filter.</div>
          )}
        </div>
        <div className="ann-list-footer">
          <span>Showing 1 to {filteredAnnouncements.length} of {filteredAnnouncements.length} announcements</span>
          <div className="ann-pagination">
            <button type="button" onClick={() => Swal.fire('Announcements', 'You are already on the first page.', 'info')}>‹</button>
            <button type="button" className="active" disabled>1</button>
            <button type="button" onClick={() => Swal.fire('Announcements', 'No more announcement pages available.', 'info')}>›</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="ann-modal-overlay">
          <div className="ann-modal">
            <div className="ann-modal-header">
              <div className="ann-modal-title">
                <h2>{modalMode === 'edit' ? 'Edit Announcement' : 'New Announcement'}</h2>
                <p>Broadcast a message to students, teachers, or everyone</p>
              </div>
              <span className="ann-draft-pill">Draft</span>
            </div>
            <div className="ann-modal-body">
              <div className="ann-form-group">
                <label>Title <span>*</span></label>
                <input className="ann-input" placeholder="e.g. Mid-term exams begin April 25" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="ann-form-row">
                <div className="ann-form-group">
                  <label>Category <span>*</span></label>
                  <select className="ann-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}><option>Exam</option><option>Event</option><option>Fee</option><option>General</option></select>
                </div>
                <div className="ann-form-group">
                  <label>Priority</label>
                  <select className="ann-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}><option>Normal</option><option>High</option><option>Urgent</option></select>
                </div>
              </div>
              <div className="ann-form-group">
                <label>Audience</label>
                <select className="ann-input" value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })}><option>All students</option><option>All teachers</option><option>All</option></select>
              </div>
              <div className="ann-form-group">
                <label>Message body <span>*</span></label>
                <textarea className="ann-input ann-textarea" placeholder="Write the full announcement message here..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
            </div>
            <div className="ann-modal-footer">
              <span className="ann-req-text">* Required fields</span>
              <div className="ann-footer-actions">
                <button className="ann-btn-discard" type="button" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button className="ann-btn-draft" type="button" onClick={() => saveAnnouncement('Draft')}>Save as draft</button>
                <button className="ann-btn-publish" type="button" onClick={() => saveAnnouncement('Published')}>{modalMode === 'edit' ? 'Update announcement' : 'Publish announcement'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
