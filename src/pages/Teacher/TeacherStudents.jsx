import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import TeacherListView from './TeacherListView';
import './TeacherModule.css';
import { API_BASE, filterAssignedClasses, filterByClassKeys, findCurrentTeacher, getClassKey, getInitials, getStoredUser, getTeacherName } from './teacherModuleData';
import { getTeacherHeaderActions } from './teacherHeaderActions';

const StudentPageIcon = ({ type }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    more: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="tm-stu-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const getStudentInitials = (student) => {
  const first = student.first_name?.[0] || '';
  const last = student.last_name?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'ST';
};

const studentColumns = [
  { key: 'student', label: 'Student', defaultWidth: 260, visible: true },
  { key: 'rollNo', label: 'Roll no', defaultWidth: 140, visible: true },
  { key: 'class', label: 'Class', defaultWidth: 190, visible: true },
  { key: 'guardian', label: 'Guardian', defaultWidth: 180, visible: true },
  { key: 'feeStatus', label: 'Fee status', defaultWidth: 150, visible: true },
  { key: 'status', label: 'Status', defaultWidth: 140, visible: true },
  { key: 'email', label: 'Student Email', defaultWidth: 220, visible: false },
  { key: 'phone', label: 'Phone', defaultWidth: 170, visible: false }
];

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherInitials, setTeacherInitials] = useState('TR');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = getStoredUser();
        const [studentsRes, classesRes, teachersRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/classes`).then((r) => r.json()),
          fetch(`${API_BASE}/teachers`).then((r) => r.json()),
        ]);
        const teachers = teachersRes.success ? teachersRes.data : [];
        const name = getTeacherName(findCurrentTeacher(teachers, user));

        setTeacherName(name);
        setTeacherInitials(getInitials(name));
        setStudents(studentsRes.success ? studentsRes.data : []);
        setClasses(classesRes.success ? classesRes.data : []);
      } catch (error) {
        console.error('Teacher students fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const assignedClasses = useMemo(() => filterAssignedClasses(classes, teacherName), [classes, teacherName]);
  const assignedClassKeys = useMemo(() => new Set(assignedClasses.map(getClassKey)), [assignedClasses]);
  const assignedStudents = useMemo(() => filterByClassKeys(students, assignedClassKeys), [students, assignedClassKeys]);

  const classOptions = useMemo(() => {
    const fromClasses = assignedClasses.map(getClassKey);
    const fromStudents = assignedStudents.map(getClassKey);
    return [...new Set([...fromClasses, ...fromStudents].filter((item) => item && !item.startsWith('undefined')))].sort();
  }, [assignedClasses, assignedStudents]);

  const filteredStudents = assignedStudents.filter((student) => {
    const query = searchTerm.toLowerCase();
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    const classKey = `${student.grade}-${student.section}`;
    const matchesSearch = fullName.includes(query) || student.roll_no?.toLowerCase().includes(query);
    const matchesClass = classFilter === 'all' || classKey === classFilter;
    return matchesSearch && matchesClass;
  });

  const renderStudentCell = (student, column) => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
    const values = {
      rollNo: <span className="tm-stu-roll">{student.roll_no || '-'}</span>,
      class: `${student.grade || '-'} - Section ${student.section || '-'}`,
      guardian: student.guardian_name || '-',
      feeStatus: <span className={`tm-stu-pill ${student.fee_status === 'Paid' ? 'paid' : 'pending'}`}>{student.fee_status || 'Pending'}</span>,
      status: <span className={`tm-stu-pill ${String(student.status || 'Active').toLowerCase() === 'active' ? 'active' : 'inactive'}`}>{student.status || 'Active'}</span>,
      email: student.email || '-',
      phone: student.phone || '-'
    };

    if (column.key === 'student') {
      return (
        <div className="tm-stu-name-cell">
          <span className={`tm-stu-avatar color-${student.student_id % 4}`}>{getStudentInitials(student)}</span>
          <div>
            <strong>{fullName}</strong>
            <span>{student.email || 'No email'}</span>
          </div>
        </div>
      );
    }

    return values[column.key] || '-';
  };
  const headerActions = getTeacherHeaderActions({
    pageName: 'Students',
    exportFileName: 'teacher-students.csv',
    exportColumns: [
      { key: 'name', label: 'Student' },
      { key: 'rollNo', label: 'Roll no' },
      { key: 'className', label: 'Class' },
      { key: 'guardian', label: 'Guardian' },
      { key: 'feeStatus', label: 'Fee status' },
      { key: 'status', label: 'Status' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' }
    ],
    exportRows: filteredStudents.map((student) => ({
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
      rollNo: student.roll_no || '-',
      className: `${student.grade || '-'} - Section ${student.section || '-'}`,
      guardian: student.guardian_name || '-',
      feeStatus: student.fee_status || 'Pending',
      status: student.status || 'Active',
      email: student.email || '-',
      phone: student.phone || '-'
    }))
  });

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/students" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-stu-page">
        <div className="tm-stu-header">
          <div>
            <h1>My students</h1>
            <p>Roster view for class monitoring and quick lookup</p>
          </div>
          <div className="tm-profile-chip tm-stu-profile">{teacherInitials}</div>
        </div>
        <Header {...headerActions} />

        <TeacherListView
          storageKey="edusync.teacher.students.columnView.v1"
          columnDefinitions={studentColumns}
          rows={filteredStudents}
          getRowId={(student) => student.student_id}
          renderCell={renderStudentCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name or roll no..."
          emptyMessage="No students found."
          itemLabel="students"
          filterButton={(
          <label className="tm-stu-filter">
            <StudentPageIcon type="filter" />
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="all">All classes</option>
              {classOptions.map((item) => <option key={item} value={item}>{item.replace('-', ' - Section ')}</option>)}
            </select>
          </label>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
