import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import AdminListView from '../../components/AdminListView';
import AdminColumnDrawer from '../../components/AdminColumnDrawer';
import './students.css';

/* Icons */
const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const SvgFilter = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>;
const SvgColumns = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14M15 5v14"/></svg>;
const SvgMore = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>;
const SvgEye = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
const SvgEyeOff = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 3 18 18"/><path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"/><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1"/><path d="M6.1 6.8C3.5 8.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1"/></svg>;
const SvgGrip = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M9 5.5A1.5 1.5 0 1 1 6 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-13A1.5 1.5 0 1 1 15 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/></svg>;
const IconStudent = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>;
const IconUser = () => <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const IconLine = ({ type }) => {
  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H7a3 3 0 0 0-3 3V5.5Z"/><path d="M4 19a3 3 0 0 1 3-3h13"/><path d="M8 7h8"/></>,
    calendar: <><path d="M8 2v4M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M2 21v-2a4 4 0 0 1 3-3.87"/></>,
    school: <><path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.63a2 2 0 0 1-.45 2.11L8 9.72a16 16 0 0 0 6.28 6.28l1.26-1.26a2 2 0 0 1 2.11-.45c.85.28 1.73.48 2.63.6A2 2 0 0 1 22 16.92Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20"/></>,
    tag: <><path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z"/><path d="M7.5 7.5h.01"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></>,
    note: <><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    check: <path d="m20 6-11 11-5-5"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    close: <path d="M18 6 6 18M6 6l12 12"/>,
    arrowRight: <path d="M5 12h14M13 5l7 7-7 7"/>,
    arrowLeft: <path d="M19 12H5M11 19l-7-7 7-7"/>,
  };
  return <svg className="st-line-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{paths[type] || paths.file}</svg>;
};

// Pakistan Standard Time Formatter
const formatDateToPKT = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const options = { timeZone: 'Asia/Karachi' };
  const year = new Intl.DateTimeFormat('en-US', { ...options, year: 'numeric' }).format(d);
  const month = new Intl.DateTimeFormat('en-US', { ...options, month: '2-digit' }).format(d);
  const day = new Intl.DateTimeFormat('en-US', { ...options, day: '2-digit' }).format(d);
  return `${year}-${month}-${day}`;
};

// Bulletproof check for missing values
const val = (v) => (v !== null && v !== undefined) ? v : '';
const getInitials = (name = '') => name
  .split(' ')
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase() || 'ST';

const STUDENT_VIEW_STORAGE_KEY = 'edusync.admin.students.columnView.v1';

const studentColumnDefinitions = [
  { key: 'name', label: 'Name', group: 'Student', defaultWidth: 230, visible: true },
  { key: 'rollNo', label: 'Roll No', group: 'Student', defaultWidth: 140, visible: true },
  { key: 'grade', label: 'Grade', group: 'Class', defaultWidth: 120, visible: true },
  { key: 'section', label: 'Section', group: 'Class', defaultWidth: 120, visible: true },
  { key: 'guardian', label: 'Guardian', group: 'Guardian', defaultWidth: 180, visible: true },
  { key: 'feeStatus', label: 'Fee Status', group: 'Fee', defaultWidth: 150, visible: true },
  { key: 'status', label: 'Status', group: 'Student', defaultWidth: 130, visible: true },
  { key: 'email', label: 'Student Email', group: 'Student', defaultWidth: 220, visible: false },
  { key: 'phone', label: 'Phone', group: 'Student', defaultWidth: 160, visible: false },
  { key: 'city', label: 'City', group: 'Student', defaultWidth: 140, visible: false },
  { key: 'admissionDate', label: 'Admission Date', group: 'Student', defaultWidth: 160, visible: false },
  { key: 'guardianContact', label: 'Guardian Contact', group: 'Guardian', defaultWidth: 170, visible: false },
  { key: 'guardianEmail', label: 'Guardian Email', group: 'Guardian', defaultWidth: 220, visible: false },
  { key: 'monthlyFee', label: 'Monthly Fee', group: 'Fee', defaultWidth: 150, visible: false },
  { key: 'classDisplay', label: 'Class', group: 'Class', defaultWidth: 150, visible: false }
];

