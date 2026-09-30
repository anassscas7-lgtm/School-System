import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import TeacherListView from './TeacherListView';
import './TeacherModule.css';
import { API_BASE, filterAssignedClasses, filterByClassKeys, findCurrentTeacher, getClassKey, getInitials, getStoredUser, getTeacherName } from './teacherModuleData';
import { getTeacherHeaderActions, showTeacherPopup } from './teacherHeaderActions';

const ExamPageIcon = ({ type }) => {
  const paths = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
    pen: <><path d="m18 2 4 4L9 19l-6 2 2-6L18 2Z" /><path d="m15 5 4 4" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    note: <><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></>,
    more: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>,
    prev: <path d="m15 18-6-6 6-6" />,
    next: <path d="m9 18 6-6-6-6" />
  };

  return (
    <svg className="tm-exm-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const formatExamDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const examColumns = [
  { key: 'exam', label: 'Exam', defaultWidth: 260, visible: true },
  { key: 'subject', label: 'Subject', defaultWidth: 170, visible: true },
  { key: 'class', label: 'Class', defaultWidth: 190, visible: true },
  { key: 'date', label: 'Date', defaultWidth: 190, visible: true },
  { key: 'marks', label: 'Marks', defaultWidth: 140, visible: true },
  { key: 'status', label: 'Status', defaultWidth: 150, visible: true },
  { key: 'time', label: 'Time', defaultWidth: 130, visible: false },
  { key: 'type', label: 'Type', defaultWidth: 140, visible: false }
];

