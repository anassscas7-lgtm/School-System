# EduSync Project Context

## Project Overview

EduSync is a school management system built as a React single-page app with a separate Express/PostgreSQL backend. The app now has active admin, teacher, and student areas. The admin module is the most complete area and covers students, teachers, classes, subjects, attendance, exams, fees, announcements, and reports. Teacher and student modules have been added and are being expanded into role-specific experiences.

The frontend is a Vite React app in `src/`. The backend lives in `backend/` and exposes REST endpoints on `http://localhost:5000/api/...`. Data is stored in PostgreSQL, apparently Neon, using `pg` and a `DATABASE_URL` environment variable.

## Tech Stack

- Frontend: React 19, Vite, React Router DOM 7
- Styling: plain CSS files colocated with pages/components
- Alerts/modals: SweetAlert2
- PDF/export support: `jspdf`, `jspdf-autotable`
- Backend: Express 5, CORS, dotenv, pg
- Database: PostgreSQL/Neon via `backend/db.js`

## Run Commands

Frontend commands from the project root:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Backend commands from `backend/`:

```bash
npm install
node server.js
```

The backend expects `.env` inside `backend/` or an environment variable with:

```env
DATABASE_URL=postgresql://...
PORT=5000
```

## Important Paths

- `src/main.jsx`: React root mount.
- `src/App.jsx`: route definitions.
- `src/components/DashboardLayout.jsx`: shared dashboard shell.
- `src/components/Sidebar/Sidebar.jsx`: role-aware navigation/sidebar.
- `src/components/ProtectedRoute.jsx`: route guard for role-based access control.
- `src/components/Header/header.jsx`: reusable command bar with Edit, Refresh, Delete, Export buttons.
- `src/pages/Auth/Login.jsx`: login page and role selector.
- `src/pages/Admin/`: main admin modules.
- `src/pages/Teacher/`: teacher module pages.
- `src/pages/Student/`: student module pages.
- `src/pages/parent/ParentDashboard.jsx`: currently empty.
- `backend/server.js`: Express routes and table initialization.
- `backend/db.js`: PostgreSQL pool setup.

## Frontend Routing

Defined in `src/App.jsx`:

- `/`: login page.
- `/admin/dashboard`: admin dashboard.
- `/teacher/dashboard`: teacher dashboard.
- `/student/dashboard`: student dashboard.
- `/admin/announcement`: announcements.
- `/students`: student management.
- `/teachers`: teacher management.
- `/classes`: class management.
- `/subjects`: subject management.
- `/attendance`: attendance management.
- `/fees`: fee management.
- `/exams`: exams management.
- `/reports`: reports.
- `*`: redirects to `/`.

Routes are now guarded by role through `ProtectedRoute.jsx`, so users should not be able to access another role's pages by changing the URL.

## Shared Layout And Navigation

Most dashboard pages render inside `DashboardLayout`, which creates a fixed sidebar and scrollable main content area. The sidebar uses `userRole`, `currentPath`, `userName`, and `userInitials` props to show the correct nav items and profile.

`Sidebar.jsx` has role-based nav configuration:

- Overview: Dashboard, Announcements.
- Management: Students, Teachers, Classes, Subjects.
- Operations: Attendance, Exams, Fee management, Reports.
- System section is currently hidden/removed from the admin sidebar.

Logout uses SweetAlert2 confirmation, clears `localStorage.user` and `localStorage.token`, then navigates to `/`.

The Settings entry has been removed from the admin sidebar.

The shared `Header` component is a command/action bar. Pages pass handlers like `onRefresh`, `onDelete`, and `onExport`. If handlers are not passed, the buttons still render but do nothing.

## Authentication

`Login.jsx` lets the user choose `admin`, `teacher`, or `student`, then posts:

```http
POST http://localhost:5000/api/login
```

Payload:

```json
{ "email": "...", "password": "...", "role": "admin" }
```

The backend checks the `users` table by email, compares `password_hash` directly to the provided password, checks role, then returns a redirect URL.

Current auth/RBA notes:

- Passwords are plain string comparisons, not hashed verification.
- Login stores user data in localStorage. Token flow is still minimal.
- Frontend route protection is implemented with `ProtectedRoute.jsx`.
- The sidebar and page routes are role-aware for admin, teacher, and student access.

## Admin Pages

### Admin Dashboard

File: `src/pages/Admin/Dashboard.jsx`

Mostly static dashboard data:

- Summary cards for total students, teachers, attendance, fee collection.
- Attendance by grade chart.
- Upcoming events.
- Recent enrollments.
- Dropdown to switch to teacher, student, or parent dashboard.

It uses `DashboardLayout` and `Header`.

### Announcements

File: `src/pages/Admin/Announcement.jsx`

