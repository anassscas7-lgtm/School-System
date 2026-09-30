# EduSync Application Walkthrough

EduSync is a role-based school management application with three main user modules: Admin, Teacher, and Student. Each module has its own dashboard, sidebar navigation, protected routes, and page-specific workflows. The application is built as a React single-page app and communicates with the backend API at `http://localhost:5000/api`.

This document walks through the full application experience, explains what each module contains, and provides guidance for using the major screens and actions.

## 1. Application Overview

EduSync is organized around the daily workflows of a school:

- Admin users manage the whole school system: students, teachers, classes, subjects, attendance, exams, fees, announcements, and reports.
- Teacher users manage their assigned teaching workspace: class rosters, assigned classes, assigned subjects, attendance marking, exam scheduling, announcements, and reports.
- Student users view their personal academic portal: dashboard summary, announcements, subjects, attendance history, exams, fees, profile, and reports.

The application uses a shared layout structure:

- A fixed sidebar on the left.
- A main content area for each page.
- A shared header/action bar on list and dashboard pages.
- A consistent list/table component with configurable columns.
- Styled popups for confirmations, detail previews, and unavailable actions.

## 2. Authentication and Routing

The app starts at the login page:

```text
/
```

The login screen allows the user to select one of three roles:

- Admin
- Teacher
- Student

After entering email, password, and role, the app sends a login request to:

```text
POST http://localhost:5000/api/login
```

If login succeeds, the authenticated user is stored in `localStorage` under the `user` key. The app then redirects the user to the correct dashboard:

| Role | Dashboard |
| --- | --- |
| Admin | `/admin/dashboard` |
| Teacher | `/teacher/dashboard` |
| Student | `/student/dashboard` |

Routes are protected with `ProtectedRoute`. If a user is not logged in, they are redirected back to `/`. If a logged-in user tries to open a page outside their role, they are redirected to their own dashboard.

Logout clears authentication storage and returns the user to the login page. The login form also clears old credentials after logout so email and password do not remain visible.

## 3. Shared Layout and Navigation

All modules use the same `DashboardLayout`, which renders:

- The sidebar.
- The active page content.
- The logged-in user's name, initials, and role.

The sidebar is role-aware. It shows only the menu items available for the current module.

### Shared Sidebar Sections

The sidebar is grouped into:

- Overview
- Management
- Operations

The active page is highlighted in the sidebar. The logout button appears at the bottom with the user profile block.

### Shared Header

Many pages use the shared action header with:

- Edit
- Refresh
- Delete
- Export

For pages where direct editing or deleting is not available, the button opens a styled popup explaining what to do next. Refresh reloads or refetches the page data. Export downloads available page data as a CSV where supported.

## 4. Admin Module

The Admin module is the main control area for managing school data.

### Admin Routes

| Page | Route |
| --- | --- |
| Dashboard | `/admin/dashboard` |
| Announcements | `/admin/announcement` |
| Students | `/students` |
| Teachers | `/teachers` |
| Classes | `/classes` |
| Subjects | `/subjects` |
| Attendance | `/attendance` |
| Exams | `/exams` |
| Fee Management | `/fees` |
| Reports | `/reports` |

### Admin Dashboard

The Admin dashboard gives a high-level school summary. It includes:

- Total students.
- Teacher count.
- Attendance summary.
- Fee collection summary.
- Attendance by grade chart.
- Upcoming school events.
- Recent enrollments.

This screen is designed as the first overview for school administrators.

### Announcements

The Announcements page is used to create and manage school-wide notices.

Typical announcement data includes:

- Title.
- Audience.
- Type or category.
- Message details.
- Date.

Admins can publish important notices such as exam reminders, parent-teacher meetings, fee deadlines, and event updates.

### Students

The Students page manages student records. It includes a list/table view with:

- Student name.
- Phone.
- Fee status.
- Section.
- Status.
- Grade.
- Student email.
- Admission date.

