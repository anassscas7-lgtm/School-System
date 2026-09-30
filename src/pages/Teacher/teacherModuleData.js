export const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};

export const getTeacherName = (teacher) => {
  if (!teacher) return 'Teacher';
  return `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email || 'Teacher';
};

export const getInitials = (name) => {
  const parts = String(name || 'Teacher').trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'T') + (parts[1]?.[0] || 'R');
};

export const getPakistanDateKey = (value = new Date()) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
};

export const findCurrentTeacher = (teachers = [], user = getStoredUser()) => (
  teachers.find((item) => Number(item.user_id) === Number(user?.id)) ||
  teachers.find((item) => item.email?.toLowerCase() === user?.email?.toLowerCase()) ||
  teachers[0] ||
  null
);

export const getClassKey = (item) => `${item?.grade || ''}-${item?.section || ''}`;

export const filterAssignedClasses = (classes = [], teacherName = 'Teacher') => {
  const target = teacherName.toLowerCase();
  if (!target || target === 'teacher') return classes;

  const assigned = classes.filter((item) => (
    item.teacher_name?.toLowerCase() === target ||
    item.co_teacher?.toLowerCase() === target
  ));

  return assigned.length > 0 ? assigned : classes;
};

export const filterByClassKeys = (records = [], classKeys = new Set()) => {
  if (!classKeys.size) return records;
  return records.filter((item) => classKeys.has(getClassKey(item)));
};
