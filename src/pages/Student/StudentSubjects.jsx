import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName } from './studentAccess';
import StudentListView from './StudentListView';
import { getStudentHeaderActions, showStudentDetails } from './studentHeaderActions';
import './StudentModule.css';

const SubjectIcon = ({ type }) => {
  const paths = {
    math: <><path d="M4 18h4l4-12 4 12h4" /><path d="M7 12h10" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" /></>,
    dots: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="sm-subject-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentSubjects() {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const [studentsRes, subjectsRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/subjects`).then((r) => r.json()),
        ]);
        const currentStudent = studentsRes.success ? findCurrentStudent(studentsRes.data, user) : null;
        setStudent(currentStudent);
        const records = subjectsRes.success ? subjectsRes.data : [];
        setSubjects(records.filter((subject) => currentStudent && subject.grade_level === currentStudent.grade));
      } catch (error) {
        console.error('Student subjects fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  const filteredSubjects = subjects.filter((subject) => {
    const query = searchTerm.toLowerCase();
    return (
      subject.subject_name?.toLowerCase().includes(query) ||
      subject.subject_code?.toLowerCase().includes(query) ||
      subject.subject_category?.toLowerCase().includes(query) ||
      subject.teacher_name?.toLowerCase().includes(query)
    );
  });

  const columns = [
    { key: 'subject', label: 'Subject', defaultWidth: 280, visible: true },
    { key: 'code', label: 'Code', defaultWidth: 150, visible: true },
    { key: 'category', label: 'Category', defaultWidth: 150, visible: true },
    { key: 'teacher', label: 'Teacher', defaultWidth: 180, visible: true },
    { key: 'weeklyPeriods', label: 'Weekly periods', defaultWidth: 170, visible: true },
    { key: 'lab', label: 'Lab', defaultWidth: 120, visible: true }
  ];
  const headerActions = getStudentHeaderActions({
    pageName: 'Subjects',
    exportFileName: 'student-subjects.csv',
    exportColumns: [
      { key: 'subject_name', label: 'Subject' },
      { key: 'subject_code', label: 'Code' },
      { key: 'subject_category', label: 'Category' },
      { key: 'teacher_name', label: 'Teacher' },
      { key: 'weekly_periods', label: 'Weekly periods' },
      { key: 'labLabel', label: 'Lab' }
    ],
    exportRows: filteredSubjects.map((subject) => ({ ...subject, labLabel: subject.has_lab ? 'Yes' : 'No' }))
  });

  const renderCell = (subject, column) => {
    const isMath = subject.subject_name?.toLowerCase().includes('math');
    switch (column.key) {
      case 'subject':
        return (
          <div className="sm-subject-title-cell">
            <span className={`sm-subject-type-icon ${isMath ? 'purple' : 'green'}`}>
              <SubjectIcon type={isMath ? 'math' : 'book'} />
            </span>
            <span>
              <strong>{subject.subject_name}</strong>
              <small>{subject.grade_level || student?.grade || '-'}</small>
            </span>
          </div>
        );
      case 'code':
        return subject.subject_code || '-';
      case 'category':
        return <span className="sm-pill">{subject.subject_category || 'Core'}</span>;
      case 'teacher':
        return subject.teacher_name || '-';
      case 'weeklyPeriods':
        return subject.weekly_periods || '-';
      case 'lab':
        return <span className={`sm-pill ${subject.has_lab ? 'green' : 'red'}`}>{subject.has_lab ? 'Yes' : 'No'}</span>;
      default:
        return '-';
    }
  };

  return (
    <DashboardLayout userRole="student" currentPath="/student/subjects" userName={studentName} userInitials={initials}>
      <div className="student-subjects-page">
        <div className="sm-page-header">
          <div>
            <h2>Subjects</h2>
            <p>Subjects and curriculum assigned to your grade</p>
          </div>
          <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
        </div>

        <Header {...headerActions} />

        <StudentListView
          storageKey="student-subjects-columns-v2"
          columnDefinitions={columns}
          rows={filteredSubjects}
          getRowId={(subject) => subject.subject_id}
          renderCell={renderCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search subjects..."
          emptyMessage="No subjects found."
          itemLabel="subjects"
          actionsHeader=""
          actionsWidth={72}
          renderActions={(subject) => (
            <button
              className="sm-subject-action"
              type="button"
              aria-label="Subject options"
              onClick={() => showStudentDetails(subject.subject_name || 'Subject', [
                { label: 'Code', value: subject.subject_code || '-' },
                { label: 'Category', value: subject.subject_category || 'Core' },
                { label: 'Teacher', value: subject.teacher_name || '-' },
                { label: 'Weekly periods', value: subject.weekly_periods || '-' },
                { label: 'Lab', value: subject.has_lab ? 'Yes' : 'No' }
              ])}
            >
              <SubjectIcon type="dots" />
            </button>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
