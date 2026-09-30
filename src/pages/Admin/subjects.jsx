import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // 👉 SweetAlert2 import kiya gaya hai
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import AdminListView from '../../components/AdminListView';
import AdminColumnDrawer from '../../components/AdminColumnDrawer';
import './subjects.css';

/* Icons */
const IconBook = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/></svg>;
const SvgClipboard = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5h6"/><path d="M9 3h6v4H9z"/><path d="M7 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M8 12h8M8 16h6"/></svg>;
const SvgBookOpen = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.5A7 7 0 0 0 5 4H3v15h2a7 7 0 0 1 7 2.5"/><path d="M12 6.5A7 7 0 0 1 19 4h2v15h-2a7 7 0 0 0-7 2.5"/><path d="M12 6.5v15"/></svg>;
const SvgCap = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M7 10.5v4.2c0 1.2 2.2 2.3 5 2.3s5-1.1 5-2.3v-4.2"/><path d="M21 8v6"/></svg>;
const SvgFolder = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>;
const SvgCalc = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01"/></svg>;
const SvgLanguage = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 5h8M8 3v2M10 5c-.8 4.2-2.8 7.5-6 10"/><path d="M5 9c1.2 2 3 3.7 5.5 5"/><path d="M14 20l4-9 4 9"/><path d="M15.5 17h5"/></svg>;
const SvgUrdu = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M16.7 6.5c.9 0 1.6.7 1.6 1.6 0 2.9-2.3 5.3-5.2 5.3H11c-.6 0-1 .4-1 1s.4 1 1 1h6.6v2H11c-1.7 0-3-1.3-3-3s1.3-3 3-3h2.1c1.8 0 3.2-1.5 3.2-3.3 0-.1-.1-.1-.1-.1h-1.7v-2h2.2ZM7.2 17.6c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2Z"/></svg>;
const SvgChart = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 19V9M12 19V5M19 19v-7"/></svg>;
const SvgMore = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"/></svg>;
const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>;
const SvgColumns = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14M15 5v14"/></svg>;
const SvgEye = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
const SvgEyeOff = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 3 18 18"/><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"/><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1"/><path d="M6.1 6.8C3.5 8.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1"/></svg>;
const SvgGrip = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M9 5.5A1.5 1.5 0 1 1 6 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-13A1.5 1.5 0 1 1 15 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/></svg>;
const SubjectLineIcon = ({ type }) => {
  const paths = {
    close: <path d="M18 6 6 18M6 6l12 12"/>,
    check: <path d="m20 6-11 11-5-5"/>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/></>,
    tag: <><path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z"/><path d="M7.5 7.5h.01"/></>,
    chart: <path d="M5 19V9M12 19V5M19 19v-7"/>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.4.2.7.5.9.9.2.3.4.7.4 1.1V11a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.21 0Z"/></>,
  };
  return <svg className="sbj-line-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{paths[type] || paths.book}</svg>;
};

const getSubjectIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('math')) return <SvgCalc />;
  if (lower.includes('english')) return <SvgLanguage />;
  if (lower.includes('urdu')) return <SvgUrdu />;
  return <SvgBookOpen />;
};

const SUBJECT_VIEW_STORAGE_KEY = 'edusync.admin.subjects.columnView.v1';
const subjectColumnDefinitions = [
  { key: 'subjectName', label: 'Subject', defaultWidth: 250, visible: true },
  { key: 'type', label: 'Type', defaultWidth: 130, visible: true },
  { key: 'teachers', label: 'Teachers', defaultWidth: 130, visible: true },
  { key: 'classes', label: 'Classes', defaultWidth: 130, visible: true },
  { key: 'avgScore', label: 'Avg Score', defaultWidth: 140, visible: true },
  { key: 'gradeLevel', label: 'Grade Level', defaultWidth: 160, visible: false },
  { key: 'subjectCode', label: 'Subject Code', defaultWidth: 160, visible: false },
  { key: 'weeklyPeriods', label: 'Weekly Periods', defaultWidth: 170, visible: false },
  { key: 'creditHours', label: 'Credit Hours', defaultWidth: 150, visible: false },
  { key: 'lab', label: 'Lab', defaultWidth: 110, visible: false }
];

