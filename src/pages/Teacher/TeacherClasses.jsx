import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import TeacherListView from './TeacherListView';
import './TeacherModule.css';
import { API_BASE, filterAssignedClasses, findCurrentTeacher, getInitials, getStoredUser, getTeacherName } from './teacherModuleData';
import { getTeacherHeaderActions } from './teacherHeaderActions';

const ClassPageIcon = ({ type }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    cap: <><path d="m22 10-10-5-10 5 10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></>,
    more: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="tm-cls-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

const classColumns = [
  { key: 'class', label: 'Class', defaultWidth: 270, visible: true },
  { key: 'room', label: 'Room', defaultWidth: 130, visible: true },
  { key: 'academicYear', label: 'Academic year', defaultWidth: 170, visible: true },
  { key: 'subjects', label: 'Subjects', defaultWidth: 260, visible: true },
  { key: 'schedule', label: 'Schedule', defaultWidth: 190, visible: true },
  { key: 'status', label: 'Status', defaultWidth: 140, visible: true },
  { key: 'capacity', label: 'Capacity', defaultWidth: 140, visible: false },
  { key: 'teacher', label: 'Teacher', defaultWidth: 200, visible: false }
];

export default function TeacherClasses() {
  const [teacherName, setTeacherName] = useState('Teacher');
  const [classes, setClasses] = useState([]);
  const [teacherInitials, setTeacherInitials] = useState('TR');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = getStoredUser();
        const [teachersRes, classesRes] = await Promise.all([
          fetch(`${API_BASE}/teachers`).then((r) => r.json()),
          fetch(`${API_BASE}/classes`).then((r) => r.json()),
        ]);
        const teachers = teachersRes.success ? teachersRes.data : [];
        const matchedTeacher = findCurrentTeacher(teachers, user);
        const name = getTeacherName(matchedTeacher);

        setTeacherName(name);
        setTeacherInitials(getInitials(name));
        setClasses(classesRes.success ? classesRes.data : []);
      } catch (error) {
        console.error('Teacher classes fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const assignedClasses = useMemo(() => {
    return filterAssignedClasses(classes, teacherName);
  }, [classes, teacherName]);

  const filteredClasses = assignedClasses.filter((item) => {
    const query = searchTerm.toLowerCase();
    return item.grade?.toLowerCase().includes(query) ||
      item.section?.toLowerCase().includes(query) ||
      item.room_number?.toLowerCase().includes(query);
  });

  const getSubjectText = (item) => {
    if (Array.isArray(item.subjects)) return item.subjects.length > 0 ? item.subjects.join(', ') : 'No subjects assigned';
    if (typeof item.subjects === 'string' && item.subjects.trim()) {
      try {
        const parsed = JSON.parse(item.subjects);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : item.subjects;
      } catch {
        return item.subjects;
      }
    }
    return 'No subjects assigned';
  };
  const headerActions = getTeacherHeaderActions({
    pageName: 'Classes',
    exportFileName: 'teacher-classes.csv',
    exportColumns: [
      { key: 'className', label: 'Class' },
      { key: 'room', label: 'Room' },
      { key: 'academicYear', label: 'Academic year' },
      { key: 'subjects', label: 'Subjects' },
      { key: 'schedule', label: 'Schedule' },
      { key: 'status', label: 'Status' },
      { key: 'capacity', label: 'Capacity' }
    ],
    exportRows: filteredClasses.map((item) => ({
      className: `${item.grade || '-'} - Section ${item.section || '-'}`,
      room: item.room_number || 'N/A',
      academicYear: item.academic_year || 'Current',
      subjects: getSubjectText(item),
      schedule: `${item.start_time || '--'} - ${item.end_time || '--'}`,
      status: item.status || 'Active',
      capacity: item.max_capacity || 0
    }))
  });

  const renderClassCell = (item, column) => {
    const subjectText = getSubjectText(item);
    const values = {
      room: item.room_number || 'N/A',
      academicYear: item.academic_year || 'Current',
      subjects: <span className={`tm-cls-subject-chip color-${item.class_id % 4}`}>{subjectText}</span>,
      schedule: <span className="tm-cls-schedule"><ClassPageIcon type="clock" /> {item.start_time || '--'} - {item.end_time || '--'}</span>,
      status: <span className="tm-cls-pill active">{item.status || 'Active'}</span>,
      capacity: item.max_capacity || 0,
      teacher: item.teacher_name || 'Teacher not assigned'
    };

    if (column.key === 'class') {
      return (
        <div className="tm-cls-name-cell">
          <span className={`tm-cls-avatar color-${item.class_id % 4}`}><ClassPageIcon type="cap" /></span>
          <div>
            <strong>{item.grade} - Section {item.section}</strong>
            <span>{item.teacher_name || 'Teacher not assigned'}</span>
          </div>
        </div>
      );
    }

    return values[column.key] || '-';
  };

  return (
    <DashboardLayout userRole="teacher" currentPath="/teacher/classes" userName={teacherName} userInitials={teacherInitials}>
      <div className="tm-cls-page">
        <div className="tm-cls-header">
          <div>
            <h1>My classes</h1>
            <p>Classes assigned to your timetable and homeroom responsibilities</p>
          </div>
          <div className="tm-profile-chip tm-cls-profile">{teacherInitials}</div>
        </div>
        <Header {...headerActions} />

        <TeacherListView
          storageKey="edusync.teacher.classes.columnView.v1"
          columnDefinitions={classColumns}
          rows={filteredClasses}
          getRowId={(item) => item.class_id}
          renderCell={renderClassCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by grade, section, or room..."
          emptyMessage="No classes found."
          itemLabel="classes"
        />
      </div>
    </DashboardLayout>
  );
}
