import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import AdminListView from '../../components/AdminListView';
import './exam.css';

/* SVG Icons */
const IconCalendar = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>;
const IconSettings = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47,0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>;
const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const SvgExamTile = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 4h8"/><path d="M9 2h6v4H9z"/><path d="M6 4h-.5A2.5 2.5 0 0 0 3 6.5v12A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5v-12A2.5 2.5 0 0 0 18.5 4H18"/><path d="M8 12h8M8 16h5"/></svg>;
const SvgDate = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>;
const SvgMore = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"/></svg>;
const ExamLineIcon = ({ type }) => {
  const paths = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    check: <path d="m5 12 4 4L19 6" />,
    bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M13.73 21a2 2 0 0 1-3.46 0" />,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
  };

  return (
    <svg className="ex-line-icon" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function Exams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Dynamic Data States
  const [examsList, setExamsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [classesList, setClassesList] = useState([]);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedExamId, setSelectedExamId] = useState(null);

  // 👉 NEW: Pagination State Added
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

  // Form Initial State
  const initialFormState = {
    examTitle: '',
    examType: '',
    subjectId: '',
    classId: '',
    examDate: '',
    startTime: '',
    duration: '2 hours',
    roomNumber: '',
    invigilatorId: '',
    totalMarks: 100,
    passingMarks: 50,
    weightagePercent: 30,
    gradingScale: 'A-F grades',
    notifyPortal: true,
    sendSms: true,
    autoPublish: false
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      const [examsRes, teachersRes, subjectsRes, classesRes] = await Promise.all([
        fetch('/api/exams').then(r => r.json()),
        fetch('/api/teachers').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json()),
        fetch('/api/classes').then(r => r.json())
      ]);

      if (examsRes.success) setExamsList(examsRes.data);
      if (teachersRes.success) setTeachersList(teachersRes.data);
      if (subjectsRes.success) setSubjectsList(subjectsRes.data);
      if (classesRes.success) setClassesList(classesRes.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = async () => {
    setSelectedRows([]);
    setCurrentPage(1);
    await fetchAllData();
    Swal.fire({
      icon: 'success',
      title: 'Exams refreshed',
      showConfirmButton: false,
      timer: 900
    });
  };

  // 👉 NEW: Bulk Delete Logic for Exams
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Selection', text: 'Bhai, pehle delete karne ke liye exam select toh karein!', confirmButtonColor: '#2563eb' });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Selected ${selectedRows.length} exam(s) will be deleted permanently!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete selected'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/exams/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows })
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Exams removed successfully.', timer: 1500, showConfirmButton: false });
          setSelectedRows([]);
          fetchAllData();
        } else { Swal.fire('Error', data.message, 'error'); }
      } catch (err) { Swal.fire('Error', 'Server connection failed', 'error'); }
    }
  };

  // Filter Logic
  const filteredExams = examsList.filter(exam =>
    exam.exam_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 👉 NEW: Pagination Calculation Logic Added
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredExams.length / recordsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRows([]);
  };

  // Export Logic
  const handleExport = () => {
    if (selectedRows.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select exams from the table to export.', confirmButtonColor: '#2563eb' });
      return;
    }

    const selectedData = examsList.filter(exam => selectedRows.includes(exam.exam_id));
    const headers = ["ID", "Exam Title", "Type", "Subject", "Class", "Date", "Invigilator", "Status"];

    const csvRows = selectedData.map(exam => {
      const classInfo = `${exam.grade} ${exam.section ? `(${exam.section})` : ''}`;
      const examDate = exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : '-';
      return [
        exam.exam_id,
        `"${exam.exam_title}"`,
        `"${exam.exam_type}"`,
        `"${exam.subject_name || '-'}"`,
        `"${classInfo}"`,
        `"${examDate}"`,
        `"${exam.invigilator_first_name || 'N/A'}"`,
        `"${exam.status || 'Scheduled'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Exams_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (toggleName) => {
    setFormData((prev) => ({ ...prev, [toggleName]: !prev[toggleName] }));
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedExamId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const formatDateToInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const openEditModal = (exam) => {
    setModalMode('edit');
    setSelectedExamId(exam.exam_id);
    setFormData({
      examTitle: exam.exam_title || '',
      examType: exam.exam_type || '',
      subjectId: exam.subject_id ? String(exam.subject_id) : '',
      classId: exam.class_id ? String(exam.class_id) : '',
      examDate: formatDateToInput(exam.exam_date),
      startTime: exam.start_time ? String(exam.start_time).slice(0, 5) : '',
      duration: exam.duration || '2 hours',
      roomNumber: exam.room_number || '',
      invigilatorId: exam.invigilator_id ? String(exam.invigilator_id) : '',
      totalMarks: exam.total_marks || 100,
      passingMarks: exam.passing_marks || 50,
      weightagePercent: exam.weightage_percent || 30,
      gradingScale: exam.grading_scale || 'A-F grades',
      notifyPortal: exam.notify_portal !== false,
      sendSms: exam.send_sms !== false,
      autoPublish: exam.auto_publish === true
    });
    setIsModalOpen(true);
  };

  const focusExamForm = () => {
    setTimeout(() => {
      const modalBody = document.querySelector('.ex-modal-body');
      const firstField = document.querySelector('.ex-modal [name="examTitle"]');
      modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
      firstField?.focus?.({ preventScroll: true });
    }, 120);
  };

  const showExamFormNotice = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Required details missing',
      text: 'Please complete the exam title, subject, class, and date before scheduling.',
      confirmButtonText: 'Review form',
      buttonsStyling: false,
      customClass: {
        container: 'ex-swal-container',
        popup: 'ex-swal-popup',
        title: 'ex-swal-title',
        htmlContainer: 'ex-swal-text',
        confirmButton: 'ex-swal-confirm'
      }
    }).then(focusExamForm);
  };

  // Schedule Exam
  const handleScheduleExam = async () => {
    if (!formData.examTitle || !formData.subjectId || !formData.classId || !formData.examDate) {
      showExamFormNotice();
      return;
    }

    setIsLoading(true);
    const payload = {
      ...formData,
      subjectId: parseInt(formData.subjectId, 10),
      classId: parseInt(formData.classId, 10),
      invigilatorId: formData.invigilatorId ? parseInt(formData.invigilatorId, 10) : null,
      totalMarks: parseInt(formData.totalMarks, 10) || 100,
      passingMarks: parseInt(formData.passingMarks, 10) || 50,
      weightagePercent: parseInt(formData.weightagePercent, 10) || 0
    };

    try {
      const url = modalMode === 'edit'
        ? `/api/exams/${selectedExamId}`
        : '/api/exams';
      const response = await fetch(url, {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        Swal.fire('Success', modalMode === 'edit' ? 'Exam updated!' : 'Exam scheduled!', 'success');
        setFormData(initialFormState);
        setSelectedExamId(null);
        setModalMode('add');
        setIsModalOpen(false);
        setSelectedRows([]);
        fetchAllData();
      } else {
        throw new Error(data.message || 'Database error occurred');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Scheduling Failed', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Checkbox Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentExams.map(exam => exam.exam_id);
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

  const isAllSelected = currentExams.length > 0 && currentExams.every(exam => selectedRows.includes(exam.exam_id));

  const examColumns = [
    { key: 'icon', label: '', width: 70 },
    { key: 'id', label: 'ID', width: 90 },
    { key: 'title', label: 'Exam Title', width: 220 },
    { key: 'type', label: 'Type', width: 150 },
    { key: 'subject', label: 'Subject', width: 160 },
    { key: 'class', label: 'Class', width: 140 },
    { key: 'date', label: 'Date', width: 210 },
    { key: 'invigilator', label: 'Invigilator', width: 150 },
    { key: 'status', label: 'Status', width: 130 }
  ];

  const renderExamCell = (exam, column) => {
    if (column.key === 'icon') return <span className={`ex-row-icon color-${exam.exam_id % 4}`}><SvgExamTile /></span>;
    if (column.key === 'id') return exam.exam_id;
    if (column.key === 'title') return <span className="ex-title-cell">{exam.exam_title}</span>;
    if (column.key === 'type') return <span className={`ex-type-pill color-${exam.exam_id % 4}`}>{exam.exam_type}</span>;
    if (column.key === 'subject') return exam.subject_name || '-';
    if (column.key === 'class') return `${exam.grade || '-'} ${exam.section ? `(${exam.section})` : ''}`;
    if (column.key === 'date') {
      return (
        <span className="ex-date-cell">
          <SvgDate />
          {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
        </span>
      );
    }
    if (column.key === 'invigilator') return exam.invigilator_first_name || 'N/A';
    if (column.key === 'status') return <span className="ex-pill pass">{exam.status || 'Scheduled'}</span>;
    return '-';
  };

  return (
    <DashboardLayout userRole="admin" currentPath="/exams" userName="System Admin" userInitials="SA">
      <div className="ex-page-header">
        <div className="ex-header-left">
          <h2>Exams Dashboard</h2>
          <p>View and manage school examinations</p>
        </div>
        <div className="ex-header-right">
          <button className="ex-btn-primary" onClick={openAddModal}>
            + Schedule exam
          </button>
          <div className="ex-avatar">SA</div>
        </div>
      </div>

      {/* 👉 HEADER UPDATED WITH ONDELETE PROP */}
      <Header
        onExport={handleExport}
        onRefresh={handleRefresh}
        onDelete={handleDelete}
        onEdit={() => {
          const exam = examsList.find((item) => item.exam_id === selectedRows[0]);
          selectedRows.length === 1 && exam
            ? openEditModal(exam)
            : Swal.fire('Select one exam', 'Choose exactly one exam checkbox, then click Edit.', 'info');
        }}
      />

      <AdminListView
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
          setSelectedRows([]);
        }}
        searchPlaceholder="Search by title or subject..."
        searchIcon={<SvgSearch />}
        showConfigure={false}
        columns={examColumns}
        rows={currentExams}
        getRowId={(exam) => exam.exam_id}
        renderCell={renderExamCell}
        selectedRows={selectedRows}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        renderActions={(exam) => (
          <button className="ex-more-btn" type="button" aria-label="More exam actions" onClick={() => Swal.fire(exam.exam_title, `Type: ${exam.exam_type || '-'}\nSubject: ${exam.subject_name || '-'}\nStatus: ${exam.status || 'Scheduled'}`, 'info')}>
            <SvgMore />
          </button>
        )}
        actionsHeader=""
        actionsWidth={70}
        emptyMessage="No examinations found in the database."
        paginationLabel={`Showing ${filteredExams.length > 0 ? indexOfFirstRecord + 1 : 0} to ${Math.min(indexOfLastRecord, filteredExams.length)} of ${filteredExams.length} records`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={paginate}
      />

      {false && <div className="ex-table-card">
        <div className="ex-search-area">
          <div className="ex-search-box">
            <SvgSearch />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
                setSelectedRows([]);
              }}
            />
          </div>
        </div>

        <div className="ex-table-scroll">
          <table className="ex-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                </th>
                <th></th>
                <th>ID <span className="ex-sort">↕</span></th>
                <th>Exam Title <span className="ex-sort">↕</span></th>
                <th>Type <span className="ex-sort">↕</span></th>
                <th>Subject <span className="ex-sort">↕</span></th>
                <th>Class <span className="ex-sort">↕</span></th>
                <th>Date <span className="ex-sort">↕</span></th>
                <th>Invigilator <span className="ex-sort">↕</span></th>
                <th>Status <span className="ex-sort">↕</span></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentExams.length > 0 ? (
                currentExams.map((exam) => (
                  <tr key={exam.exam_id} className={selectedRows.includes(exam.exam_id) ? 'selected-row' : ''}>
                    <td>
                      <input type="checkbox" checked={selectedRows.includes(exam.exam_id)} onChange={() => handleSelectRow(exam.exam_id)} />
                    </td>
                    <td>
                      <span className={`ex-row-icon color-${exam.exam_id % 4}`}><SvgExamTile /></span>
                    </td>
                    <td>{exam.exam_id}</td>
                    <td className="ex-title-cell">{exam.exam_title}</td>
                    <td><span className={`ex-type-pill color-${exam.exam_id % 4}`}>{exam.exam_type}</span></td>
                    <td>{exam.subject_name || '-'}</td>
                    <td>{exam.grade} {exam.section ? `(${exam.section})` : ''}</td>
                    <td>
                      <span className="ex-date-cell"><SvgDate />{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</span>
                    </td>
                    <td>{exam.invigilator_first_name || 'N/A'}</td>
                    <td><span className="ex-pill pass">{exam.status || 'Scheduled'}</span></td>
                    <td><button className="ex-more-btn" type="button" aria-label="More exam actions" onClick={() => Swal.fire(exam.exam_title, `Type: ${exam.exam_type || '-'}\nSubject: ${exam.subject_name || '-'}\nStatus: ${exam.status || 'Scheduled'}`, 'info')}><SvgMore /></button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No examinations found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 👉 NEW: Pagination Footer Row Added */}
        <div className="att-pagination-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredExams.length)} of {filteredExams.length} records
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="att-page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index + 1} onClick={() => paginate(index + 1)} className={`att-page-btn ${currentPage === index + 1 ? 'active' : ''}`}>{index + 1}</button>
            ))}
            <button className="att-page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
          </div>
        </div>
      </div>}

      {isModalOpen && (
        <div className="ex-modal-overlay">
          <div className="ex-modal">
            <div className="ex-modal-header">
              <div className="ex-modal-title-group">
                <div className="ex-modal-icon"><IconCalendar /></div>
                <div className="ex-modal-title">
                  <h2>{modalMode === 'edit' ? 'Update Exam' : 'Schedule New Exam'}</h2>
                  <p>Assign subject, class, and date for the exam</p>
                </div>
              </div>
              <button className="ex-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close exam form">
                <ExamLineIcon type="close" />
              </button>
            </div>

            <div className="ex-modal-body">
              <div className="ex-section-title">📘 EXAM DETAILS</div>
              <div className="ex-modal-card ex-details-card">
              <div className="ex-section-title"><SvgExamTile /> EXAM DETAILS</div>
              <div className="ex-form-row-2">
                <div className="ex-form-group">
                  <label>Exam title <span>*</span></label>
                  <input name="examTitle" value={formData.examTitle} onChange={handleInputChange} className="ex-input" placeholder="Mid-term 2026" />
                </div>
                <div className="ex-form-group">
                  <label>Exam type <span>*</span></label>
                  <select name="examType" value={formData.examType} onChange={handleInputChange} className="ex-input">
                    <option value="">Select type</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="Final-Term">Final-Term</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>
              </div>
              <div className="ex-form-row-2">
                <div className="ex-form-group">
                  <label>Subject <span>*</span></label>
                  <select name="subjectId" value={formData.subjectId} onChange={handleInputChange} className="ex-input">
                    <option value="">Select Subject</option>
                    {subjectsList.map(subj => (
                      <option key={subj.subject_id} value={subj.subject_id}>{subj.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div className="ex-form-group">
                  <label>Class & Section <span>*</span></label>
                  <select name="classId" value={formData.classId} onChange={handleInputChange} className="ex-input">
                    <option value="">Select Class</option>
                    {classesList.map(cls => (
                      <option key={cls.class_id} value={cls.class_id}>{cls.grade} - {cls.section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ex-form-row-3">
                <div className="ex-form-group">
                  <label>Exam date <span>*</span></label>
                  <input type="date" name="examDate" value={formData.examDate} onChange={handleInputChange} className="ex-input" />
                </div>
                <div className="ex-form-group">
                  <label>Start time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="ex-input" />
                </div>
                <div className="ex-form-group">
                  <label>Duration</label>
                  <select name="duration" value={formData.duration} onChange={handleInputChange} className="ex-input">
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                </div>
              </div>
              </div>
              <div className="ex-modal-card ex-config-card">
              <div className="ex-section-title"><IconSettings /> CONFIGURATION</div>
              <div className="ex-form-row-4">
                <div className="ex-form-group">
                  <label>Total marks</label>
                  <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} className="ex-input" />
                </div>
                <div className="ex-form-group">
                  <label>Passing marks</label>
                  <input type="number" name="passingMarks" value={formData.passingMarks} onChange={handleInputChange} className="ex-input" />
                </div>
                <div className="ex-form-group">
                    <label>Weightage %</label>
                    <input type="number" name="weightagePercent" value={formData.weightagePercent} onChange={handleInputChange} className="ex-input" />
                </div>
                <div className="ex-form-group">
                  <label>Grading</label>
                  <select name="gradingScale" value={formData.gradingScale} onChange={handleInputChange} className="ex-input">
                    <option value="A-F grades">A-F grades</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
              </div>
              <div className="ex-switch-list">
                <div className="ex-switch-row">
                  <div className="ex-switch-copy"><ExamLineIcon type="bell" /><div className="ex-switch-label"><h4>Notify students</h4><p>Send notifications to students about this exam</p></div></div>
                  <div className={`ex-toggle ${formData.notifyPortal ? 'on' : ''}`} onClick={() => handleToggle('notifyPortal')}></div>
                </div>
                <div className="ex-switch-row">
                  <div className="ex-switch-copy"><ExamLineIcon type="message" /><div className="ex-switch-label"><h4>Send SMS</h4><p>Send SMS alerts to students</p></div></div>
                  <div className={`ex-toggle ${formData.sendSms ? 'on' : ''}`} onClick={() => handleToggle('sendSms')}></div>
                </div>
              </div>
              </div>
            </div>
            <div className="ex-modal-footer">
              <div className="ex-req-text"><span>*</span> Required fields</div>
              <div className="ex-footer-actions">
                <button className="ex-btn-discard" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="ex-btn-publish" onClick={handleScheduleExam} disabled={isLoading}>
                  <IconCalendar /> {isLoading ? 'Wait...' : (modalMode === 'edit' ? 'Update Exam' : 'Schedule Exam')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