The page supports:

- Adding a student.
- Searching student records.
- Configuring visible list columns.
- Exporting records.
- Opening student forms.

The Add Student form uses a stepper flow:

1. Personal information.
2. Academic details.
3. Guardian information.
4. Fee and documents.

The stepper is designed so all steps remain visible and users can return to step 1 when needed.

### Teachers

The Teachers page manages teacher staff records.

Teacher forms include:

- Personal information.
- Professional details.
- Employee information.
- Work email.
- Joining date.
- Designation.
- Employment type.

The Add Teacher and Cancel buttons are aligned consistently on the right side of the modal footer. Theme colors use `#1d4ed8`.

### Classes

The Classes page manages class creation and class details.

Class data includes:

- Grade.
- Section.
- Maximum capacity.
- Classroom number.
- Academic year.
- Description or notes.

The Add Class modal uses the same standard modal layout and button placement as the other admin forms.

### Subjects

The Subjects page manages curriculum subjects.

Subject data includes:

- Subject name.
- Subject code.
- Grade level.
- Category.
- Elective setting.
- Lab requirement.

The subject form uses the app theme color and aligned section headers for General Information and Settings.

### Attendance

The Attendance page allows admins to manage attendance records.

It includes:

- Attendance lists.
- Student attendance details.
- Expandable rows for viewing a student's attendance history.
- Modal workflow for marking attendance.

The attendance modal became the reference standard for modal size, spacing, and button placement across the admin module.

### Exams

The Exams page manages school exams and schedules.

Admins can:

- View exam lists.
- Schedule exams.
- Track exam status.
- Manage exam-related details.

### Fee Management

The Fee Management page tracks fee payments.

It includes:

- Payment records.
- Student search.
- Payment information.
- Fee month.
- Amount received.
- Payment method.
- Transaction ID.

The Record Fee Payment modal follows the shared modal layout, with Cancel and Save Payment buttons aligned together on the right.

### Reports

The Reports page is used to generate and view school reports.

Reports may include:

- Attendance reports.
- Academic reports.
- Fee reports.
- Export formats such as PDF or Excel.

Report generation uses themed modal controls and consistent action buttons.

## 5. Teacher Module

The Teacher module is focused on a teacher's assigned workspace. It reuses the same sidebar style as the Admin module but only shows teacher-relevant pages.

### Teacher Routes

| Page | Route |
| --- | --- |
| Dashboard | `/teacher/dashboard` |
| Announcements | `/teacher/announcement` |
| Students | `/teacher/students` |
| Classes | `/teacher/classes` |
| Subjects | `/teacher/subjects` |
| Attendance | `/teacher/attendance` |
| Exams | `/teacher/exams` |
| Reports | `/teacher/reports` |

### Teacher Dashboard

The Teacher dashboard summarizes the teacher's current work.

It includes:

- Greeting with the teacher name.
- Notification button.
- Teacher initials/profile button.
- Shared action header.
- Four stat cards:
  - Assigned Classes.
  - My Students.
  - Present Today.
  - Upcoming Exams.
- My Classes panel.
- Upcoming Exams panel.

The stat cards use different soft accent colors:

- Assigned Classes: blue.
- My Students: purple.
- Present Today: green.
- Upcoming Exams: orange.

The teacher dashboard buttons work as follows:

- Notification opens a styled popup.
- Profile initials opens a teacher summary popup.
- Header actions open useful popups, refresh data, or export dashboard metrics.
- View all links navigate to the relevant teacher page.
- Class rows open class detail popups.

### Teacher Announcements

The Teacher Announcements page displays notices relevant to teachers.

It includes:

- Search.
- Type filter.
- Recent announcements card.
- Announcement rows with title, details, type badge, and date.
- New announcement button.

The New Announcement button opens a styled popup explaining that announcement creation is managed from the Admin module.

### Teacher Students

