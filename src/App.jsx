import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Auth/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import Announcements from "./pages/Admin/Announcement";
import Attendance from "./pages/Admin/Attendance";
import FeeManagement from "./pages/Admin/FeeManagement";
import Exams from "./pages/Admin/exam";
import Reports from "./pages/Admin/Reports";
import Students from "./pages/Admin/students";
import Teacher from "./pages/Admin/Teacher";
import Classes from "./pages/Admin/Classes";
import Subjects from "./pages/Admin/subjects";

import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import TeacherAnnouncements from "./pages/Teacher/TeacherAnnouncements";
import TeacherStudents from "./pages/Teacher/TeacherStudents";
import TeacherClasses from "./pages/Teacher/TeacherClasses";
import TeacherSubjects from "./pages/Teacher/TeacherSubjects";
import TeacherAttendance from "./pages/Teacher/TeacherAttendance";
import TeacherExams from "./pages/Teacher/TeacherExams";
import TeacherReports from "./pages/Teacher/TeacherReports";

import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentAnnouncements from "./pages/Student/StudentAnnouncements";
import StudentAttendance from "./pages/Student/StudentAttendance";
import StudentExams from "./pages/Student/StudentExams";
import StudentFees from "./pages/Student/StudentFees";
import StudentProfile from "./pages/Student/StudentProfile";
import StudentReports from "./pages/Student/StudentReports";
import StudentSubjects from "./pages/Student/StudentSubjects";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/announcement" element={<ProtectedRoute allowedRoles={["admin"]}><Announcements /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute allowedRoles={["admin"]}><Students /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute allowedRoles={["admin"]}><Teacher /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute allowedRoles={["admin"]}><Classes /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute allowedRoles={["admin"]}><Subjects /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={["admin"]}><Attendance /></ProtectedRoute>} />
        <Route path="/fees" element={<ProtectedRoute allowedRoles={["admin"]}><FeeManagement /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute allowedRoles={["admin"]}><Exams /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />

        <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/announcement" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAnnouncements /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherClasses /></ProtectedRoute>} />
        <Route path="/teacher/subjects" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherSubjects /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="/teacher/exams" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherExams /></ProtectedRoute>} />
        <Route path="/teacher/reports" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherReports /></ProtectedRoute>} />

        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/announcement" element={<ProtectedRoute allowedRoles={["student"]}><StudentAnnouncements /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendance /></ProtectedRoute>} />
        <Route path="/student/exams" element={<ProtectedRoute allowedRoles={["student"]}><StudentExams /></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute allowedRoles={["student"]}><StudentFees /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/reports" element={<ProtectedRoute allowedRoles={["student"]}><StudentReports /></ProtectedRoute>} />
        <Route path="/student/subjects" element={<ProtectedRoute allowedRoles={["student"]}><StudentSubjects /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
