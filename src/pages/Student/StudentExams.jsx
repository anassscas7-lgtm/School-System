import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName, isStudentClassRecord } from './studentAccess';
import StudentListView from './StudentListView';
import { getStudentHeaderActions, showStudentDetails } from './studentHeaderActions';
import './StudentModule.css';

const ExamIcon = ({ type }) => {
  const paths = {
    document: <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>,
    language: <><path d="M4 5h9M9 5c0 5-2 9-5 12M6 10c1.8 3 4 5.2 7 7" /><path d="M14 13h6M17 10v10" /></>,
    flask: <><path d="M9 2h6M10 2v6l-5 10a3 3 0 0 0 2.7 4h8.6a3 3 0 0 0 2.7-4L14 8V2" /><path d="M8 16h8" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    dots: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="sm-exam-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentExams() {
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const [studentsRes, examsRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/exams`).then((r) => r.json()),
        ]);
        const currentStudent = studentsRes.success ? findCurrentStudent(studentsRes.data, user) : null;
        setStudent(currentStudent);
        const records = examsRes.success ? examsRes.data : [];
        setExams(records.filter((exam) => isStudentClassRecord(exam, currentStudent)));
      } catch (error) {
        console.error('Student exams fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  const filteredExams = exams.filter((exam) => {
    const query = searchTerm.toLowerCase();
    return (
      exam.exam_title?.toLowerCase().includes(query) ||
      exam.subject_name?.toLowerCase().includes(query) ||
      exam.exam_type?.toLowerCase().includes(query) ||
      exam.status?.toLowerCase().includes(query)
    );
  });

  const columns = [
    { key: 'exam', label: 'Exam', defaultWidth: 280, visible: true },
    { key: 'subject', label: 'Subject', defaultWidth: 180, visible: true },
    { key: 'date', label: 'Date', defaultWidth: 210, visible: true },
    { key: 'time', label: 'Time', defaultWidth: 220, visible: true },
    { key: 'marks', label: 'Marks', defaultWidth: 130, visible: true },
    { key: 'status', label: 'Status', defaultWidth: 150, visible: true }
  ];
  const headerActions = getStudentHeaderActions({
    pageName: 'Exams',
    exportFileName: 'student-exams.csv',
    exportColumns: [
      { key: 'exam_title', label: 'Exam' },
      { key: 'subject_name', label: 'Subject' },
      { key: 'dateLabel', label: 'Date' },
      { key: 'timeLabel', label: 'Time' },
      { key: 'total_marks', label: 'Marks' },
      { key: 'statusLabel', label: 'Status' }
    ],
    exportRows: filteredExams.map((exam) => ({
      ...exam,
      dateLabel: exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : '-',
      timeLabel: exam.end_time ? `${exam.start_time || '-'} - ${exam.end_time}` : exam.start_time || '-',
      statusLabel: exam.status === 'Completed' ? 'Completed' : 'Scheduled'
    }))
  });

  const renderCell = (exam, column) => {
    const subject = (exam.subject_name || '').toLowerCase();
    const isComplete = exam.status === 'Completed';
    const iconType = subject.includes('science') ? 'flask' : subject.includes('english') || subject.includes('urdu') ? 'language' : 'document';
    const tone = subject.includes('science') ? 'purple' : subject.includes('english') || subject.includes('urdu') ? 'green' : 'blue';
    const statusLabel = isComplete ? 'Completed' : 'Scheduled';
    const statusTone = isComplete ? 'green' : '';
    switch (column.key) {
      case 'exam':
        return (
          <div className="sm-exam-title-cell">
            <span className={`sm-exam-type-icon ${tone}`}><ExamIcon type={iconType} /></span>
            <span>
              <strong>{exam.exam_title}</strong>
              <small>{isComplete ? 'Completed' : 'Upcoming'}</small>
            </span>
          </div>
        );
      case 'subject':
        return exam.subject_name || '-';
      case 'date':
        return (
          <div className="sm-exam-date-cell">
            <ExamIcon type="calendar" />
            <span>
              <strong>{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</strong>
              <small>{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'long' }) : 'Unscheduled'}</small>
            </span>
          </div>
        );
      case 'time':
        return (
          <div className="sm-exam-date-cell">
            <ExamIcon type="clock" />
            <span>
              <strong>{exam.end_time ? `${exam.start_time || '-'} - ${exam.end_time}` : exam.start_time || '-'}</strong>
              <small>{exam.duration || exam.exam_duration || exam.duration_hours || '-'}</small>
            </span>
          </div>
        );
      case 'marks':
        return exam.total_marks || 100;
      case 'status':
        return <span className={`sm-pill ${statusTone}`}>{statusLabel}</span>;
      default:
        return '-';
    }
  };

  return (
    <DashboardLayout userRole="student" currentPath="/student/exams" userName={studentName} userInitials={initials}>
      <div className="student-exams-page">
        <div className="sm-page-header">
          <div>
            <h2>Exams</h2>
            <p>Exam schedule and assessment details for your grade</p>
          </div>
          <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
        </div>

        <Header {...headerActions} />

        <div className="sm-exams-list-shell">
          <StudentListView
            storageKey="student-exams-columns-v2"
            columnDefinitions={columns}
            rows={filteredExams}
            getRowId={(exam) => exam.exam_id}
            renderCell={renderCell}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search exam or subject..."
            emptyMessage="No exams found."
            itemLabel="exams"
            actionsHeader=""
            actionsWidth={72}
            renderActions={(exam) => (
              <button
                className="sm-exam-action"
                type="button"
                aria-label="Exam options"
                onClick={() => showStudentDetails(exam.exam_title || 'Exam', [
                  { label: 'Subject', value: exam.subject_name || '-' },
                  { label: 'Date', value: exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : '-' },
                  { label: 'Time', value: exam.end_time ? `${exam.start_time || '-'} - ${exam.end_time}` : exam.start_time || '-' },
                  { label: 'Marks', value: exam.total_marks || 100 },
                  { label: 'Status', value: exam.status === 'Completed' ? 'Completed' : 'Scheduled' }
                ])}
              >
                <ExamIcon type="dots" />
              </button>
            )}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
