export const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

export const findCurrentStudent = (students, user) => {
  if (!Array.isArray(students) || !user) return null;

  const byUserId = students.find((item) => Number(item.user_id) === Number(user.id));
  if (byUserId) return byUserId;

  const userEmail = String(user.email || '').trim().toLowerCase();
  if (!userEmail) return null;

  return students.find((item) => String(item.email || '').trim().toLowerCase() === userEmail) || null;
};

export const getStudentName = (student) => {
  if (!student) return 'Student';
  return `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email || 'Student';
};

export const getStudentInitials = (student) => {
  const name = getStudentName(student);
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'ST';
};

export const isStudentClassRecord = (record, student) => {
  if (!record || !student) return false;
  if (record.class_id && student.class_id) return Number(record.class_id) === Number(student.class_id);
  const recordGrade = record.grade || record.grade_level;
  if (!recordGrade && !record.section) return false;
  const sameGrade = recordGrade === student.grade;
  const sameSection = !record.section || record.section === student.section;
  return sameGrade && sameSection;
};