Admin announcement UI has been redesigned to match the newer admin visual language. It currently uses mock announcement data only. Features:

- Search and category filters.
- Stats cards.
- Announcement list.
- New announcement modal with fields for title, category, priority, body, audience, schedule, toggles, and attachment UI.

No backend endpoints are connected yet for announcements.

### Students

File: `src/pages/Admin/students.jsx`

Connected to backend. Features:

- Fetches students from `/api/students`.
- Fetches classes from `/api/classes` to populate grade/section options.
- Search by name or roll number.
- Pagination, 7 records per page.
- Checkbox selection.
- CSV export for selected rows.
- Bulk delete via `/api/students/bulk-delete`.
- Add/Edit student modal with 4 steps:
  - Personal info.
  - Academic details.
  - Guardian info.
  - Fee and documents.
- Add uses `POST /api/students`.
- Edit uses `PUT /api/students/:id`.
- Configure Columns feature:
  - add/remove visible columns.
  - reorder columns through the configure modal.
  - reorder visible table headers directly with drag/drop.
  - resize columns directly from the list view by dragging the column edge.
  - quick search scans currently visible columns.
- Student list UI uses the preferred clean list view:
  - simple table surface.
  - primary Name is clickable.
  - relationship-style columns such as Grade/Section are clickable where supported.
  - normal fields remain plain text.

Student creation also creates a linked `users` row with default password `Student@123`.

### Teachers

File: `src/pages/Admin/Teacher.jsx`

Connected to backend. Features:

- Fetches teachers from `/api/teachers`.
- Search by name, employee ID, or subject/designation.
- Filters: All, Active, On leave.
- Pagination, 7 records per page.
- Checkbox selection.
- CSV export for selected rows.
- Bulk delete via `/api/teachers/bulk-delete`.
- Add/Edit teacher modal.
- Add uses `POST /api/teachers`.
- Edit uses `PUT /api/teachers/:id`.
- Configure Columns is implemented with the same modal and direct list-view reorder/resize behavior used in Students.
- Teacher list UI has been simplified to the same clean list direction as Students, with primary name as the clickable record link.

Teacher creation also creates a linked `users` row with default password `Teacher@123`.

### Classes

File: `src/pages/Admin/Classes.jsx`

Connected to backend. Features:

- Fetches classes from `/api/classes`.
- Fetches available subjects from `/api/subjects`.
- Fetches available teachers from `/api/teachers`.
- Search by grade/class or teacher.
- Pagination, 7 records per page.
- Checkbox selection.
- CSV export for selected rows.
- Bulk delete via `/api/classes/bulk-delete`.
- Add/Edit class modal with:
  - grade, section, max capacity, room, academic year, notes.
  - homeroom teacher and co-teacher.
  - subject assignment.
  - start/end time.
  - settings toggles: attendance tracking, gradebook, portal access.
- Add uses `POST /api/classes`.
- Edit uses `PUT /api/classes/:id`.
- Configure Columns is implemented with the same modal and direct list-view reorder/resize behavior used in Students.
- Classes list UI has been simplified toward the same clean list direction as Students.

Some table values are still generated placeholders, such as random attendance percentage and average grade.

### Subjects

File: `src/pages/Admin/subjects.jsx`

Connected to backend. Features:

- Fetches subjects from `/api/subjects`.
- Fetches classes from `/api/classes` to populate grade levels.
- Checkbox selection.
- CSV export for selected rows.
- Bulk delete via `/api/subjects/bulk-delete`.
- Add/Edit subject modal.
- Add uses `POST /api/subjects`.
- Edit uses `PUT /api/subjects/:id`.
- The previous stats cards and average-score side panel have been removed.
- Configure Columns is implemented with the same modal and direct list-view reorder/resize behavior used in Students.
- Subjects currently keeps the previous compact list UI after recent rollback requests.

### Attendance

File: `src/pages/Admin/Attendance.jsx`

Connected to backend. Features:

- Fetches students, teachers, and attendance records.
- Filter table by grade, section, and start date.
- Shows a 5-day attendance window using normalized local date keys to avoid timezone/date display mismatches.
- Pagination, 7 students per page.
- Checkbox selection.
- CSV export for selected rows.
- Bulk clear attendance via `/api/attendance/bulk-delete`.
- Simplified hierarchy view:
  - students render as parent rows.
  - arrow button expands/collapses child attendance detail.
  - student name opens the attendance marking/edit form.
  - child panel shows selected week, roll number, total marked, absent, late, holiday, recent attendance, remarks, and marked-by teacher name.
- Mark attendance modal:
  - date, grade, section, period, marked by teacher.
  - status toggles: P, A, L, H.
  - mark all present/absent.
  - optional remarks.
- Saves via `POST /api/attendance/bulk`.

