import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // 👉 SweetAlert2 import kiya gaya hai
import DashboardLayout from '../../components/DashboardLayout'; 
import Header from '../../components/Header/header'; 
import AdminListView from '../../components/AdminListView';
import AdminColumnDrawer from '../../components/AdminColumnDrawer';
import './Classes.css';

/* Icons */
const IconSchool = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>;
const IconInfo = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>;
const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const SvgColumns = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14M15 5v14"/></svg>;
const SvgClassTile = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Z"/><path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Z"/><path d="M16 14c-2.67 0-5 1.34-5 3v2h10v-2c0-1.66-2.33-3-5-3Z"/><path d="M8 14c-2.67 0-5 1.34-5 3v2h5"/></svg>;
const SvgMore = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"/></svg>;
const SvgEye = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
const SvgEyeOff = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 3 18 18"/><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"/><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1"/><path d="M6.1 6.8C3.5 8.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1"/></svg>;
const SvgGrip = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M9 5.5A1.5 1.5 0 1 1 6 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-13A1.5 1.5 0 1 1 15 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/></svg>;
const ClassLineIcon = ({ type }) => {
  const paths = {
    close: <path d="M18 6 6 18M6 6l12 12"/>,
    check: <path d="m20 6-11 11-5-5"/>,
  };
  return <svg className="cl-line-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{paths[type] || paths.check}</svg>;
};

// Helper function to safely parse null/undefined
const val = (v) => (v !== null && v !== undefined) ? v : '';
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'NA';
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
};

const CLASS_VIEW_STORAGE_KEY = 'edusync.admin.classes.columnView.v1';
const classColumnDefinitions = [
  { key: 'className', label: 'Class', defaultWidth: 260, visible: true },
  { key: 'grade', label: 'Grade', defaultWidth: 120, visible: true },
  { key: 'section', label: 'Section', defaultWidth: 120, visible: true },
  { key: 'teacher', label: 'Class Teacher', defaultWidth: 220, visible: true },
  { key: 'students', label: 'Students', defaultWidth: 160, visible: true },
  { key: 'attendance', label: 'Attendance', defaultWidth: 170, visible: true },
  { key: 'avgGrade', label: 'Avg Grade', defaultWidth: 130, visible: true },
  { key: 'subjects', label: 'Subjects', defaultWidth: 130, visible: true },
  { key: 'status', label: 'Status', defaultWidth: 150, visible: true },
  { key: 'room', label: 'Room', defaultWidth: 130, visible: false },
  { key: 'academicYear', label: 'Academic Year', defaultWidth: 170, visible: false }
];

const buildDefaultClassColumns = () => classColumnDefinitions.map((column, index) => ({
  ...column,
  width: column.defaultWidth,
  order: index
}));