const buildDefaultStudentColumns = () => studentColumnDefinitions.map((column, index) => ({
  ...column,
  width: column.defaultWidth,
  order: index
}));

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [draftColumns, setDraftColumns] = useState([]);
  const [draggedColumnKey, setDraggedColumnKey] = useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState(null);
  const [tableDragColumnKey, setTableDragColumnKey] = useState(null);
  const [tableDragTargetKey, setTableDragTargetKey] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Checkbox Selection State
  const [selectedRows, setSelectedRows] = useState([]);

  const [studentsData, setStudentsData] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;
  const [columns, setColumns] = useState(() => {
    const defaults = buildDefaultStudentColumns();
    try {
      const saved = JSON.parse(localStorage.getItem(STUDENT_VIEW_STORAGE_KEY));
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

  const initialFormState = {
    firstName: '', middleName: '', lastName: '',
    dob: '', gender: '', bloodGroup: '', cnic: '', religion: '',
    email: '', phone: '', address: '', city: '', province: '', postalCode: '',
    grade: '', section: '', rollNo: '', admissionDate: '', prevSchool: '',
    guardianName: '', guardianRelation: '', guardianOccupation: '', guardianContact: '', guardianEmail: '',
    monthlyFee: '', feeDiscount: '', notes: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetching Dynamic Classes from Backend
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const result = await response.json();
      if (result.success) {
        setAvailableClasses(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students");
      const result = await response.json();
      if (result.success) {
        const formattedData = result.data.map(student => ({
          id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          rollNo: student.roll_no,
          grade: student.grade,
          section: student.section,
          guardian: student.guardian_name,
          feeStatus: student.fee_status ? student.fee_status.toUpperCase() : "PENDING",
          feeClass: student.fee_status ? student.fee_status.toLowerCase() : "pending",
          status: student.status ? student.status.toUpperCase() : "ACTIVE",
          statusClass: student.status && student.status.toLowerCase() === 'on leave' ? 'leave' : 'active',
          email: student.email,
          phone: student.phone,
          city: student.city,
          admissionDate: formatDateToPKT(student.enrollment_date),
          guardianContact: student.guardian_contact,
          guardianEmail: student.guardian_email,
          monthlyFee: student.monthly_fee,
          classDisplay: `${student.grade || ''}${student.section ? ` (${student.section})` : ''}`.trim(),
          rawData: student
        }));
        setStudentsData(formattedData);
      }
    } catch (err) { console.error("Failed to fetch students:", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    const compactColumns = columns.map(({ key, visible, width, order }) => ({ key, visible, width, order }));
    localStorage.setItem(STUDENT_VIEW_STORAGE_KEY, JSON.stringify(compactColumns));
  }, [columns]);

  // 👉 NEW: DELETE LOGIC ADDED HERE (Using Bulk Delete API)
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Selection',
        text: 'Bhai, pehle delete karne ke liye student select toh karein!',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedRows.length} student(s) permanently!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete selected'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/students/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows })
        });
        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Student records removed successfully.',
            timer: 1500,
            showConfirmButton: false
          });
          setSelectedRows([]); // Clear selection
          fetchStudents(); // Refresh data
        } else {
          Swal.fire('Error', data.message, 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Could not connect to server.', 'error');
      }
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData(initialFormState);
    setStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    const s = record.rawData;
    setModalMode('edit');
    setSelectedStudentId(record.id);

    setFormData({
      firstName: val(s.first_name),
      middleName: val(s.middle_name),
      lastName: val(s.last_name),
      dob: formatDateToPKT(s.date_of_birth),
      gender: val(s.gender),
      bloodGroup: val(s.blood_group),
      cnic: val(s.cnic),
      religion: val(s.religion),
      email: val(s.email),
      phone: val(s.phone),
      address: val(s.residential_address),
      city: val(s.city),
      province: val(s.province),
      postalCode: val(s.postal_code),
      grade: val(s.grade),
      section: val(s.section),
      rollNo: val(s.roll_no),
      admissionDate: formatDateToPKT(s.enrollment_date),
      prevSchool: val(s.previous_school),
      guardianName: val(s.guardian_name),
      guardianRelation: val(s.guardian_relation),
      guardianOccupation: val(s.guardian_occupation),
      guardianContact: val(s.guardian_contact),
      guardianEmail: val(s.guardian_email),
      monthlyFee: val(s.monthly_fee),
      feeDiscount: val(s.fee_discount),
      notes: val(s.notes)
    });
    setStep(1);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const focusStudentStep = (stepNumber, fieldName) => {
    setTimeout(() => {
      const modalBody = document.querySelector('.st-modal-body-scroll');
      const targetField = fieldName
        ? document.querySelector(`.st-modal-wide [name="${fieldName}"]`)
        : document.querySelector('.st-modal-wide input, .st-modal-wide select, .st-modal-wide textarea');

      modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
      targetField?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      targetField?.focus?.({ preventScroll: true });
    }, 120);
  };

  const showStudentFormNotice = (stepNumber, message, fieldName) => {
    Swal.fire({
      title: 'Required fields missing',
      text: message,
      icon: 'warning',
      confirmButtonText: `Go to Step ${stepNumber}`,
      target: document.querySelector('.st-modal-wide') || document.body,
      customClass: {
        container: 'st-swal-container',
        popup: 'st-swal-popup',
        icon: 'st-swal-icon',
        title: 'st-swal-title',
        htmlContainer: 'st-swal-text',
        confirmButton: 'st-swal-confirm'
      },
      buttonsStyling: false
    }).then(() => {
      setStep(stepNumber);
      focusStudentStep(stepNumber, fieldName);
    });
  };

  const handleFinalSubmit = async () => {
    const firstMissingStep1 = [
      ['firstName', formData.firstName],
      ['lastName', formData.lastName],
      ['dob', formData.dob],
      ['gender', formData.gender],
      ['address', formData.address]
    ].find(([, value]) => !value)?.[0];
    if (firstMissingStep1) {
      showStudentFormNotice(1, "Please fill all required (*) fields in Step 1.", firstMissingStep1); return;
    }
    const firstMissingStep2 = [
      ['grade', formData.grade],
      ['section', formData.section],
      ['admissionDate', formData.admissionDate]
    ].find(([, value]) => !value)?.[0];
    if (firstMissingStep2) {
      showStudentFormNotice(2, "Please fill all required (*) fields in Step 2.", firstMissingStep2); return;
    }
    const firstMissingStep3 = [
      ['guardianName', formData.guardianName],
      ['guardianContact', formData.guardianContact]
    ].find(([, value]) => !value)?.[0];
    if (firstMissingStep3) {
      showStudentFormNotice(3, "Please fill all required (*) fields in Step 3.", firstMissingStep3); return;
    }
    if (!formData.monthlyFee) {
      showStudentFormNotice(4, "Please enter the Monthly Fee in Step 4.", 'monthlyFee'); return;
    }

    setIsSubmitting(true);
    const url = modalMode === 'add' ? "/api/students" : `/api/students/${selectedStudentId}`;
    const method = modalMode === 'add' ? "POST" : "PUT";

    try {
      const response = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (data.success) { setIsModalOpen(false); fetchStudents(); }
      else { Swal.fire('Could not save student', data.message || 'Please try again.', 'error'); }
    } catch (err) { Swal.fire('Connection failed', 'Failed to connect to server.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
  const visibleColumns = orderedColumns.filter((column) => column.visible);

  const getColumnValue = (record, key) => {
    const valueMap = {
      name: record.name,
      rollNo: record.rollNo,
      grade: record.grade,
      section: record.section,
      guardian: record.guardian,
      feeStatus: record.feeStatus,
      status: record.status,
      email: record.email,
      phone: record.phone,
      city: record.city,
      admissionDate: record.admissionDate,
      guardianContact: record.guardianContact,
      guardianEmail: record.guardianEmail,
      monthlyFee: record.monthlyFee ? `PKR ${Number(record.monthlyFee).toLocaleString('en-US')}` : '',
      classDisplay: record.classDisplay
    };
    return valueMap[key] ?? '';
  };

  const renderColumnValue = (record, column) => {
    if (column.key === 'name') {
      return (
        <button className="st-record-link" type="button" onClick={() => openEditModal(record)}>
          {record.name}
        </button>
      );
    }

    if (['grade', 'section', 'classDisplay'].includes(column.key)) {
      return (
        <button
          className="st-record-link"
          type="button"
          onClick={() => Swal.fire('Class details', `Grade: ${record.grade || '-'}\nSection: ${record.section || '-'}`, 'info')}
        >
          {getColumnValue(record, column.key) || '-'}
        </button>
      );
    }

    if (column.key === 'feeStatus') {
      return <span className={`st-pill ${record.feeClass}`}>{record.feeStatus}</span>;
    }

    if (column.key === 'status') {
      return <span className={`st-pill ${record.statusClass}`}>{record.status}</span>;
    }

    return getColumnValue(record, column.key) || '-';
  };

  const handleColumnToggle = (key) => {
    setColumns((prev) => prev.map((column) => (
      column.key === key ? { ...column, visible: !column.visible } : column
    )));
  };

  const handleColumnWidthChange = (key, width) => {
    const numericWidth = Math.max(100, Math.min(Number(width) || 100, 420));
    setColumns((prev) => prev.map((column) => (
      column.key === key ? { ...column, width: numericWidth } : column
    )));
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
    const sourceKey = e.dataTransfer.getData('text/plain');
    moveColumnTo(sourceKey, targetKey);
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

    const handleMouseMove = (moveEvent) => {
      handleColumnWidthChange(key, startWidth + moveEvent.clientX - startX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('st-resizing-columns');
    };

    document.body.classList.add('st-resizing-columns');
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const resetColumns = () => setColumns(buildDefaultStudentColumns());

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

  const filteredRecords = studentsData.filter(record => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    return visibleColumns.some((column) => String(getColumnValue(record, column.key)).toLowerCase().includes(search));
  });

  const lastRecordIndex = currentPage * recordsPerPage;
  const firstRecordIndex = lastRecordIndex - recordsPerPage;
  const currentRecords = filteredRecords.slice(firstRecordIndex, lastRecordIndex);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVisibleIds = currentRecords.map(record => record.id);
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

  const isAllSelected = currentRecords.length > 0 && currentRecords.every(record => selectedRows.includes(record.id));

  // EXPORT TO EXCEL/CSV LOGIC (WITH SWEET ALERT)
  const handleExport = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one student from the checkboxes to export.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Okay'
      });
      return;
    }

    const selectedData = studentsData.filter(record => selectedRows.includes(record.id));
    const headers = ["Student ID", "Full Name", "Roll No", "Grade", "Section", "Guardian Name", "Fee Status", "Current Status"];
    const csvRows = selectedData.map(record => {
      return [
        record.id,
        `"${record.name}"`,
        `"${record.rollNo}"`,
        `"${record.grade}"`,
        `"${record.section}"`,
        `"${record.guardian}"`,
        `"${record.feeStatus}"`,
        `"${record.status}"`
      ].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueGrades = [...new Set(availableClasses.map(c => c.grade).filter(Boolean))];
  const dynamicSections = formData.grade
    ? [...new Set(availableClasses.filter(c => c.grade === formData.grade).map(c => c.section).filter(Boolean))]
    : ['A', 'B', 'C', 'D'];

  return (
    <DashboardLayout userRole="admin" currentPath="/students" userName="System Admin" userInitials="SA">
      <div className="st-page-header">
        <div className="st-header-left">
          <h2>Students Directory</h2>
          <p>Manage all student records, fee status, and details</p>
        </div>
        <div className="st-header-right">
          <button className="st-btn-primary" onClick={openAddModal}>+ Add student</button>
          <div className="st-avatar">SA</div>
        </div>
      </div>

      {/* 👉 UPDATED HEADER: Now with onDelete logic */}
      <Header
        onExport={handleExport}
        onRefresh={fetchStudents}
        onDelete={handleDelete}
        onEdit={() => {
          const selectedRecord = studentsData.find(record => record.id === selectedRows[0]);
          selectedRows.length === 1 && selectedRecord
            ? openEditModal(selectedRecord)
            : Swal.fire('Select one student', 'Choose exactly one student checkbox, then click Edit.', 'info');
        }}
      />

      <AdminListView
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, roll no..."
        searchIcon={<SvgSearch />}
        configureIcon={<SvgColumns />}
        onConfigure={openColumnModal}
        filterButton={<button className="admin-list-filter-btn" type="button" aria-label="Filter students" onClick={() => Swal.fire('Filter students', 'Search now scans only the columns visible in this view.', 'info')}><SvgFilter /></button>}
        columns={visibleColumns}
        rows={currentRecords}
        getRowId={(record) => record.id}
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
        paginationLabel={`Showing ${currentRecords.length > 0 ? firstRecordIndex + 1 : 0} to ${Math.min(lastRecordIndex, filteredRecords.length)} of ${filteredRecords.length} students`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSelectedRows([]);
        }}
      />

      <AdminColumnDrawer
        isOpen={isColumnModalOpen}
        title="Fields"
        description="Choose which columns appear in the student list."
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

      {false && isColumnModalOpen && (
        <div className="st-column-overlay">
          <div className="st-column-modal">
            <div className="st-column-header">
              <div>
                <h2>Configure Student View</h2>
                <p>Choose which columns appear in the student list.</p>
              </div>
              <button className="st-column-close" type="button" onClick={() => setIsColumnModalOpen(false)}>×</button>
            </div>

            <div className="st-column-toolbar">
              <span>{visibleColumns.length} visible columns</span>
              <button type="button" onClick={resetColumns}>Reset default view</button>
            </div>

            <div className="st-column-list">
              {orderedColumns.map((column) => (
                <div className="st-column-row" key={column.key}>
                  <div className="st-column-main">
                    <label className="st-column-check">
                      <input type="checkbox" checked={column.visible} onChange={() => handleColumnToggle(column.key)} />
                      <span>{column.label}</span>
                    </label>
                    <span className="st-column-group">{column.group}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="st-column-footer">
              <p>Drag table headers to reorder columns. Drag a header edge to resize it.</p>
              <button className="st-btn-primary" type="button" onClick={() => setIsColumnModalOpen(false)}>Apply view</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="st-modal-overlay">
          <div className="st-modal-wide">

            <div className="st-enroll-header">
              <div className="st-modal-title-group">
                <div className="st-modal-icon st-enroll-icon"><IconStudent /></div>
                <div className="st-modal-title">
                  <h2>{modalMode === 'add' ? 'Add New Student' : 'Update Student Profile'}</h2>
                  <p>{modalMode === 'add' ? 'Register a new student into the school system' : `Editing records for ${formData.firstName}`}</p>
                </div>
              </div>
              <div className="st-enroll-header-actions">
                <button className="st-enroll-new-btn" type="button">{modalMode === 'add' ? 'New enrollment' : 'Update record'}</button>
                <button className="st-enroll-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close"><IconLine type="close" /></button>
              </div>
            </div>

            <div className="st-stepper st-stepper-modern">
              <div className={`st-step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`} onClick={() => setStep(1)}><span className="st-step-circle">{step > 1 ? <IconLine type="check" /> : '1'}</span> Personal info</div>
              <div className="st-step-line"></div>
              <div className={`st-step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`} onClick={() => setStep(2)}><span className="st-step-circle">{step > 2 ? <IconLine type="check" /> : '2'}</span> Academic details</div>
              <div className="st-step-line"></div>
              <div className={`st-step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`} onClick={() => setStep(3)}><span className="st-step-circle">{step > 3 ? <IconLine type="check" /> : '3'}</span> Guardian info</div>
              <div className="st-step-line"></div>
              <div className={`st-step ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`} onClick={() => setStep(4)}><span className="st-step-circle">4</span> Fee & documents</div>
            </div>

            <div className="st-stepper st-stepper-legacy">
              <div className={`st-step ${step >= 1 ? 'active current' : ''}`} onClick={() => setStep(1)} style={{cursor: 'pointer'}}><span className="st-step-circle">{step > 1 ? '✓' : '1'}</span> Personal info</div>
              <div className="st-step-line"></div>
              <div className={`st-step ${step >= 2 ? 'active current' : ''}`} onClick={() => setStep(2)} style={{cursor: 'pointer'}}><span className="st-step-circle">{step > 2 ? '✓' : '2'}</span> Academic details</div>
              <div className="st-step-line"></div>
              <div className={`st-step ${step >= 3 ? 'active current' : ''}`} onClick={() => setStep(3)} style={{cursor: 'pointer'}}><span className="st-step-circle">{step > 3 ? '✓' : '3'}</span> Guardian info</div>
              <div className="st-step-line"></div>
              <div className={`st-step ${step >= 4 ? 'active current' : ''}`} onClick={() => setStep(4)} style={{cursor: 'pointer'}}><span className="st-step-circle">4</span> Fee & documents</div>
            </div>

            <div className="st-modal-body-scroll">
              {step === 1 && (
                <div className="st-form-card">
                  <div className="st-section-heading-row">
                    <div className="st-section-heading">
                      <div className="st-section-icon"><IconUser /></div>
                      <div><h3>Personal Information</h3><p>Basic details about the student</p></div>
                    </div>
                    <div className="st-photo-actions">
                      <button className="st-upload-btn-new" type="button" onClick={() => Swal.fire('Upload photo', 'Photo upload storage is not connected yet.', 'info')}><IconLine type="upload" />Upload photo</button>
                      <p>JPG or PNG, max 2 MB</p>
                    </div>
                  </div>
                  <div className="st-row-3">
                    <div><label className="st-label-new">First name <span>*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="st-input-new" placeholder="e.g. Ayesha" /></div>
                    <div><label className="st-label-new">Middle name</label><input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="st-input-new" placeholder="Optional" /></div>
                    <div><label className="st-label-new">Last name <span>*</span></label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="st-input-new" placeholder="e.g. Khan" /></div>
                  </div>
                  <div className="st-row-3">
                    <div><label className="st-label-new">Date of birth <span>*</span></label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="st-input-new" /></div>
                    <div><label className="st-label-new">Gender <span>*</span></label><select name="gender" value={formData.gender} onChange={handleInputChange} className="st-input-new"><option value="">Select</option><option value="Female">Female</option><option value="Male">Male</option></select></div>
                    <div><label className="st-label-new">Blood group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="st-input-new"><option value="">Select</option><option value="O+">O+</option><option value="A+">A+</option><option value="B+">B+</option></select></div>
                  </div>
                  <div className="st-row-3">
                    <div><label className="st-label-new">CNIC / B-Form number</label><input type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} className="st-input-new" placeholder="XXXXX-XXXXXXX-X" /></div>
                    <div><label className="st-label-new">Religion</label><select name="religion" value={formData.religion} onChange={handleInputChange} className="st-input-new"><option value="">Select</option><option value="Islam">Islam</option><option value="Christianity">Christianity</option><option value="Other">Other</option></select></div>
                  </div>
                  <div className="st-section-divider"></div>
                  <div className="st-section-heading st-section-heading-compact">
                    <div className="st-section-icon"><IconLine type="phone" /></div>
                    <div><h3>Contact & Address</h3><p>Student contact and address details</p></div>
                  </div>
                  <div className="st-row-2">
                    <div><label className="st-label-new">Student email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="st-input-new" placeholder="student@school.edu" /></div>
                    <div><label className="st-label-new">Phone number</label><div className="st-phone-field"><span>+92</span><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="3XX XXXXXXX" /></div></div>
                  </div>
                  <div className="st-row-1">
                    <div><label className="st-label-new">Home address <span>*</span></label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="st-input-new" placeholder="Street, area, city" /></div>
                  </div>
                  <div className="st-row-3">
                    <div><label className="st-label-new">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} className="st-input-new" placeholder="e.g. Karachi" /></div>
                    <div><label className="st-label-new">Province</label><select name="province" value={formData.province} onChange={handleInputChange} className="st-input-new"><option value="">Select</option><option value="Sindh">Sindh</option><option value="Punjab">Punjab</option></select></div>
                    <div><label className="st-label-new">Postal code</label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="st-input-new" placeholder="75500" /></div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="st-form-card">
                  <div className="st-section-heading">
                    <div className="st-section-icon"><IconLine type="book" /></div>
                    <div><h3>Academic Details</h3><p>Enter the student's academic information</p></div>
                  </div>
                  <div className="st-row-3">
                    <div>
                      <label className="st-label-new">Grade <span>*</span></label>
                      <div className="st-icon-field"><span><IconLine type="book" /></span><select name="grade" value={formData.grade} onChange={handleInputChange} className="st-input-new">
                        <option value="">Select grade</option>
                        {uniqueGrades.length > 0
                          ? uniqueGrades.map((g, i) => <option key={i} value={g}>{g}</option>)
                          : [...Array(10)].map((_, i) => <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>)
                        }
                      </select></div>
                    </div>
                    <div>
                      <label className="st-label-new">Section <span>*</span></label>
                      <div className="st-icon-field"><span><IconLine type="users" /></span><select name="section" value={formData.section} onChange={handleInputChange} className="st-input-new">
                        <option value="">Select section</option>
                        {dynamicSections.map((sec, i) => <option key={i} value={sec}>{sec}</option>)}
                      </select></div>
                    </div>
                    <div><label className="st-label-new">Roll number</label><div className="st-icon-field is-disabled"><span><IconLine type="file" /></span><input type="text" className="st-input-new" placeholder="Auto-generated" disabled /></div></div>
                  </div>
                  <div className="st-row-3">
                    <div><label className="st-label-new">Admission date <span>*</span></label><div className="st-icon-field"><span><IconLine type="calendar" /></span><input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} className="st-input-new" /></div></div>
                    <div className="st-span-2"><label className="st-label-new">Previous school (if any)</label><div className="st-icon-field"><span><IconLine type="school" /></span><input type="text" name="prevSchool" value={formData.prevSchool} onChange={handleInputChange} className="st-input-new" placeholder="Name of previous school" /></div></div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="st-form-card">
                  <div className="st-section-heading">
                    <div className="st-section-icon"><IconUser /></div>
                    <div><h3>Guardian Information</h3><p>Enter guardian details</p></div>
                  </div>
                  <div className="st-row-3">
                    <div><label className="st-label-new">Guardian name <span>*</span></label><div className="st-icon-field"><span><IconUser /></span><input type="text" name="guardianName" value={formData.guardianName} onChange={handleInputChange} className="st-input-new" placeholder="Full name" /></div></div>
                    <div><label className="st-label-new">Relationship <span>*</span></label><div className="st-icon-field"><span><IconLine type="users" /></span><select name="guardianRelation" value={formData.guardianRelation} onChange={handleInputChange} className="st-input-new"><option value="">Select relationship</option><option value="Father">Father</option><option value="Mother">Mother</option></select></div></div>
                    <div><label className="st-label-new">Occupation</label><div className="st-icon-field"><span><IconLine type="briefcase" /></span><input type="text" name="guardianOccupation" value={formData.guardianOccupation} onChange={handleInputChange} className="st-input-new" placeholder="e.g. Engineer" /></div></div>
                  </div>
                  <div className="st-row-2">
                    <div><label className="st-label-new">Guardian contact <span>*</span></label><div className="st-icon-field"><span><IconLine type="phone" /></span><input type="text" name="guardianContact" value={formData.guardianContact} onChange={handleInputChange} className="st-input-new" placeholder="+92 3XX XXXXXXX" /></div></div>
                    <div><label className="st-label-new">Guardian email</label><div className="st-icon-field"><span><IconLine type="mail" /></span><input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleInputChange} className="st-input-new" placeholder="guardian@email.com" /></div></div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="st-form-card">
                  <div className="st-section-heading">
                    <div className="st-section-icon"><IconLine type="file" /></div>
                    <div><h3>Fee & Documents</h3><p>Provide fee information and upload required documents</p></div>
                  </div>
                  <div className="st-row-2">
                    <div><label className="st-label-new">Monthly fee (PKR) <span>*</span></label><div className="st-icon-field"><span className="st-currency-prefix">Rs.</span><input type="number" name="monthlyFee" value={formData.monthlyFee} onChange={handleInputChange} className="st-input-new" placeholder="e.g. 4500" /></div></div>
                    <div><label className="st-label-new">Fee waiver / discount</label><div className="st-icon-field"><span><IconLine type="tag" /></span><select name="feeDiscount" value={formData.feeDiscount} onChange={handleInputChange} className="st-input-new"><option value="">No discount</option><option value="10%">10% Sibling discount</option></select></div></div>
                  </div>
                  <div className="st-alert-box">
                    <span><IconLine type="check" /></span>
                    <p>Upload at least the birth certificate and guardian CNIC to complete enrollment.</p>
                  </div>
                  <div className="st-row-2">
                    <div>
                      <label className="st-label-new">Documents to upload</label>
                      <div className="st-upload-area">
                        <div className="st-upload-cloud"><IconLine type="upload" /></div>
                        <p><b>Click to upload</b> documents</p>
                        <small>Birth cert, CNIC, transfer cert - PDF, JPG</small>
                        <button type="button" className="st-choose-file-btn"><IconLine type="upload" />Choose files</button>
                      </div>
                    </div>
                    <div>
                      <label className="st-label-new">Additional notes</label>
                      <div className="st-icon-field st-textarea-field"><span><IconLine type="note" /></span><textarea name="notes" value={formData.notes} onChange={handleInputChange} className="st-input-new" placeholder="Any special requirements, medical conditions..."></textarea></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="st-modal-footer st-modal-footer-modern">
              <div className="st-req-text"><span>*</span> Required fields <em></em> Step {step} of 4</div>
              <div className="st-footer-actions">
                <button className="st-btn-discard" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                {step > 1 && <button className="st-btn-draft" type="button" onClick={prevStep}><IconLine type="arrowLeft" />Back</button>}
                {step < 4 ? (
                  <button className="st-btn-publish" type="button" onClick={nextStep}>Save & continue <IconLine type="arrowRight" /></button>
                ) : (
                  <button className="st-btn-publish" type="button" onClick={handleFinalSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : modalMode === 'add' ? "Submit Registration" : "Update Records"} <IconLine type="check" />
                  </button>
                )}
              </div>
            </div>

            <div className="st-modal-footer st-modal-footer-legacy">
              <div className="st-req-text"><span>*</span> Required fields <em></em> Step {step} of 4</div>
              <div className="st-footer-actions">
                <button className="st-btn-discard" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                {step > 1 && <button className="st-btn-draft" style={{ background:'white', border:'1px solid #cbd5e1', padding:'10px 20px', borderRadius:'8px', fontWeight:600, color:'#475569', cursor:'pointer', marginLeft:'10px' }} onClick={prevStep}>← Back</button>}
                {step < 4 ? (
                  <button className="st-btn-publish" style={{ background:'#2563eb', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:600, color:'white', cursor:'pointer', marginLeft:'10px' }} onClick={nextStep}>Save & continue →</button>
                ) : (
                  <button className="st-btn-publish" style={{ background:'#2563eb', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:600, color:'white', cursor:'pointer', marginLeft:'10px' }} onClick={handleFinalSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : modalMode === 'add' ? "Submit Registration ✓" : "Update Records ✓"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