const buildDefaultSubjectColumns = () => subjectColumnDefinitions.map((column, index) => ({
  ...column,
  width: column.defaultWidth,
  order: index
}));

export default function Subjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectsData, setSubjectsData] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState('add');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [columns, setColumns] = useState(() => {
    const defaults = buildDefaultSubjectColumns();
    try {
      const saved = JSON.parse(localStorage.getItem(SUBJECT_VIEW_STORAGE_KEY));
      if (!Array.isArray(saved)) return defaults;
      return defaults.map((column) => {
        const savedColumn = saved.find((item) => item.key === column.key);
        return savedColumn
          ? {
              ...column,
              visible: savedColumn.visible !== false,
              width: Number(savedColumn.width) || column.defaultWidth,
              order: Number.isFinite(savedColumn.order) ? savedColumn.order : column.order
            }
          : column;
      });
    } catch {
      return defaults;
    }
  });
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [draftColumns, setDraftColumns] = useState([]);
  const [draggedColumnKey, setDraggedColumnKey] = useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState(null);
  const [tableDragColumnKey, setTableDragColumnKey] = useState(null);
  const [tableDragTargetKey, setTableDragTargetKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

  // 👉 NEW: Checkbox Selection State
  const [selectedRows, setSelectedRows] = useState([]);

  const initialFormState = {
    subjectName: '', subjectCode: '', gradeLevel: '',
    subjectCategory: 'Core', teacherName: '', weeklyPeriods: '5',
    creditHours: '3', isElective: false, hasLab: false
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subjects");
      const result = await response.json();
      if (result.success) setSubjectsData(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const result = await response.json();
      if (result.success) {
        const uniqueGrades = [...new Set(result.data.map(c => c.grade).filter(Boolean))];
        setAvailableGrades(uniqueGrades);
      }
    } catch (err) { console.error("Failed to fetch classes for grades:", err); }
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    const compactColumns = columns.map(({ key, visible, width, order }) => ({ key, visible, width, order }));
    localStorage.setItem(SUBJECT_VIEW_STORAGE_KEY, JSON.stringify(compactColumns));
  }, [columns]);

  // 👉 NEW: Bulk Delete Logic for Subjects
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Selection',
        text: 'Bhai, pehle delete karne ke liye subject select toh karein!',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Selected ${selectedRows.length} subject(s) will be deleted permanently!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete selected'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/subjects/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows })
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Subjects removed successfully.', timer: 1500, showConfirmButton: false });
          setSelectedRows([]);
          fetchSubjects();
        } else {
          Swal.fire('Error', data.message, 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Server connection failed', 'error');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedSubjectId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setModalMode('edit');
    setSelectedSubjectId(subject.subject_id);
    setFormData({
      subjectName: subject.subject_name || '',
      subjectCode: subject.subject_code || '',
      gradeLevel: subject.grade_level || '',
      subjectCategory: subject.subject_category || 'Core',
      teacherName: subject.teacher_name || '',
      weeklyPeriods: subject.weekly_periods || '5',
      creditHours: subject.credit_hours || '3',
      isElective: subject.is_elective === true || subject.subject_category === 'Elective',
      hasLab: subject.has_lab === true
    });
    setIsModalOpen(true);
  };

  const showSubjectFormNotice = () => {
    Swal.fire({
      title: 'Required fields missing',
      text: 'Please fill Subject Name and Grade Level before saving.',
      icon: 'warning',
      confirmButtonText: 'Review form',
      customClass: {
        container: 'sbj-swal-container',
        popup: 'sbj-swal-popup',
        icon: 'sbj-swal-icon',
        title: 'sbj-swal-title',
        htmlContainer: 'sbj-swal-text',
        confirmButton: 'sbj-swal-confirm'
      },
      buttonsStyling: false
    }).then(() => {
      setTimeout(() => {
        const modalBody = document.querySelector('.sbj-modal-body');
        modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
        const field = document.querySelector('.sbj-modal [name="subjectName"]');
        field?.focus?.();
      }, 80);
    });
  };

  const handleSaveSubject = async () => {
    if (!formData.subjectName || !formData.gradeLevel) {
      showSubjectFormNotice();
      return;
    }

    try {
      const url = modalMode === 'edit'
        ? `/api/subjects/${selectedSubjectId}`
        : "/api/subjects";
      const response = await fetch(url, {
        method: modalMode === 'edit' ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        setModalMode('add');
        setSelectedSubjectId(null);
        setFormData(initialFormState);
        setSelectedRows([]);
        fetchSubjects();
      } else {
        Swal.fire('Could not save subject', data.message || 'Please try again.', 'error');
      }
    } catch (err) { Swal.fire('Connection failed', 'Error connecting to server.', 'error'); }
  };

  // 👉 Checkbox Handlers
  const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
  const visibleColumns = orderedColumns.filter((column) => column.visible);

  const getColumnValue = (subject, key) => ({
    subjectName: subject.subject_name,
    type: subject.subject_category,
    teachers: subject.teacher_name ? 1 : 0,
    classes: subject.weekly_periods,
    avgScore: '--',
    gradeLevel: subject.grade_level,
    subjectCode: subject.subject_code,
    weeklyPeriods: subject.weekly_periods,
    creditHours: subject.credit_hours,
    lab: subject.has_lab ? 'Yes' : 'No'
  }[key] ?? '');

  const renderColumnValue = (subject, column) => {
    if (column.key === 'subjectName') {
      return (
        <button className="sbj-record-link" type="button" onClick={() => openEditModal(subject)}>
          {subject.subject_name}
        </button>
      );
    }

    if (column.key === 'type') {
      const category = subject.subject_category || 'Core';
      return <span className={`sbj-pill ${category.toLowerCase()}`}>{category}</span>;
    }

    return getColumnValue(subject, column.key) || '-';
  };

  const handleColumnWidthChange = (key, width) => {
    const numericWidth = Math.max(100, Math.min(Number(width) || 100, 440));
    setColumns((prev) => prev.map((column) => column.key === key ? { ...column, width: numericWidth } : column));
  };

  const moveColumnTo = (sourceKey, targetKey) => {
    setColumns((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const sourceIndex = sorted.findIndex((column) => column.key === sourceKey);
      const targetIndex = sorted.findIndex((column) => column.key === targetKey);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return prev;
      const reordered = [...sorted];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered.map((column, order) => ({ ...column, order }));
    });
  };

  const handleColumnDragStart = (e, key) => {
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
    setTableDragColumnKey(key);
  };

  const handleColumnDrop = (e, targetKey) => {
    e.preventDefault();
    moveColumnTo(e.dataTransfer.getData('text/plain'), targetKey);
    setTableDragColumnKey(null);
    setTableDragTargetKey(null);
  };

  const handleColumnDragEnd = () => {
    setTableDragColumnKey(null);
    setTableDragTargetKey(null);
  };

  const startColumnResize = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columns.find((column) => column.key === key)?.width || 140;
    const handleMouseMove = (moveEvent) => handleColumnWidthChange(key, startWidth + moveEvent.clientX - startX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('sbj-resizing-columns');
    };
    document.body.classList.add('sbj-resizing-columns');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const openColumnModal = () => {
    setDraftColumns([...columns].sort((a, b) => a.order - b.order));
    setColumnSearchTerm('');
    setIsColumnModalOpen(true);
  };

  const closeColumnModal = () => {
    setIsColumnModalOpen(false);
    setColumnSearchTerm('');
    setDraftColumns([]);
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
  };

  const applyColumnChanges = () => {
    setColumns(draftColumns.map((column, order) => ({ ...column, order })));
    closeColumnModal();
  };

  const sortDraftVisibleFirst = () => {
    setDraftColumns((prev) => [...prev]
      .sort((a, b) => Number(b.visible) - Number(a.visible) || a.order - b.order)
      .map((column, order) => ({ ...column, order })));
  };

  const handleDraftColumnToggle = (key) => {
    setDraftColumns((prev) => prev.map((column) => (
      column.key === key ? { ...column, visible: !column.visible } : column
    )));
  };

  const moveDraftColumnTo = (sourceKey, targetKey) => {
    setDraftColumns((prev) => {
      const sourceIndex = prev.findIndex((column) => column.key === sourceKey);
      const targetIndex = prev.findIndex((column) => column.key === targetKey);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return prev;
      const reordered = [...prev];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered.map((column, order) => ({ ...column, order }));
    });
  };

  const handleDraftColumnDragStart = (e, key) => {
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedColumnKey(key);
  };

  const handleDraftColumnDrop = (e, targetKey) => {
    e.preventDefault();
    moveDraftColumnTo(e.dataTransfer.getData('text/plain'), targetKey);
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
  };

  const handleDraftColumnDragEnd = () => {
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
  };

  const modalColumns = (draftColumns.length ? draftColumns : orderedColumns)
    .filter((column) => column.label.toLowerCase().includes(columnSearchTerm.toLowerCase().trim()));
  const draftVisibleCount = (draftColumns.length ? draftColumns : orderedColumns).filter((column) => column.visible).length;

  const filteredSubjects = subjectsData.filter((subject) => {
    const search = searchTerm.toLowerCase().trim();
    return !search || visibleColumns.some((column) => String(getColumnValue(subject, column.key)).toLowerCase().includes(search));
  });

  const lastRecordIndex = currentPage * recordsPerPage;
  const firstRecordIndex = lastRecordIndex - recordsPerPage;
  const currentSubjects = filteredSubjects.slice(firstRecordIndex, lastRecordIndex);
  const totalPages = Math.ceil(filteredSubjects.length / recordsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentSubjects.map(sub => sub.subject_id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected = currentSubjects.length > 0 && currentSubjects.every(sub => selectedRows.includes(sub.subject_id));

  // 👉 EXPORT TO EXCEL/CSV LOGIC (WITH SWEET ALERT)
  const handleExport = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one subject from the checkboxes to export.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Okay'
      });
      return;
    }

    // Filter only selected subjects
    const selectedData = subjectsData.filter(record => selectedRows.includes(record.subject_id));

    // Create CSV Headers
    const headers = ["Subject ID", "Subject Name", "Type", "Teachers Assigned", "Weekly Classes", "Avg Score"];

    // Create CSV Rows Data
    const csvRows = selectedData.map(record => {
      return [
        record.subject_id,
        `"${record.subject_name}"`,
        `"${record.subject_category}"`,
        `"${record.teacher_name ? 1 : 0}"`,
        `"${record.weekly_periods}"`,
        `"--"` // Static dash just like your table view
      ].join(',');
    });

    // Combine Headers and Rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create a Blob and trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Subjects_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout userRole="admin" currentPath="/subjects" userName="System Admin" userInitials="SA">
      <div className="sbj-page-header">
        <div className="sbj-header-left">
          <h2>Subjects</h2>
          <p>{subjectsData.length} subjects across all grades</p>
        </div>
        <div className="sbj-header-right">
          <button className="sbj-btn-primary" onClick={openAddModal}>+ Add subject</button>
          <div className="sbj-avatar">SA</div>
        </div>
      </div>

      {/* 👉 HEADER UPDATED WITH ONDELETE PROP */}
      <Header
        onExport={handleExport}
        onRefresh={fetchSubjects}
        onDelete={handleDelete}
        onEdit={() => {
          const subject = subjectsData.find((item) => item.subject_id === selectedRows[0]);
          selectedRows.length === 1 && subject
            ? openEditModal(subject)
            : Swal.fire('Select one subject', 'Choose exactly one subject checkbox, then click Edit.', 'info');
        }}
      />

      <div className="sbj-scroll-wrapper">
        <div className="sbj-main-grid">
          <AdminListView
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setSelectedRows([]);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search visible columns..."
            searchIcon={<SvgSearch />}
            configureIcon={<SvgColumns />}
            onConfigure={openColumnModal}
            columns={visibleColumns}
            rows={currentSubjects}
            getRowId={(subject) => subject.subject_id}
            renderCell={renderColumnValue}
            isLoading={isLoading}
            selectedRows={selectedRows}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            tableDragColumnKey={tableDragColumnKey}
            tableDragTargetKey={tableDragTargetKey}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={(event, key) => {
              event.preventDefault();
              setTableDragTargetKey(key);
            }}
            onColumnDragLeave={(key) => setTableDragTargetKey((current) => current === key ? null : current)}
            onColumnDrop={handleColumnDrop}
            onColumnDragEnd={handleColumnDragEnd}
            onColumnResizeStart={startColumnResize}
            minWidthExtra={110}
            actionsHeader=""
            actionsWidth={70}
            loadingMessage="Loading records..."
            emptyMessage="No subjects found."
            renderActions={(sub) => (
              <button className="sbj-more-btn" type="button" aria-label="More subject actions" onClick={() => Swal.fire(sub.subject_name, `Type: ${sub.subject_category}\nGrade: ${sub.grade_level || '-'}\nWeekly periods: ${sub.weekly_periods || '-'}`, 'info')}><SvgMore /></button>
            )}
            paginationLabel={`Showing ${currentSubjects.length > 0 ? firstRecordIndex + 1 : 0} to ${Math.min(lastRecordIndex, filteredSubjects.length)} of ${filteredSubjects.length} subjects`}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              setSelectedRows([]);
            }}
          />
            {localStorage.getItem('edusync.showLegacyList') === 'true' && (
            <table className="sbj-table">
              <thead>
                <tr>
                  {/* 👉 Header Checkbox */}
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Teachers</th>
                  <th>Classes</th>
                  <th>Avg Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>Loading records...</td></tr>
                ) : (
                  subjectsData.map((sub) => (
                    <tr key={sub.subject_id} className={selectedRows.includes(sub.subject_id) ? 'selected-row' : ''}>
                      {/* 👉 Row Checkbox */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(sub.subject_id)}
                          onChange={() => handleSelectRow(sub.subject_id)}
                        />
                      </td>
                      <td>
                        <div className="sbj-subject-cell">
                          <span className={`sbj-subject-icon color-${sub.subject_id % 4}`}>
                            {getSubjectIcon(sub.subject_name)}
                          </span>
                          <span className="sbj-subject-name">{sub.subject_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`sbj-pill ${sub.subject_category.toLowerCase()}`}>
                          {sub.subject_category}
                        </span>
                      </td>
                      <td>{sub.teacher_name ? 1 : 0}</td>
                      <td>{sub.weekly_periods}</td>
                      <td>--</td>
                      <td>
                        <button className="sbj-more-btn" type="button" aria-label="More subject actions" onClick={() => Swal.fire(sub.subject_name, `Type: ${sub.subject_category}\nGrade: ${sub.grade_level || '-'}\nWeekly periods: ${sub.weekly_periods || '-'}`, 'info')}><SvgMore /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}

        </div>
      </div>

      <AdminColumnDrawer
        isOpen={isColumnModalOpen}
        title="Fields"
        description="Choose which columns appear in the subjects list."
        searchTerm={columnSearchTerm}
        onSearchChange={setColumnSearchTerm}
        columns={modalColumns}
        visibleCount={draftVisibleCount}
        onVisibleFirst={sortDraftVisibleFirst}
        onClose={closeColumnModal}
        onApply={applyColumnChanges}
        onToggleColumn={handleDraftColumnToggle}
        onDragStart={handleDraftColumnDragStart}
        onDragOver={(e, key) => { e.preventDefault(); setDragOverColumnKey(key); }}
        onDragLeave={(key) => setDragOverColumnKey((current) => current === key ? null : current)}
        onDrop={handleDraftColumnDrop}
        onDragEnd={handleDraftColumnDragEnd}
        draggedColumnKey={draggedColumnKey}
        dragOverColumnKey={dragOverColumnKey}
        searchIcon={<SvgSearch />}
        visibleIcon={<SvgEye />}
        hiddenIcon={<SvgEyeOff />}
        gripIcon={<SvgGrip />}
      />

      {isModalOpen && (
        <div className="sbj-modal-overlay">
          <div className="sbj-modal">
            <div className="sbj-modal-header">
              <div className="sbj-modal-title-group">
                <div className="sbj-modal-icon"><IconBook /></div>
                <div className="sbj-modal-title">
                  <h2>{modalMode === 'edit' ? 'Update Subject' : 'Add New Subject'}</h2>
                  <p>Define a new subject for the curriculum</p>
                </div>
              </div>
              <div className="sbj-header-actions">
                <div className="sbj-badge-pill"><IconBook />New Curriculum</div>
                <button className="sbj-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close"><SubjectLineIcon type="close" /></button>
              </div>
            </div>

            <div className="sbj-modal-body">
              <div className="sbj-modal-card sbj-general-card">
              <div className="sbj-section-title">General Information</div>
              <div className="sbj-form-row-2">
                <div className="sbj-form-group">
                  <label>Subject Name <span>*</span></label>
                  <input type="text" name="subjectName" value={formData.subjectName} onChange={handleInputChange} className="sbj-input" placeholder="e.g. Mathematics" />
                </div>
                <div className="sbj-form-group">
                  <label>Subject Code</label>
                  <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} className="sbj-input" placeholder="e.g. MATH-101" />
                </div>
              </div>

              <div className="sbj-form-row-2">
                <div className="sbj-form-group">
                  <label>Grade Level <span>*</span></label>
                  <select name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange} className="sbj-input">
                    <option value="">Select Grade</option>
                    {availableGrades.length > 0 ? (
                      availableGrades.map((g, index) => (
                        <option key={index} value={g}>{g}</option>
                      ))
                    ) : (
                      [...Array(10)].map((_, i) => (
                        <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="sbj-form-group">
                  <label>Subject Category</label>
                  <div className="sbj-radio-group">
                    <label className="sbj-radio-label">
                      <input type="radio" name="subjectCategory" value="Core" checked={formData.subjectCategory === 'Core'} onChange={handleInputChange} />
                      <span className="sbj-radio-circle"></span> Core
                    </label>
                    <label className="sbj-radio-label">
                      <input type="radio" name="subjectCategory" value="Elective" checked={formData.subjectCategory === 'Elective'} onChange={handleInputChange} />
                      <span className="sbj-radio-circle"></span> Elective
                    </label>
                  </div>
                </div>
              </div>

              </div>

              <div className="sbj-modal-card sbj-settings-card">
              <div className="sbj-section-title">Settings</div>
              <div className="sbj-switch-card">
                <div className="sbj-switch-row">
                  <div className="sbj-switch-label">
                    <h4>Elective Subject</h4>
                    <p>Mark if students can choose this as an option</p>
                  </div>
                  <div className={`sbj-toggle ${formData.isElective ? 'on' : ''}`} onClick={() => setFormData({...formData, isElective: !formData.isElective})}></div>
                </div>
                <div className="sbj-switch-row">
                  <div className="sbj-switch-label">
                    <h4>Lab Required</h4>
                    <p>Requires practical lab sessions</p>
                  </div>
                  <div className={`sbj-toggle ${formData.hasLab ? 'on' : ''}`} onClick={() => setFormData({...formData, hasLab: !formData.hasLab})}></div>
                </div>
              </div>
              </div>
            </div>

            <div className="sbj-modal-footer">
              <span className="sbj-req-text">* Required fields</span>
              <div className="sbj-footer-actions">
                <button className="sbj-btn-discard" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="sbj-btn-publish" onClick={handleSaveSubject}>
                  {modalMode === 'edit' ? 'Update Subject' : 'Add Subject'} <SubjectLineIcon type="check" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