Attendance status mapping:

- `P` -> `Present`
- `A` -> `Absent`
- `L` -> `Late`
- `H` -> `Holiday`

### Exams

File: `src/pages/Admin/exam.jsx`

Connected to backend. Features:

- Fetches exams, teachers, subjects, and classes.
- Search by exam title or subject.
- Pagination, 7 records per page.
- Checkbox selection.
- CSV export for selected rows.
- Bulk delete via `/api/exams/bulk-delete`.
- Schedule exam modal.
- Add uses `POST /api/exams`.

The exam UI expects normalized relationships through `subjectId`, `classId`, and `invigilatorId`.

### Fee Management

File: `src/pages/Admin/FeeManagement.jsx`

Connected to backend. Features:

- Fetches fee records from `/api/fees`.
- Fetches students from `/api/students`.
- Search fee records.
- Checkbox selection.
- CSV export for selected rows.
- Bulk delete via `/api/fees/bulk-delete`.
- Record payment modal:
  - search/select student by name or roll number.
  - fee month, amount, method, transaction ID.
- Saves via `POST /api/fees`.

### Reports

File: `src/pages/Admin/Reports.jsx`

Partially connected to backend. Features:

- Fetches school snapshot from `/api/reports/snapshot`.
- Fetches report history from `/api/reports/recent`.
- Generate report modal posts to `/api/reports/generate`.
- Local PDF generation with `jspdf` and `jspdf-autotable`.
- CSV-style download for non-PDF reports.

The backend also has `/api/reports/download-pdf/:id`, but the frontend currently generates PDFs locally instead of using that route.

## Teacher, Student, And Parent Pages

Teacher and student module folders now contain role-specific pages rather than only a single dashboard mock.

Teacher module includes teacher-facing dashboard and management-style pages such as announcements.

Student module includes student-facing dashboard and pages such as announcements, subjects, attendance, exams, fees, and reports. Student data is scoped so a logged-in student sees their own relevant information. Student attendance resolves the `marked_by` teacher ID into the teacher name where available.

`ParentDashboard.jsx` exists but is empty, and no parent route is defined in `App.jsx`.

## Backend API Summary

Backend base URL:

```txt
http://localhost:5000
```

Auth:

- `POST /api/login`

Students:

- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `POST /api/students/bulk-delete`

Teachers:

- `GET /api/teachers`
- `POST /api/teachers`
- `PUT /api/teachers/:id`
- `POST /api/teachers/bulk-delete`

Classes:

- `GET /api/classes`
- `POST /api/classes`
- `PUT /api/classes/:id`
- `POST /api/classes/bulk-delete`

Subjects:

- `GET /api/subjects`
- `POST /api/subjects`
- `PUT /api/subjects/:id`
- `POST /api/subjects/bulk-delete`

Attendance:

- `GET /api/attendance`
- `POST /api/attendance/bulk`
- `POST /api/attendance/bulk-delete`

Exams:

- `GET /api/exams`
- `POST /api/exams`
- `POST /api/exams/bulk-delete`

Fees:

- `GET /api/fees`
- `POST /api/fees`
- `POST /api/fees/bulk-delete`

Reports:

- `GET /api/reports/snapshot`
- `GET /api/reports/recent`
- `GET /api/reports/download-pdf/:id`
- `POST /api/reports/generate`

## Database Tables Used Or Expected

The backend initializes some tables in `initDatabase()`:

- `classes`
- `subjects`
- `attendance`
- `exams`

Other tables are used but not created in `initDatabase()`:

- `users`
- `students`
- `teachers`
- `fee_payments`
- `generated_reports`

Expected/highly used columns include:

Users:

- `user_id`, `email`, `password_hash`, `role`

Students:

- `student_id`, `first_name`, `middle_name`, `last_name`, `date_of_birth`, `gender`, `blood_group`, `cnic`, `religion`, `email`, `phone`, `residential_address`, `city`, `province`, `postal_code`, `grade`, `section`, `enrollment_date`, `previous_school`, `guardian_name`, `guardian_relation`, `guardian_occupation`, `guardian_contact`, `guardian_email`, `monthly_fee`, `fee_discount`, `notes`, `status`, `fee_status`, `roll_no`, `user_id`

Teachers:

- `teacher_id`, `first_name`, `last_name`, `gender`, `date_of_birth`, `cnic`, `phone_number`, `designation`, `employment_type`, `email`, `joining_date`, `emp_id`, `status`, `user_id`

Classes:

- `class_id`, `grade`, `section`, `max_capacity`, `room_number`, `academic_year`, `notes`, `teacher_name`, `co_teacher`, `subjects`, `start_time`, `end_time`, `status`, `created_at`
- The frontend/backend route code also expects a `settings` column, but the table initialization does not currently create it.

