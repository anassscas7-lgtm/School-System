import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import TeacherListView from './TeacherListView';
import './TeacherModule.css';
import { API_BASE, filterAssignedClasses, findCurrentTeacher, getInitials, getStoredUser, getTeacherName } from './teacherModuleData';
import { getTeacherHeaderActions } from './teacherHeaderActions';

const SubjectPageIcon = ({ type }) => {
  const paths = {
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /><path d="M8 7h8M8 11h6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>,
    plus: <path d="M12 5v14M5 12h14" />
  };

  return (
    <svg className="tm-sub-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const EmptySubjectsIllustration = () => (
  <svg className="tm-sub-empty-art" viewBox="0 0 280 180" fill="none" aria-hidden="true">
    <circle cx="146" cy="91" r="72" fill="#eff6ff" />
    <path d="M83 97h90c7 0 13 6 13 13v41H70v-41c0-7 6-13 13-13Z" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="4" />
    <path d="M117 46h63l28 27v78H117V46Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="4" />
    <path d="M180 47v27h27" stroke="#93c5fd" strokeWidth="4" />
    <path d="M134 82h48M134 104h59M134 126h42" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" />
    <circle cx="207" cy="120" r="30" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="5" />
    <path d="m228 141 24 24" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
    <path d="M57 127c13 0 24 10 24 24M237 77l5 9 9 5-9 5-5 9-5-9-9-5 9-5 5-9M68 72h.01M79 86h.01" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const subjectColumns = [
  { key: 'subject', label: 'Subject', defaultWidth: 260, visible: true },
  { key: 'code', label: 'Code', defaultWidth: 160, visible: true },
  { key: 'grade', label: 'Grade', defaultWidth: 150, visible: true },
  { key: 'category', label: 'Category', defaultWidth: 160, visible: true },
  { key: 'weeklyPeriods', label: 'Weekly periods', defaultWidth: 170, visible: true },
  { key: 'lab', label: 'Lab', defaultWidth: 120, visible: true },
  { key: 'teacher', label: 'Teacher', defaultWidth: 210, visible: false }
];

export default function TeacherSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherInitials, setTeacherInitials] = useState('TR');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const user = getStoredUser();
        const [subjectsRes, classesRes, teachersRes] = await Promise.all([
          fetch(`${API_BASE}/subjects`).then((r) => r.json()),
          fetch(`${API_BASE}/classes`).then((r) => r.json()),
          fetch(`${API_BASE}/teachers`).then((r) => r.json()),
        ]);
        const name = getTeacherName(findCurrentTeacher(teachersRes.success ? teachersRes.data : [], user));
        setTeacherName(name);
        setTeacherInitials(getInitials(name));
        setSubjects(subjectsRes.success ? subjectsRes.data : []);
        setClasses(classesRes.success ? classesRes.data : []);
      } catch (error) {
        console.error('Teacher subjects fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const assignedClasses = useMemo(() => filterAssignedClasses(classes, teacherName), [classes, teacherName]);
  const assignedGrades = useMemo(() => new Set(assignedClasses.map((item) => item.grade).filter(Boolean)), [assignedClasses]);

  const scopedSubjects = subjects.filter((subject) => {
    const assignedTeacher = subject.teacher_name?.toLowerCase() === teacherName.toLowerCase();
    const assignedGrade = assignedGrades.size === 0 || assignedGrades.has(subject.grade_level);
    return assignedTeacher || assignedGrade;
  });

  const filteredSubjects = scopedSubjects.filter((subject) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = subject.subject_name?.toLowerCase().includes(query) ||
      subject.grade_level?.toLowerCase().includes(query) ||
      subject.subject_category?.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'All' || (subject.subject_category || 'Core') === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const headerActions = getTeacherHeaderActions({
    pageName: 'Subjects',
    exportFileName: 'teacher-subjects.csv',
    exportColumns: [
      { key: 'name', label: 'Subject' },
      { key: 'code', label: 'Code' },
      { key: 'grade', label: 'Grade' },
      { key: 'category', label: 'Category' },
      { key: 'weeklyPeriods', label: 'Weekly periods' },
      { key: 'lab', label: 'Lab' },
      { key: 'teacher', label: 'Teacher' }
    ],
    exportRows: filteredSubjects.map((subject) => ({
      name: subject.subject_name || '-',
      code: subject.subject_code || '-',
      grade: subject.grade_level || '-',
      category: subject.subject_category || 'Core',
      weeklyPeriods: subject.weekly_periods || '-',
      lab: subject.has_lab ? 'Yes' : 'No',
      teacher: subject.teacher_name || 'No teacher assigned'
    }))
  });

  const renderSubjectCell = (subject, column) => {
    const category = subject.subject_category || 'Core';
    const values = {
      code: subject.subject_code || '-',
      grade: subject.grade_level || '-',
      category: <span className={`tm-sub-pill ${String(category).toLowerCase()}`}>{category}</span>,
      weeklyPeriods: subject.weekly_periods || '-',
      lab: <span className={`tm-sub-pill ${subject.has_lab ? 'lab' : 'no-lab'}`}>{subject.has_lab ? 'Yes' : 'No'}</span>,
      teacher: subject.teacher_name || 'No teacher assigned'
    };

    if (column.key === 'subject') {
      return (
        <div className="tm-cls-name-cell">
          <span className={`tm-sub-row-icon color-${subject.subject_id % 4}`}><SubjectPageIcon type="book" /></span>
          <div>
            <strong>{subject.subject_name}</strong>
            <span className="tm-muted">{subject.teacher_name || 'No teacher assigned'}</span>
          </div>
        </div>
      );
    }

    return values[column.key] || '-';
  };

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/subjects" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-sub-page">
        <div className="tm-sub-header">
          <div className="tm-sub-title-group">
            <span className="tm-sub-title-icon"><SubjectPageIcon type="book" /></span>
            <div>
              <h1>Subjects</h1>
              <p>Curriculum subjects available across assigned classes</p>
            </div>
          </div>
          <div className="tm-profile-chip tm-sub-profile">{teacherInitials}</div>
        </div>
        <Header {...headerActions} />

        <TeacherListView
          storageKey="edusync.teacher.subjects.columnView.v1"
          columnDefinitions={subjectColumns}
          rows={filteredSubjects}
          getRowId={(subject) => subject.subject_id}
          renderCell={renderSubjectCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search subjects..."
          emptyMessage="No subjects found."
          itemLabel="subjects"
          filterButton={(
          <label className="tm-sub-filter">
            <SubjectPageIcon type="filter" />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option>All</option>
              <option>Core</option>
              <option>Elective</option>
            </select>
          </label>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