export default function Classes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7; 
  const [columns, setColumns] = useState(() => {
    const defaults = buildDefaultClassColumns();
    try {
      const saved = JSON.parse(localStorage.getItem(CLASS_VIEW_STORAGE_KEY));
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

  // 🗄️ Database States
  const [classesData, setClassesData] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]); 
  const [availableTeachers, setAvailableTeachers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 📝 Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFormState = {
    grade: '', section: 'A', maxCapacity: '', roomNumber: '', 
    academicYear: '2025 - 2026', notes: '', teacher: '', 
    coTeacher: 'None', startTime: '08:00', endTime: '14:00'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [selectedSubjects, setSelectedSubjects] = useState([]); 
  const [attTracking, setAttTracking] = useState(true);
  const [gradebook, setGradebook] = useState(true);
  const [portalAccess, setPortalAccess] = useState(true);

  // 1. Fetch Classes 
  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/classes");
      const result = await response.json();
      
      if (result.success) {
        const formattedData = result.data.map(cls => {
          let subCount = 0;
          try {
             const parsedSubs = typeof cls.subjects === 'string' ? JSON.parse(cls.subjects) : cls.subjects;
             subCount = Array.isArray(parsedSubs) ? parsedSubs.length : 0;
          } catch(e) { subCount = 0; }

          return {
            id: cls.class_id,
            className: `${cls.grade} - Section ${cls.section}`,
            grade: cls.grade,
            section: cls.section,
            teacher: cls.teacher_name,
            students: cls.max_capacity, 
            attendance: Math.floor(Math.random() * 15) + 85, 
            subjects: subCount,
            avgGrade: ["A", "A-", "B+", "B", "B-"][Math.floor(Math.random() * 5)], 
            status: subCount > 0 ? "ACTIVE" : "SUB ASSIGNED",
            statusClass: subCount > 0 ? "cl-status-active" : "cl-status-sub",
            room: cls.room_number || '-',
            academicYear: cls.academic_year || '2025 - 2026',
            rawData: cls 
          };
        });
        setClassesData(formattedData);
      }
    } catch (err) { console.error("Failed to fetch classes:", err); } 
    finally { setIsLoading(false); }
  };

  const fetchAvailableSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      const result = await response.json();
      if (result.success) {
        const subjectNames = result.data.map(s => s.subject_name).filter(Boolean);
        setAvailableSubjects([...new Set(subjectNames)]);
      }
    } catch (err) { console.error("Failed to fetch available subjects:", err); }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      const result = await response.json();
      if (result.success) {
        const teacherNames = result.data.map(t => `${t.first_name} ${t.last_name}`.trim()).filter(Boolean);
        setAvailableTeachers([...new Set(teacherNames)]);
      }
    } catch (err) { console.error("Failed to fetch available teachers:", err); }
  };

  useEffect(() => {
    fetchClasses();
    fetchAvailableSubjects(); 
    fetchAvailableTeachers(); 
  }, []);

  useEffect(() => {
    const compactColumns = columns.map(({ key, visible, width, order }) => ({ key, visible, width, order }));
    localStorage.setItem(CLASS_VIEW_STORAGE_KEY, JSON.stringify(compactColumns));
  }, [columns]);

  // 👉 NEW: Bulk Delete Logic for Classes
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Selection', text: 'Bhai, pehle delete karne ke liye class select toh karein!', confirmButtonColor: '#2563eb' });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Selected ${selectedRows.length} class(es) will be deleted permanently!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete selected'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/classes/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows })
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Classes removed successfully.', timer: 1500, showConfirmButton: false });
          setSelectedRows([]);
          fetchClasses();
        } else { Swal.fire('Error', data.message, 'error'); }
      } catch (err) { Swal.fire('Error', 'Server connection failed', 'error'); }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData(initialFormState);
    setSelectedSubjects([]); 
    setAttTracking(true);
    setGradebook(true);
    setPortalAccess(true);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    const c = record.rawData;
    setModalMode('edit');
    setSelectedClassId(record.id);
    
    setFormData({
      grade: val(c.grade),
      section: val(c.section),
      maxCapacity: val(c.max_capacity),
      roomNumber: val(c.room_number),
      academicYear: val(c.academic_year) || '2025 - 2026',
      notes: val(c.notes),
      teacher: val(c.teacher_name),
      coTeacher: val(c.co_teacher) || 'None',
      startTime: val(c.start_time) || '08:00',
      endTime: val(c.end_time) || '14:00'
    });

    let dbSubjects = c.subjects || [];
    if (typeof dbSubjects === 'string') {
      try { dbSubjects = JSON.parse(dbSubjects); } catch(e) { dbSubjects = []; }
    }
    setSelectedSubjects(Array.isArray(dbSubjects) ? dbSubjects : []);

    let settings = c.settings || {};
    if (typeof settings === 'string') {
      try { settings = JSON.parse(settings); } catch(e) { settings = {}; }
    }
    setAttTracking(settings.attTracking !== false);
    setGradebook(settings.gradebook !== false);
    setPortalAccess(settings.portalAccess !== false);

    setIsModalOpen(true);
  };

  const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleSubjectToggle = (subject) => { setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]); };
  const showClassFormNotice = () => {
    Swal.fire({
      title: 'Setup required',
      text: 'Please fill all required (*) fields before creating the class.',
      icon: 'warning',
      confirmButtonText: 'Review form',
      customClass: {
        container: 'cl-swal-container',
        popup: 'cl-swal-popup',
        icon: 'cl-swal-icon',
        title: 'cl-swal-title',
        htmlContainer: 'cl-swal-text',
        confirmButton: 'cl-swal-confirm'
      },
      buttonsStyling: false
    }).then(() => {
      setTimeout(() => {
        const modalBody = document.querySelector('.cl-modal-body');
        modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
        const firstField = document.querySelector('.cl-modal [name="grade"]');
        firstField?.focus?.();
      }, 80);
    });
  };

  const handleFinalSubmit = async () => {
    if (!formData.grade || !formData.teacher || !formData.maxCapacity) {
      showClassFormNotice();
      return;
    }

    setIsSubmitting(true);
    const payload = { ...formData, subjects: selectedSubjects, settings: { attTracking, gradebook, portalAccess } };
    const url = modalMode === 'add' ? "/api/classes" : `/api/classes/${selectedClassId}`;
    const method = modalMode === 'add' ? "POST" : "PUT";

    try {
      const response = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.success) { setIsModalOpen(false); fetchClasses(); } 
      else { Swal.fire('Could not save class', data.message || 'Please try again.', 'error'); }
    } catch (err) { Swal.fire('Connection failed', 'Failed to connect to server.', 'error'); } 
    finally { setIsSubmitting(false); }
  };

  const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
  const visibleColumns = orderedColumns.filter((column) => column.visible);

  const getColumnValue = (cls, key) => ({
    className: cls.className,
    grade: cls.grade,
    section: cls.section,
    teacher: cls.teacher || 'Not Assigned',
    students: `${cls.students || 0}/40`,
    attendance: `${cls.attendance}%`,
    avgGrade: cls.avgGrade,
    subjects: cls.subjects,
    status: cls.status,
    room: cls.room,
    academicYear: cls.academicYear
  }[key] ?? '');

  const renderColumnValue = (cls, column) => {
    if (column.key === 'className') {
      return (
        <button className="cl-record-link" type="button" onClick={() => openEditModal(cls)}>
          {cls.className}
        </button>
      );
    }

    if (column.key === 'students') {
      return `${cls.students || 0}/40`;
    }

    if (column.key === 'attendance') {
      return `${cls.attendance}%`;
    }

    if (column.key === 'avgGrade') return <span className="cl-grade-cell">{cls.avgGrade}</span>;
    if (column.key === 'status') {
      const label = cls.statusClass === 'cl-status-active' ? 'Active' : cls.status;
      return <span className={`cl-status-pill ${cls.statusClass}`}><span className="cl-status-check">✓</span>{label}</span>;
    }
    return getColumnValue(cls, column.key) || '-';
  };

  const handleColumnToggle = (key) => {
    setColumns((prev) => prev.map((column) => column.key === key ? { ...column, visible: !column.visible } : column));
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
      document.body.classList.remove('cl-resizing-columns');
    };
    document.body.classList.add('cl-resizing-columns');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const resetColumns = () => setColumns(buildDefaultClassColumns());

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
    setDraftColumns((prev) => prev.map((column) => column.key === key ? { ...column, visible: !column.visible } : column));
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

  // Filters & Pagination Logic
  const filteredRecords = classesData.filter(cls => {
    const search = searchTerm.toLowerCase().trim();
    return !search || visibleColumns.some((column) => String(getColumnValue(cls, column.key)).toLowerCase().includes(search));
  });

  const lastRecordIndex = currentPage * recordsPerPage;
  const firstRecordIndex = lastRecordIndex - recordsPerPage;
  const currentRecords = filteredRecords.slice(firstRecordIndex, lastRecordIndex);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVisibleIds = currentRecords.map(cls => cls.id);
      setSelectedRows(allVisibleIds);
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

  const isAllSelected = currentRecords.length > 0 && currentRecords.every(cls => selectedRows.includes(cls.id));

  // 👉 EXPORT TO EXCEL/CSV LOGIC (WITH SWEET ALERT)
  const handleExport = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one class from the checkboxes to export.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Okay'
      });
      return;
    }

    // Filter only selected classes
    const selectedData = classesData.filter(record => selectedRows.includes(record.id));

    // Create CSV Headers
    const headers = ["Class ID", "Grade", "Section", "Class Teacher", "Students Capacity", "Attendance %", "Avg Grade", "Subjects Count", "Status"];
    
    // Create CSV Rows Data
    const csvRows = selectedData.map(record => {
      return [
        record.id,
        `"${record.grade}"`,
        `"${record.section}"`,
        `"${record.teacher || 'Not Assigned'}"`,
        `"${record.students}"`,
        `"${record.attendance}%"`,
        `"${record.avgGrade}"`,
        `"${record.subjects}"`,
        `"${record.status}"`
      ].join(',');
    });

    // Combine Headers and Rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create a Blob and trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Classes_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout userRole="admin" currentPath="/classes" userName="System Admin" userInitials="SA">
      <div className="cl-page-header">
        <div className="cl-header-left">
          <h2>Classes</h2>
          <p>{classesData.length} active classes across grades</p>
        </div>
        <div className="cl-header-right">
          <button className="cl-btn-primary" onClick={openAddModal}>+ Add class</button>
          <div className="cl-avatar">SA</div>
        </div>
      </div>

      {/* 👉 HEADER UPDATED WITH ONDELETE PROP */}
      <Header
        onExport={handleExport}
        onRefresh={fetchClasses}
        onDelete={handleDelete}
        onEdit={() => {
          const selectedRecord = classesData.find(record => record.id === selectedRows[0]);
          selectedRows.length === 1 && selectedRecord
            ? openEditModal(selectedRecord)
            : Swal.fire('Select one class', 'Choose exactly one class checkbox, then click Edit.', 'info');
        }}
      />

      <AdminListView
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setSelectedRows([]);
        }}
        searchPlaceholder="Search by class name, teacher..."
        searchIcon={<SvgSearch />}
        configureIcon={<SvgColumns />}
        onConfigure={openColumnModal}
        filterButton={(
          <>
            <select className="cl-filter-select"><option>All grades</option></select>
            <select className="cl-filter-select"><option>All sections</option></select>
            <select className="cl-filter-select"><option>All statuses</option></select>
          </>
        )}
        columns={visibleColumns}
        rows={currentRecords}
        getRowId={(cls) => cls.id}
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
        loadingMessage="Loading classes..."
        emptyMessage="No classes found."
        paginationLabel={`Showing ${currentRecords.length > 0 ? firstRecordIndex + 1 : 0} to ${Math.min(lastRecordIndex, filteredRecords.length)} of ${filteredRecords.length} classes`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSelectedRows([]);
        }}
      />

      {localStorage.getItem('edusync.showLegacyList') === 'true' && (
      <div className="cl-table-card">
        
        {/* Filters Row */}
        <div className="cl-filters-row">
          <div className="cl-search-input">
            <SvgSearch />
            <input 
              type="text" 
              placeholder="Search by class name, teacher..." 
              value={searchTerm} 
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedRows([]); // Reset on search
              }} 
            />
          </div>
          <div className="cl-filter-group">
            <button className="cl-configure-btn" type="button" onClick={openColumnModal}>
              <SvgColumns />
              Configure columns
            </button>
            <select className="cl-filter-select"><option>All grades</option></select>
            <select className="cl-filter-select"><option>All sections</option></select>
            <select className="cl-filter-select"><option>All statuses</option></select>
          </div>
        </div>

        {/* Table Container */}
        <div className="cl-table-container">
          <table className="cl-list-table" style={{ minWidth: `${visibleColumns.reduce((total, column) => total + column.width, 220) + 190}px` }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleSelectAll} 
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`cl-configurable-th ${tableDragColumnKey === column.key ? 'is-table-dragging' : ''} ${tableDragTargetKey === column.key && tableDragColumnKey !== column.key ? 'is-table-drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, column.key)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setTableDragTargetKey(column.key);
                    }}
                    onDragLeave={() => setTableDragTargetKey((current) => current === column.key ? null : current)}
                    onDrop={(e) => handleColumnDrop(e, column.key)}
                    onDragEnd={handleColumnDragEnd}
                    style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
                  >
                    <span className="cl-column-label">{column.label}</span>
                    <span className="cl-column-drag-hint">Drag</span>
                    <span className="cl-resize-handle" onMouseDown={(e) => startColumnResize(e, column.key)} />
                  </th>
                ))}
                <th style={{ width: '150px', minWidth: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={visibleColumns.length + 2} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading classes...</td></tr>
              ) : currentRecords.length === 0 ? (
                <tr><td colSpan={visibleColumns.length + 2} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No classes found.</td></tr>
              ) : (
                currentRecords.map((cls) => {
                  return (
                    <tr key={cls.id} className={selectedRows.includes(cls.id) ? 'selected-row' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(cls.id)}
                          onChange={() => handleSelectRow(cls.id)} 
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column.key} style={{ width: `${column.width}px`, minWidth: `${column.width}px`, maxWidth: `${column.width}px` }}>
                          <div className="cl-cell-content">{renderColumnValue(cls, column)}</div>
                        </td>
                      ))}
                      <td>
                        <div className="cl-actions-cell">
                          <button className="cl-btn-view" onClick={() => openEditModal(cls)}>View / Edit</button>
                          <button className="cl-more-btn" type="button" aria-label="More class actions" onClick={() => Swal.fire(`${cls.grade} - Section ${cls.section}`, `Teacher: ${cls.teacher || 'Not Assigned'}\nSubjects: ${cls.subjects}\nCapacity: ${cls.students || 0}`, 'info')}><SvgMore /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="cl-pagination-footer">
          <span className="cl-page-info">
            Showing {currentRecords.length > 0 ? firstRecordIndex + 1 : 0} to {Math.min(lastRecordIndex, filteredRecords.length)} of {filteredRecords.length} classes
          </span>
          <div className="cl-page-buttons">
            <button className="cl-page-btn" onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); setSelectedRows([]); }} disabled={currentPage === 1} style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>&lt;</button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index + 1} className={`cl-page-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => { setCurrentPage(index + 1); setSelectedRows([]); }}>{index + 1}</button>
            ))}
            <button className="cl-page-btn" onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); setSelectedRows([]); }} disabled={currentPage === totalPages || totalPages === 0} style={{ cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}>&gt;</button>
          </div>
        </div>

      </div>
      )}

      <AdminColumnDrawer
        isOpen={isColumnModalOpen}
        title="Fields"
        description="Choose which columns appear in the classes list."
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

      {localStorage.getItem('edusync.showLegacyColumnModal') === 'true' && isColumnModalOpen && (
        <div className="cl-column-overlay">
          <div className="cl-column-modal">
            <div className="cl-column-header">
              <div>
                <h2>Configure Classes View</h2>
                <p>Choose which columns appear in the classes list.</p>
              </div>
              <button className="cl-column-close" type="button" onClick={() => setIsColumnModalOpen(false)}>x</button>
            </div>
            <div className="cl-column-toolbar">
              <span>{visibleColumns.length} visible columns</span>
              <button type="button" onClick={resetColumns}>Reset default view</button>
            </div>
            <div className="cl-column-list">
              {orderedColumns.map((column) => (
                <div className="cl-column-row" key={column.key}>
                  <label className="cl-column-check">
                    <input type="checkbox" checked={column.visible} onChange={() => handleColumnToggle(column.key)} />
                    <span>{column.label}</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="cl-column-footer">
              <p>Search scans only the columns visible in this view.</p>
              <button className="cl-btn-primary" type="button" onClick={() => setIsColumnModalOpen(false)}>Apply view</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL */}
      {/* ======================================= */}
      {isModalOpen && (
        <div className="cl-modal-overlay">
          <div className="cl-modal">
            <div className="cl-modal-header">
              <div className="cl-modal-title-group">
                <div className="cl-modal-icon"><IconSchool /></div>
                <div className="cl-modal-title">
                  <h2>{modalMode === 'add' ? 'Add New Class' : 'Update Class Settings'}</h2>
                  <p>{modalMode === 'add' ? 'Create a new class and assign a teacher and subjects' : `Editing settings for ${formData.grade}`}</p>
                </div>
              </div>
              <div className="cl-header-actions">
                <div className="cl-badge-pill">{modalMode === 'add' ? 'Setup required' : 'Update record'}</div>
                <button className="cl-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close"><ClassLineIcon type="close" /></button>
              </div>
            </div>

            <div className="cl-modal-body">
              <div className="cl-modal-card cl-class-details-card">
                <div className="cl-section-title">Class Details</div>
                <div className="cl-form-row-3">
                  <div className="cl-form-group">
                    <label>Grade <span>*</span></label>
                    <select name="grade" value={formData.grade} onChange={handleInputChange} className="cl-input">
                      <option value="">Select grade</option>
                      {[...Array(10)].map((_, i) => (<option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>))}
                    </select>
                  </div>
                  <div className="cl-form-group">
                    <label>Section <span>*</span></label>
                    <div className="cl-radio-group">
                      {['A', 'B', 'C', 'D'].map(sec => (
                        <label className="cl-radio-label" key={sec}>
                          <input type="radio" name="section" value={sec} checked={formData.section === sec} onChange={handleInputChange} />
                          <span className="cl-radio-circle"></span> {sec}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="cl-form-group">
                    <label>Max capacity <span>*</span></label>
                    <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleInputChange} className="cl-input" placeholder="e.g. 40" />
                  </div>
                </div>

                <div className="cl-form-row-2">
                  <div className="cl-form-group">
                    <label>Class room number</label>
                    <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} className="cl-input" placeholder="📍 e.g. R-12" />
                  </div>
                  <div className="cl-form-group">
                    <label>Academic year <span>*</span></label>
                    <select name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="cl-input">
                      <option value="2025 - 2026">2025 - 2026</option>
                      <option value="2026 - 2027">2026 - 2027</option>
                    </select>
                  </div>
                </div>

                <div className="cl-form-group">
                  <label>Class description / notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="cl-input cl-textarea" placeholder="Any special notes about this class..."></textarea>
                </div>
              </div>

              <div className="cl-modal-card cl-teacher-card">
                <div className="cl-section-title">Teacher Assignment</div>
                <div className="cl-form-row-2">
                  
                  {/* 👉 DYNAMIC CLASS TEACHER */}
                  <div className="cl-form-group">
                    <label>Class / homeroom teacher <span>*</span></label>
                    <select name="teacher" value={formData.teacher} onChange={handleInputChange} className="cl-input">
                      <option value="">Select teacher</option>
                      {availableTeachers.length > 0 ? (
                        availableTeachers.map((tName, i) => (
                          <option key={i} value={tName}>{tName}</option>
                        ))
                      ) : (
                        <option disabled>No teachers found in DB</option>
                      )}
                    </select>
                  </div>

                  {/* 👉 DYNAMIC CO-TEACHER */}
                  <div className="cl-form-group">
                    <label>Co-teacher (optional)</label>
                    <select name="coTeacher" value={formData.coTeacher} onChange={handleInputChange} className="cl-input">
                      <option value="None">None</option>
                      {availableTeachers.map((tName, i) => (
                        <option key={i} value={tName}>{tName}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              <div className="cl-modal-card cl-subject-card">
                <div className="cl-section-title">Subject & Timetable Assignment</div>
                <div className="cl-alert-box" style={{ marginBottom: '16px' }}>
                  <IconInfo />
                  <p>Assign the subjects that will be taught in this class.</p>
                </div>

                <div className="cl-form-group">
                  <label>Subjects for this class <span>*</span></label>
                  <div className="cl-checkbox-group">
                    {availableSubjects.length > 0 ? availableSubjects.map(sub => (
                      <label className="cl-check-pill" key={sub}>
                        <input type="checkbox" checked={selectedSubjects.includes(sub)} onChange={() => handleSubjectToggle(sub)} />
                        <span className="cl-check-square"></span> {sub}
                      </label>
                    )) : (<p style={{fontSize: '12px', color: '#94a3b8', margin: 0}}>No subjects available. Please add subjects first.</p>)}
                  </div>
                </div>

                <div className="cl-form-row-2" style={{ marginTop: '16px' }}>
                  <div className="cl-form-group">
                    <label>School start time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="cl-input" />
                  </div>
                  <div className="cl-form-group">
                    <label>School end time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="cl-input" />
                  </div>
                </div>
              </div>

              <div className="cl-modal-card cl-settings-card">
                <div className="cl-section-title">Class Settings</div>
                <div className="cl-switch-card">
                  <div className="cl-switch-row">
                    <div className="cl-switch-label">
                      <h4>Enable attendance tracking</h4>
                      <p>Mark daily attendance for this class</p>
                    </div>
                    <div className={`cl-toggle ${attTracking ? 'on' : ''}`} onClick={() => setAttTracking(!attTracking)}></div>
                  </div>
                  <div className="cl-switch-row">
                    <div className="cl-switch-label">
                      <h4>Enable gradebook</h4>
                      <p>Track assignment and exam results</p>
                    </div>
                    <div className={`cl-toggle ${gradebook ? 'on' : ''}`} onClick={() => setGradebook(!gradebook)}></div>
                  </div>
                  <div className="cl-switch-row">
                    <div className="cl-switch-label">
                      <h4>Allow student portal access</h4>
                      <p>Students can view timetable and results</p>
                    </div>
                    <div className={`cl-toggle ${portalAccess ? 'on' : ''}`} onClick={() => setPortalAccess(!portalAccess)}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cl-modal-footer">
              <div className="cl-req-text">* Required fields</div>
              <div className="cl-footer-actions">
                <button className="cl-btn-discard" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="cl-btn-publish" onClick={handleFinalSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : modalMode === 'add' ? 'Create class' : 'Update class'} <ClassLineIcon type="check" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