Subjects:

- `subject_id`, `subject_name`, `subject_code`, `grade_level`, `subject_category`, `teacher_name`, `weekly_periods`, `credit_hours`, `is_elective`, `has_lab`, `status`, `created_at`

Attendance:

- `attendance_id`, `student_id`, `class_id`, `attendance_date`, `status`, `remarks`, `marked_by`, `created_at`
- Unique constraint is attempted for `(student_id, attendance_date)`.

Fees:

- `payment_id`, `student_id`, `payment_type`, `fee_month`, `payment_date`, `amount_due`, `discount_amount`, `amount_received`, `payment_method`, `transaction_id`, `remarks`, `print_receipt`, `email_guardian`, `sms_confirm`

Reports:

- `report_id`, `report_name`, `report_type`, `generated_by`, `format`, `created_at`

## Known Issues And Risks

- The project is now being pushed to GitHub branches during development. Recent branches included UI/configure-column work.
- There are mojibake/encoding artifacts in many files, for example `ðŸ‘‰`, `âœ“`, `â€”`. This likely came from emoji/special characters being saved or displayed with the wrong encoding.
- `backend/server.js` uses CommonJS `require`, while the root frontend package uses `"type": "module"`. Backend has its own `package.json`, so this should work if run from `backend/`.
- Backend table initialization is incomplete. It creates only some tables. Existing database must already contain `users`, `students`, `teachers`, `fee_payments`, and `generated_reports`.
- Class routes use a `settings` column, but `CREATE TABLE classes` does not create `settings`.
- Exam routes use `subject_id`, `class_id`, `room_number`, and `weightage_percent`, but the `CREATE TABLE exams` statement currently creates different columns like `subject`, `grade`, `sections`, `exam_rooms`, and `weightage`. This mismatch can break scheduling/fetching exams unless the actual DB schema has already been changed manually.
- Login compares plain text passwords against `password_hash`. Real password hashing is not implemented.
- Frontend route protection exists, but backend authorization checks should still be reviewed because true security must be enforced server-side as well.
- Many frontend API URLs are hardcoded to `http://localhost:5000`.
- Announcements are mock-only and have no backend persistence.
- Teacher and student modules exist, but some pages may still need deeper backend integration and polishing.
- Parent dashboard is empty and not registered in routing.
- Some UI values are placeholder/random, especially classes attendance and average grade.
- File upload controls in student/teacher/announcement/class forms are visual only and do not upload files.
- The shared `Header` renders buttons even when pages do not pass handlers.

## Development Style In This Project

- Components are functional React components with local `useState` and `useEffect`.
- Each page has a matching CSS file with page-specific class prefixes:
  - `ad-` admin dashboard
  - `ann-` announcements
  - `st-` students management
  - `tc-` teacher management
  - `cl-` classes
  - `sbj-` subjects
  - `att-` attendance
  - `ex-` exams
  - `fm-` fees/reports shared styles
- Most admin pages follow the same pattern:
  - page header
  - shared action header
  - search/filter controls
  - table
  - checkbox selection
  - CSV export for selected records
  - delete confirmation with SweetAlert2
  - modal for create/edit

## Recent UI And Feature Decisions

- Admin module UI has gone through a major pass for announcements, students, teachers, classes, subjects, attendance, exams, fees, and reports.
- Configure Columns has been added to Students, Teachers, Classes, and Subjects.
- The configure modal uses a D365-style "Configure View" pattern with visible/hidden toggles and drag ordering.
- Direct list-view column resize and reorder are supported on configurable admin lists.
- Student list is the preferred reference for the clean list style.
- Subjects was briefly adjusted to add a matching footer/fixed-height list area, then rolled back at the user's request to preserve the previous compact list UI.
- Attendance was simplified from chart-heavy dashboard content into a parent-child accordion list.
- Attendance date handling now normalizes DB dates before comparing them to selected week dates.

## Suggested Next Steps

1. Fix backend schema mismatches for `classes.settings` and exams columns.
2. Add missing table initialization or migrations for `users`, `students`, `teachers`, `fee_payments`, and `generated_reports`.
3. Move hardcoded API base URL into an environment variable, for example `VITE_API_URL`.
4. Audit frontend route guards for every admin/teacher/student route.
5. Add backend-side authorization checks for every role-scoped endpoint.
6. Replace plain password checks with hashed passwords.
7. Connect announcements to backend CRUD endpoints.
8. Continue converting teacher/student pages from partial/mock data to role-specific backend data.
9. Add parent dashboard route and implementation, or remove the link until ready.
10. Clean encoding artifacts and replace broken emoji/symbol text with ASCII or valid UTF-8.
11. Add a small migration/seed script for local development.