The Teacher Students page shows students assigned to the teacher's classes.

It includes:

- Search by name or roll number.
- Class filter.
- Configurable columns.
- Export support.
- Student list rows with avatar initials, student name, email, roll number, class, guardian, fee status, and status.

The list is scoped to assigned classes where possible.

### Teacher Classes

The Teacher Classes page displays assigned classes.

It includes:

- Search by grade, section, or room.
- Configurable columns.
- Class rows with class name, room, academic year, subjects, schedule, status, capacity, and teacher.

This page is useful for quickly reviewing homeroom or co-teacher responsibilities.

### Teacher Subjects

The Teacher Subjects page shows curriculum subjects available to or assigned to the teacher.

It includes:

- Search.
- Category filter.
- Configurable columns.
- Subject name.
- Subject code.
- Grade.
- Category.
- Weekly periods.
- Lab status.
- Teacher assignment.

The page uses the shared list component for consistent column behavior.

### Teacher Attendance

The Teacher Attendance page is used to mark student attendance.

It includes:

- Date selector.
- Class selector.
- Mark all present.
- Mark all absent.
- Student list.
- Current status.
- Mark dropdown for each student.
- Save attendance button.

Save Attendance validates that at least one student was marked before submitting. Success and error states use styled popups.

### Teacher Exams

The Teacher Exams page shows scheduled assessments and lets teachers schedule new exams.

The list includes:

- Exam title.
- Subject.
- Class.
- Date.
- Marks.
- Status.

The Schedule Exam button opens a modal with:

- Exam title.
- Exam type.
- Subject.
- Class and section.
- Exam date.
- Start time.
- Duration.
- Total marks.
- Passing marks.
- Negative marking.
- Instructions.
- Publish exam to students toggle.

The schedule form validates required fields before submitting.

### Teacher Reports

The Teacher Reports page displays report cards/exports relevant to teacher workflows.

It includes:

- Generate report button.
- Selectable report cards.
- Download actions.
- Header export button for selected reports.
- Styled feedback popups for empty selection, success, and error states.

## 6. Student Module

The Student module is a personal student portal. It is read-focused, with students viewing their own academic, fee, attendance, and report information.

### Student Routes

| Page | Route |
| --- | --- |
| Dashboard | `/student/dashboard` |
| Announcements | `/student/announcement` |
| Subjects | `/student/subjects` |
| Attendance | `/student/attendance` |
| Exams | `/student/exams` |
| Fee Management | `/student/fees` |
| Profile | `/student/profile` |
| Reports | `/student/reports` |

### Student Dashboard

The Student dashboard gives the student a personal summary.

It includes:

- Attendance percentage.
- Upcoming exams count.
- Fee paid amount.
- Roll number.
- Upcoming exams panel.
- Profile summary.
- Quick access cards.
- Informational reminder.

The profile initials button navigates to the Student Profile page.

### Student Profile

The Student Profile page shows personal, academic, guardian, and fee information.

It includes:

- Student identity card.
- Status badge.
- Grade and section.
- Roll number.
- Student information panel.
- Guardian information panel.
- Academic information panel.
- Fee information panel.

This page is read-only for students.

### Student Announcements

The Student Announcements page displays important school notices.

It includes:

- Search.
- Configurable columns.
- Filter button.
- Announcement list.
- Type badge.
- Detail text.
- Pagination.

Clicking an announcement opens a styled custom popup instead of a browser default alert.

### Student Subjects

The Student Subjects page shows subjects assigned to the student's grade.

It includes:

- Search.
- Configurable columns.
- Subject name.
- Code.
- Category.
- Teacher.
- Weekly periods.
- Lab status.

The list uses the same reusable list component pattern as other modules.

### Student Attendance

The Student Attendance page displays attendance history.

It includes:

- Attendance summary cards.
- Present count.
- Absent count.
- Late count.
- Searchable attendance list.
- Date.
- Status.
- Remarks.
- Marked by.