const initialScheduleForm = {
  examTitle: '',
  subjectId: '',
  classId: '',
  examType: 'Mid-Term',
  description: '',
  examDate: '',
  startTime: '',
  duration: '2 hours',
  negativeMarking: 'No',
  totalMarks: '',
  passingMarks: '',
  autoPublish: true
};

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherInitials, setTeacherInitials] = useState('TR');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(initialScheduleForm);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const user = getStoredUser();
      const [examsRes, classesRes, teachersRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE}/exams`).then((r) => r.json()),
        fetch(`${API_BASE}/classes`).then((r) => r.json()),
        fetch(`${API_BASE}/teachers`).then((r) => r.json()),
        fetch(`${API_BASE}/subjects`).then((r) => r.json()),
      ]);
      const name = getTeacherName(findCurrentTeacher(teachersRes.success ? teachersRes.data : [], user));
      setTeacherName(name);
      setTeacherInitials(getInitials(name));
      setExams(examsRes.success ? examsRes.data : []);
      setClasses(classesRes.success ? classesRes.data : []);
      setSubjects(subjectsRes.success ? subjectsRes.data : []);
    } catch (error) {
      console.error('Teacher exams fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const assignedClasses = useMemo(() => filterAssignedClasses(classes, teacherName), [classes, teacherName]);
  const assignedClassKeys = useMemo(() => new Set(assignedClasses.map(getClassKey)), [assignedClasses]);
  const scopedExams = filterByClassKeys(exams, assignedClassKeys);
  const classFilterOptions = useMemo(
    () => [...new Set([...assignedClasses.map(getClassKey), ...scopedExams.map(getClassKey)].filter(Boolean))].sort(),
    [assignedClasses, scopedExams]
  );
  const subjectOptions = useMemo(() => {
    const assignedGrades = new Set(assignedClasses.map((item) => item.grade).filter(Boolean));
    return subjects.filter((subject) => assignedGrades.size === 0 || assignedGrades.has(subject.grade_level));
  }, [assignedClasses, subjects]);

  const selectedClass = assignedClasses.find((item) => String(item.class_id) === String(scheduleForm.classId));

  const filteredExams = scopedExams.filter((exam) => {
    const query = searchTerm.toLowerCase();
    const classKey = getClassKey(exam);
    const matchesSearch = exam.exam_title?.toLowerCase().includes(query) ||
      exam.subject_name?.toLowerCase().includes(query) ||
      exam.grade?.toLowerCase().includes(query);
    const matchesClass = classFilter === 'all' || classKey === classFilter;
    return matchesSearch && matchesClass;
  });

  const renderExamCell = (exam, column) => {
    const rowTone = Number(exam.exam_id || 0) % 4;
    const values = {
      subject: exam.subject_name || '-',
      class: `${exam.grade || '-'} ${exam.section ? `- Section ${exam.section}` : ''}`,
      date: (
        <div className="tm-exm-date-cell">
          <span><ExamPageIcon type="calendar" /></span>
          <div>
            <strong>{formatExamDate(exam.exam_date)}</strong>
            <p>{exam.exam_time || '10:00 AM'}</p>
          </div>
        </div>
      ),
      marks: <><strong>{Number(exam.total_marks || 100).toFixed(2)}</strong><span className="tm-exm-muted">Total Marks</span></>,
      status: <span className="tm-exm-status">{exam.status || 'Scheduled'}</span>,
      time: exam.exam_time || '10:00 AM',
      type: exam.exam_type || 'Exam'
    };

    if (column.key === 'exam') {
      return (
        <div className="tm-exm-name-cell">
          <span className={`tm-exm-avatar color-${rowTone}`}><ExamPageIcon type="file" /></span>
          <div>
            <strong>{exam.exam_title}</strong>
            <span className={`tm-exm-type color-${rowTone}`}>{exam.exam_type || 'Exam'}</span>
          </div>
        </div>
      );
    }

    return values[column.key] || '-';
  };

  const updateScheduleForm = (field, value) => {
    setScheduleForm((current) => ({ ...current, [field]: value }));
  };

  const resetScheduleForm = () => {
    setScheduleForm(initialScheduleForm);
    setIsScheduleOpen(false);
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleForm.examTitle || !scheduleForm.subjectId || !scheduleForm.classId || !scheduleForm.examDate || !scheduleForm.duration || !scheduleForm.totalMarks || !scheduleForm.passingMarks) {
      showTeacherPopup({
        icon: 'info',
        title: 'Review details',
        text: 'Please complete exam title, type, subject, class, date, duration, and marks.'
      });
      return;
    }

    setIsSubmittingSchedule(true);
    try {
      const response = await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examTitle: scheduleForm.examTitle,
          examType: scheduleForm.examType,
          subjectId: scheduleForm.subjectId,
          classId: scheduleForm.classId,
          examDate: scheduleForm.examDate,
          startTime: scheduleForm.startTime,
          duration: scheduleForm.duration,
          roomNumber: selectedClass?.room_number || '',
          invigilatorId: null,
          totalMarks: scheduleForm.totalMarks,
          passingMarks: scheduleForm.passingMarks || 0,
          weightagePercent: 0,
          gradingScale: 'A-F grades',
          notifyPortal: true,
          sendSms: false,
          autoPublish: scheduleForm.autoPublish
        })
      });
      const data = await response.json();
      if (data.success) {
        showTeacherPopup({
          title: 'Scheduled',
          text: 'Exam scheduled successfully.',
          icon: 'success'
        });
        setScheduleForm(initialScheduleForm);
        setIsScheduleOpen(false);
        fetchExams();
      } else {
        showTeacherPopup({
          title: 'Error',
          text: data.message || 'Could not schedule exam.',
          icon: 'error'
        });
      }
    } catch (error) {
      showTeacherPopup({
        title: 'Error',
        text: 'Server connection failed.',
        icon: 'error'
      });
    } finally {
      setIsSubmittingSchedule(false);
    }
  };
  const headerActions = getTeacherHeaderActions({
    pageName: 'Exams',
    exportFileName: 'teacher-exams.csv',
    onRefresh: fetchExams,
    exportColumns: [
      { key: 'title', label: 'Exam' },
      { key: 'subject', label: 'Subject' },
      { key: 'className', label: 'Class' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'marks', label: 'Marks' },
      { key: 'status', label: 'Status' }
    ],
    exportRows: filteredExams.map((exam) => ({
      title: exam.exam_title || '-',
      subject: exam.subject_name || '-',
      className: `${exam.grade || '-'} ${exam.section ? `- Section ${exam.section}` : ''}`,
      date: formatExamDate(exam.exam_date),
      time: exam.exam_time || '10:00 AM',
      marks: Number(exam.total_marks || 100).toFixed(2),
      status: exam.status || 'Scheduled'
    }))
  });

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/exams" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-exm-page">
        <div className="tm-exm-header">
          <div className="tm-exm-title-group">
            <span className="tm-exm-title-icon"><ExamPageIcon type="file" /></span>
            <div>
              <h1>Exams</h1>
              <p>Upcoming and scheduled assessments for your classes</p>
            </div>
          </div>
          <button className="tm-exm-schedule-btn" type="button" onClick={() => setIsScheduleOpen(true)}><ExamPageIcon type="plus" /> Schedule exam</button>
        </div>
        <Header {...headerActions} />

        <TeacherListView
          storageKey="edusync.teacher.exams.columnView.v1"
          columnDefinitions={examColumns}
          rows={filteredExams}
          getRowId={(exam) => exam.exam_id}
          renderCell={renderExamCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by exam, subject, or class..."
          emptyMessage="No exams found."
          itemLabel="exams"
          filterButton={(
          <label className="tm-exm-filter">
            <ExamPageIcon type="filter" />
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              <option value="all">All classes</option>
              {classFilterOptions.map((item) => <option key={item} value={item}>{item.replace('-', ' - Section ')}</option>)}
            </select>
          </label>
          )}
        />

        {isScheduleOpen && (
          <div className="tm-exm-modal-overlay">
            <div className="tm-exm-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-exam-title">
              <div className="tm-exm-modal-header">
                <span className="tm-exm-modal-title-icon"><ExamPageIcon type="calendar" /></span>
                <div>
                  <h2 id="schedule-exam-title">Schedule New Exam</h2>
                  <p>Assign subject, class, and date for the exam</p>
                </div>
                <button className="tm-exm-modal-close" type="button" onClick={resetScheduleForm} aria-label="Close schedule exam form">x</button>
              </div>

              <div className="tm-exm-modal-body">
                <section className="tm-exm-modal-section">
                  <div className="tm-exm-modal-section-title">
                    <span><ExamPageIcon type="file" /></span>
                    <div>
                      <h3>Exam Details</h3>
                      <p>Provide basic information about the exam</p>
                    </div>
                  </div>

                  <div className="tm-exm-modal-grid">
                    <label className="tm-exm-modal-field">
                      <span>Exam title <b>*</b></span>
                      <input value={scheduleForm.examTitle} onChange={(event) => updateScheduleForm('examTitle', event.target.value)} placeholder="Mid-term 2026" />
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Exam type <b>*</b></span>
                      <select value={scheduleForm.examType} onChange={(event) => updateScheduleForm('examType', event.target.value)}>
                        <option>Mid-Term</option>
                        <option>Final-Term</option>
                        <option>Quiz</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Subject <b>*</b></span>
                      <select value={scheduleForm.subjectId} onChange={(event) => updateScheduleForm('subjectId', event.target.value)}>
                        <option value="">Select Subject</option>
                        {subjectOptions.map((subject) => <option key={subject.subject_id} value={subject.subject_id}>{subject.subject_name}</option>)}
                      </select>
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Class & Section <b>*</b></span>
                      <select value={scheduleForm.classId} onChange={(event) => updateScheduleForm('classId', event.target.value)}>
                        <option value="">Select Class</option>
                        {assignedClasses.map((item) => <option key={item.class_id} value={item.class_id}>{item.grade} - Section {item.section}</option>)}
                      </select>
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Exam date <b>*</b></span>
                      <input type="date" value={scheduleForm.examDate} onChange={(event) => updateScheduleForm('examDate', event.target.value)} />
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Start time</span>
                      <input type="time" value={scheduleForm.startTime} onChange={(event) => updateScheduleForm('startTime', event.target.value)} />
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Duration <b>*</b></span>
                      <select value={scheduleForm.duration} onChange={(event) => updateScheduleForm('duration', event.target.value)}>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>1.5 hours</option>
                        <option>2 hours</option>
                        <option>3 hours</option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className="tm-exm-modal-section">
                  <div className="tm-exm-modal-section-title">
                    <span><ExamPageIcon type="pen" /></span>
                    <div>
                      <h3>Configuration</h3>
                      <p>Set marks, passing criteria and other preferences</p>
                    </div>
                  </div>

                  <div className="tm-exm-modal-grid">
                    <label className="tm-exm-modal-field">
                      <span>Total marks <b>*</b></span>
                      <input type="number" min="1" value={scheduleForm.totalMarks} onChange={(event) => updateScheduleForm('totalMarks', event.target.value)} placeholder="e.g. 100" />
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Passing marks <b>*</b></span>
                      <input type="number" min="0" value={scheduleForm.passingMarks} onChange={(event) => updateScheduleForm('passingMarks', event.target.value)} placeholder="e.g. 40" />
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Negative marking</span>
                      <select value={scheduleForm.negativeMarking} onChange={(event) => updateScheduleForm('negativeMarking', event.target.value)}>
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </label>
                    <label className="tm-exm-modal-field">
                      <span>Instructions <em>(optional)</em></span>
                      <textarea maxLength="300" value={scheduleForm.description} onChange={(event) => updateScheduleForm('description', event.target.value)} placeholder="Add exam instructions for students..." />
                      <small>{scheduleForm.description.length}/300</small>
                    </label>
                  </div>

                  <label className="tm-exm-modal-switch">
                    <input type="checkbox" checked={scheduleForm.autoPublish} onChange={(event) => updateScheduleForm('autoPublish', event.target.checked)} />
                    <span />
                    <div>
                      <strong>Publish exam to students</strong>
                      <p>Students will be able to see this exam in their portal.</p>
                    </div>
                  </label>
                </section>
              </div>

              <div className="tm-exm-modal-footer">
                <span><b>*</b> Required fields</span>
                <div>
                  <button className="tm-exm-modal-cancel" type="button" onClick={resetScheduleForm}>Cancel</button>
                  <button className="tm-exm-modal-submit" type="button" onClick={handleScheduleSubmit} disabled={isSubmittingSchedule}>
                    <ExamPageIcon type="calendar" />
                    {isSubmittingSchedule ? 'Scheduling...' : 'Schedule Exam'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