Status badges make attendance records easy to scan.

### Student Exams

The Student Exams page displays exam schedules and assessment details.

It includes:

- Search.
- Configurable columns.
- Exam title.
- Subject.
- Date.
- Time.
- Marks.
- Status.

Students can review upcoming and completed exams from this page.

### Student Fee Management

The Student Fee Management page displays personal fee history and account status.

It includes:

- Monthly fee.
- Total paid.
- Total due.
- Current status.
- Searchable fee records.
- Month.
- Payment date.
- Due amount.
- Received amount.
- Payment method.
- Status.

This page is read-only for students.

### Student Reports

The Student Reports page shows personal summaries.

It includes:

- Attendance report card.
- Fee report card.
- Exam report card.
- Class summary card.
- Available summaries list.

The report summary rows align icons and status pills consistently.

## 7. Shared List and Column Configuration

The app includes reusable list components for Admin, Teacher, and Student pages.

Common list features include:

- Search input.
- Configurable columns.
- Column visibility controls.
- Column ordering.
- Row selection.
- Pagination.
- Filter button.
- Empty state messages.

This creates a consistent table/list experience across the modules.

## 8. Popups and User Feedback

The app uses SweetAlert2 for polished popups.

Popups are used for:

- Logout confirmation.
- Header button guidance.
- Form validation.
- Save success.
- Error messages.
- Detail previews.
- Read-only explanations.

Student and teacher modules each include shared popup helpers:

- `studentHeaderActions.js`
- `teacherHeaderActions.js`

These helpers keep popup styling consistent inside each module.

## 9. Theme and UI Consistency

The main theme color is:

```text
#1d4ed8
```

The application uses this color for:

- Primary buttons.
- Active sidebar states.
- Main icons.
- Header actions.
- Selected pagination.
- Modal actions.
- Important focus states.

Supporting colors are used carefully for semantic meaning:

- Green: success, active, paid, present.
- Red: urgent, absent, logout, danger.
- Orange/yellow: pending, late, fees, warning.
- Purple: secondary academic/report accents.

Forms and modals follow a consistent pattern:

- Header with icon, title, and subtitle.
- Body with grouped sections.
- Right-aligned action buttons.
- Cancel button next to the primary action.
- Required field note in the footer.

## 10. Expected User Flow

### Admin Flow

1. Login as Admin.
2. Review the dashboard summary.
3. Manage announcements, students, teachers, classes, and subjects.
4. Record attendance, exams, and fee payments.
5. Generate reports.
6. Export needed data.
7. Logout.

### Teacher Flow

1. Login as Teacher.
2. Review assigned classes and upcoming exams on the dashboard.
3. View announcements.
4. Check assigned students, classes, and subjects.
5. Mark attendance.
6. Schedule exams.
7. Generate or download reports.
8. Logout.

### Student Flow

1. Login as Student.
2. Review personal dashboard.
3. Read announcements.
4. Check subjects, attendance, exams, fees, and reports.
5. Open profile from the initials button.
6. Logout.

## 11. Development Notes

The app is structured by role:

```text
src/pages/Admin
src/pages/Teacher
src/pages/Student
```

Shared components live in:

```text
src/components
```

Important shared components include:

- `DashboardLayout`
- `Sidebar`
- `ProtectedRoute`
- `Header`
- `AdminListView`
- `AdminColumnDrawer`

The frontend expects the backend API to be running at:

```text
http://localhost:5000/api
```

Run the app locally with the project dev command, then sign in from `/`.

## 12. Summary

EduSync now provides a complete three-role school management experience:

- Admin controls the complete school system.
- Teachers manage classroom responsibilities and academic workflows.
- Students access their personal academic portal.

The application uses consistent navigation, shared UI patterns, reusable list components, polished modals, role-based routing, and a unified theme to keep all three modules aligned.
