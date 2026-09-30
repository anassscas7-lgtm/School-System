// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  next();
});

// ==========================================
// 🛠️ DATABASE TABLES INITIALIZATION (PERMANENT)
// ==========================================
const initDatabase = async () => {
  try {
    // 1. Classes Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classes (
        class_id SERIAL PRIMARY KEY,
        grade VARCHAR(50) NOT NULL,
        section VARCHAR(50) NOT NULL,
        max_capacity INTEGER,
        room_number VARCHAR(50),
        academic_year VARCHAR(50),
        notes TEXT,
        teacher_name VARCHAR(100),
        co_teacher VARCHAR(100),
        subjects TEXT[],
        start_time TIME,
        end_time TIME,
        att_tracking BOOLEAN DEFAULT true,
        gradebook BOOLEAN DEFAULT true,
        portal_access BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Subjects Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        subject_id SERIAL PRIMARY KEY,
        subject_name VARCHAR(100) NOT NULL,
        subject_code VARCHAR(50),
        grade_level VARCHAR(50),
        subject_category VARCHAR(50),
        teacher_name VARCHAR(100),
        weekly_periods INTEGER,
        credit_hours INTEGER,
        is_elective BOOLEAN DEFAULT false,
        has_lab BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Attendance Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Holiday')),
        remarks TEXT,
        marked_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🔥 4. Exams Table (NEW ADDITION) 🔥
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        exam_id SERIAL PRIMARY KEY,
        exam_title VARCHAR(255) NOT NULL,
        exam_type VARCHAR(100),
        subject VARCHAR(100),
        grade VARCHAR(50),
        sections TEXT[],
        exam_date DATE,
        start_time TIME,
        duration VARCHAR(50),
        exam_rooms VARCHAR(255),
        invigilator_id INTEGER,
        total_marks INTEGER,
        passing_marks INTEGER,
        weightage INTEGER,
        grading_scale VARCHAR(50),
        notify_portal BOOLEAN DEFAULT true,
        send_sms BOOLEAN DEFAULT true,
        auto_publish BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject_id INTEGER;`);
    await pool.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS class_id INTEGER;`);
    await pool.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS room_number VARCHAR(255);`);
    await pool.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS weightage_percent INTEGER;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS generated_reports (
        report_id SERIAL PRIMARY KEY,
        report_name VARCHAR(255) NOT NULL,
        report_type VARCHAR(100),
        generated_by VARCHAR(100),
        format VARCHAR(50) DEFAULT 'PDF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_vouchers (
        voucher_id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
        fee_month VARCHAR(100) NOT NULL,
        amount_due NUMERIC DEFAULT 0,
        issue_date DATE,
        due_date DATE,
        grade VARCHAR(50),
        section VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Generated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS fee_vouchers_student_month_idx
      ON fee_vouchers (student_id, fee_month);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        announcement_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(80) DEFAULT 'General',
        priority VARCHAR(80) DEFAULT 'Normal',
        message TEXT NOT NULL,
        audience VARCHAR(80) DEFAULT 'All students',
        status VARCHAR(50) DEFAULT 'Published',
        read_rate INTEGER DEFAULT 0,
        created_by VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const annCount = await pool.query("SELECT COUNT(*) FROM announcements");
    if (Number(annCount.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO announcements (title, category, priority, message, audience, status, read_rate, created_at)
         VALUES
         ($1, 'Exam', 'Urgent', $2, 'All students', 'Published', 94, '2026-04-10'),
         ($3, 'General', 'Normal', $4, 'All', 'Published', 82, '2026-04-12'),
         ($5, 'Event', 'Normal', $6, 'All students', 'Published', 74, '2026-04-15')`,
        [
          'Mid-term exams begin April 25',
          'Exams will be held from April 25 to May 2. Students are advised to check their timetables.',
          'Parent-teacher meeting - April 28',
          'PTM scheduled from 9 AM to 1 PM. All subject teachers are required to be present.',
          'Sports day registration open',
          'Register for sports day events by April 22. Available events: cricket, football, athletics.'
        ]
      );
    }

    // AUTOMATIC FIXES FOR NEON DB (From Previous Fixes)
    await pool.query(`
      ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_marked_by_fkey;
      ALTER TABLE attendance ALTER COLUMN marked_by TYPE VARCHAR(255) USING marked_by::varchar;
    `);

    try {
      await pool.query(`
        ALTER TABLE attendance ADD CONSTRAINT unique_student_date UNIQUE (student_id, attendance_date);
      `);
    } catch (err) {
      // Ignored if constraint already exists
    }

    console.log("✅ Database Tables are verified and ready (Including Exams).");
  } catch (err) {
    console.error("❌ Error initializing database:", err.message);
  }
};
initDatabase();

// ==========================================
// 🔑 AUTHENTICATION ROUTES
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = result.rows[0];
    if (user.role.toLowerCase() !== role.toLowerCase() || user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or role' });
    }
    let redirectUrl = user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Teacher' ? '/teacher/dashboard' : '/student/dashboard';
    res.json({ success: true, user: { id: user.user_id, email: user.email, role: user.role }, redirectUrl });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ==========================================
// ANNOUNCEMENTS ROUTES
// ==========================================
app.get('/api/announcements', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC, announcement_id DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, category, priority, message, audience, status, createdBy } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO announcements (title, category, priority, message, audience, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, category || 'General', priority || 'Normal', message, audience || 'All students', status || 'Published', createdBy || 'Admin']
    );
    res.json({ success: true, data: result.rows[0], message: 'Announcement saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, priority, message, audience, status } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE announcements
       SET title = $1, category = $2, priority = $3, message = $4, audience = $5, status = $6
       WHERE announcement_id = $7
       RETURNING *`,
      [title, category || 'General', priority || 'Normal', message, audience || 'All students', status || 'Published', id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    res.json({ success: true, data: result.rows[0], message: 'Announcement updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/announcements/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No announcement IDs provided.' });
  }

  try {
    const result = await pool.query("DELETE FROM announcements WHERE announcement_id = ANY($1)", [ids]);
    res.json({ success: true, message: `${result.rowCount} announcement(s) deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🎓 STUDENTS ROUTES
// ==========================================

// 1. GET ALL STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const query = "SELECT * FROM students ORDER BY student_id DESC";
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2. BULK DELETE STUDENTS (Isay hamesha alag route rakhna hai)
app.post('/api/students/bulk-delete', async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No IDs provided" });
  }

  try {
    // PostgreSQL ANY($1) query
    const query = "DELETE FROM students WHERE student_id = ANY($1)";
    const result = await pool.query(query, [ids]);

    if (result.rowCount > 0) {
      res.json({ success: true, message: `${result.rowCount} students deleted.` });
    } else {
      res.json({ success: false, message: "No records found to delete." });
    }
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Database error: " + error.message });
  }
});

// 3. CREATE NEW STUDENT (With User Account)
app.post('/api/students', async (req, res) => {
  const client = await pool.connect();
  let inTransaction = false;

  try {
    const {
      firstName, middleName, lastName, dob, gender, bloodGroup, cnic, religion,
      email, phone, address, city, province, postalCode,
      grade, section, admissionDate, prevSchool,
      guardianName, guardianRelation, guardianOccupation, guardianContact, guardianEmail,
      monthlyFee, feeDiscount, notes
    } = req.body;

    const validDate = (dateStr) => (dateStr && dateStr.trim() !== '') ? dateStr : null;
    const validString = (str) => (str && String(str).trim() !== '') ? String(str) : null;
    const validNum = (num) => (num && !isNaN(num)) ? parseFloat(num) : 0;
    const normalizedEmail = validString(email)?.toLowerCase() || null;
    const requiredFields = [
      ['First name', firstName],
      ['Last name', lastName],
      ['Grade', grade],
      ['Section', section],
      ['Guardian name', guardianName],
      ['Guardian contact', guardianContact]
    ];
    const missingField = requiredFields.find(([, value]) => !validString(value));

    if (missingField) {
      return res.status(400).json({ success: false, message: `${missingField[0]} is required.` });
    }

    await client.query('BEGIN');
    inTransaction = true;

    // STEP 1: CREATE USER ACCOUNT
    const defaultPassword = 'Student@123';
    let autoRollNo = '';
    let isUniqueRoll = false;
    while (!isUniqueRoll) {
      autoRollNo = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      const rollCheck = await client.query('SELECT student_id FROM students WHERE roll_no = $1', [autoRollNo]);
      isUniqueRoll = rollCheck.rows.length === 0;
    }

    const userEmail = normalizedEmail || `${autoRollNo.toLowerCase()}@edusync.com`;
    const emailCheck = await client.query('SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)', [userEmail]);
    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(400).json({ success: false, message: "This student email is already registered. Use another email or leave it blank to auto-generate login credentials." });
    }

    const userQuery = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'Student')
      RETURNING user_id;
    `;
    const userResult = await client.query(userQuery, [userEmail, defaultPassword]);
    const newUserId = userResult.rows[0].user_id;

    // STEP 2: CREATE STUDENT RECORD
    const studentQuery = `
      INSERT INTO students (
        first_name, middle_name, last_name, date_of_birth, gender,
        blood_group, cnic, religion, email, phone,
        residential_address, city, province, postal_code,
        grade, section, enrollment_date, previous_school,
        guardian_name, guardian_relation, guardian_occupation,
        guardian_contact, guardian_email, monthly_fee,
        fee_discount, notes, status, fee_status, roll_no, user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26,
        'Active', 'Pending', $27, $28
      ) RETURNING *;
    `;

    const studentValues = [
      validString(firstName), validString(middleName), validString(lastName),
      validDate(dob), validString(gender), validString(bloodGroup),
      validString(cnic), validString(religion), normalizedEmail,
      validString(phone), validString(address), validString(city),
      validString(province), validString(postalCode), validString(grade),
      validString(section), validDate(admissionDate), validString(prevSchool),
      validString(guardianName), validString(guardianRelation),
      validString(guardianOccupation), validString(guardianContact),
      validString(guardianEmail), validNum(monthlyFee),
      validString(feeDiscount), validString(notes),
      autoRollNo, newUserId
    ];

    const result = await client.query(studentQuery, studentValues);
    await client.query('COMMIT');
    inTransaction = false;

    res.status(201).json({
      success: true,
      message: "Student & User Account created successfully!",
      data: result.rows[0]
    });

  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    console.error("Insert Error:", error);
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(400).json({ success: false, message: "This student email is already registered. Use another email or leave it blank to auto-generate login credentials." });
    }
    if (error.code === '23505' && error.constraint === 'students_roll_no_key') {
      return res.status(400).json({ success: false, message: "Generated roll number already exists. Please submit again." });
    }
    if (error.code === '23502') {
      return res.status(400).json({ success: false, message: "Please complete all required student fields before submitting." });
    }
    res.status(500).json({ success: false, message: "Server error during registration: " + error.message });
  } finally {
    client.release();
  }
});

// 4. UPDATE STUDENT RECORD
app.put('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      firstName, middleName, lastName, dob, gender, bloodGroup, cnic, religion,
      email, phone, address, city, province, postalCode,
      grade, section, admissionDate, prevSchool,
      guardianName, guardianRelation, guardianOccupation, guardianContact, guardianEmail,
      monthlyFee, feeDiscount, notes
    } = req.body;

    const validDate = (dateStr) => (dateStr && dateStr.trim() !== '') ? dateStr : null;
    const validString = (str) => (str && String(str).trim() !== '') ? String(str) : null;
    const validNum = (num) => (num && !isNaN(num)) ? parseFloat(num) : 0;

    const query = `
      UPDATE students
      SET
        first_name = $1, middle_name = $2, last_name = $3, date_of_birth = $4, gender = $5,
        blood_group = $6, cnic = $7, religion = $8, email = $9, phone = $10,
        residential_address = $11, city = $12, province = $13, postal_code = $14,
        grade = $15, section = $16, enrollment_date = $17, previous_school = $18,
        guardian_name = $19, guardian_relation = $20, guardian_occupation = $21,
        guardian_contact = $22, guardian_email = $23, monthly_fee = $24,
        fee_discount = $25, notes = $26
      WHERE student_id = $27
      RETURNING *;
    `;

    const values = [
      validString(firstName), validString(middleName), validString(lastName),
      validDate(dob), validString(gender), validString(bloodGroup),
      validString(cnic), validString(religion), validString(email),
      validString(phone), validString(address), validString(city),
      validString(province), validString(postalCode), validString(grade),
      validString(section), validDate(admissionDate), validString(prevSchool),
      validString(guardianName), validString(guardianRelation),
      validString(guardianOccupation), validString(guardianContact),
      validString(guardianEmail), validNum(monthlyFee),
      validString(feeDiscount), validString(notes),
      studentId
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.json({ success: true, message: "Student record updated fully!" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Server error during update" });
  }
});

// ==========================================
// 👨‍🏫 TEACHERS ROUTES
// ==========================================

// 1. GET ALL TEACHERS
app.get('/api/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY teacher_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
});

// 2. BULK DELETE TEACHERS (Naya Route)
app.post('/api/teachers/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No teacher IDs provided" });
  }
  try {
    const query = "DELETE FROM teachers WHERE teacher_id = ANY($1)";
    const result = await pool.query(query, [ids]);
    res.json({ success: true, message: `${result.rowCount} teacher(s) deleted successfully.` });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ success: false, message: "Database Error" });
  }
});

// 3. UPDATE EXISTING TEACHER
app.put('/api/teachers/:id', async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { firstName, lastName, gender, dob, cnic, phone, designation, empType, email, joiningDate } = req.body;
    const validDate = (dateStr) => (dateStr && dateStr.trim() !== '') ? dateStr : null;
    const validString = (str) => (str && String(str).trim() !== '') ? String(str) : null;

    const query = `
      UPDATE teachers
      SET first_name = $1, last_name = $2, gender = $3, date_of_birth = $4,
          cnic = $5, phone_number = $6, designation = $7, employment_type = $8,
          email = $9, joining_date = $10
      WHERE teacher_id = $11
      RETURNING *;
    `;
    const values = [validString(firstName), validString(lastName), validString(gender), validDate(dob), validString(cnic), validString(phone), validString(designation), validString(empType), validString(email), validDate(joiningDate), teacherId];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Teacher not found." });
    res.json({ success: true, message: "Teacher updated fully!" });
  } catch (error) { res.status(500).json({ success: false, message: "Server error during update" }); }
});

// 4. ADD NEW TEACHER (With User Account)
app.post('/api/teachers', async (req, res) => {
  const client = await pool.connect();
  try {
    const { firstName, lastName, gender, dob, cnic, phone, designation, empType, email, joiningDate } = req.body;
    const validDate = (dateStr) => (dateStr && dateStr.trim() !== '') ? dateStr : null;
    const validString = (str) => (str && String(str).trim() !== '') ? String(str) : null;
    const autoEmpId = `T-${Math.floor(100 + Math.random() * 900)}`;

    await client.query('BEGIN');
    const userEmail = validString(email) || `${autoEmpId.toLowerCase()}@edusync.com`;

    // Email Check to avoid duplicate key error
    const emailCheck = await client.query('SELECT user_id FROM users WHERE email = $1', [userEmail]);
    if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: "Email already exists in users table." });
    }

    const userResult = await client.query(`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'Teacher') RETURNING user_id;`, [userEmail, 'Teacher@123']);
    const newUserId = userResult.rows[0].user_id;

    const teacherQuery = `
      INSERT INTO teachers (first_name, last_name, gender, date_of_birth, cnic, phone_number, designation, employment_type, email, joining_date, emp_id, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12) RETURNING *;
    `;
    const values = [validString(firstName), validString(lastName), validString(gender), validDate(dob), validString(cnic), validString(phone), validString(designation), validString(empType), validString(email), validDate(joiningDate), autoEmpId, newUserId];
    await client.query(teacherQuery, values);
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: "Teacher created successfully!" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: "Server error during registration: " + error.message });
  } finally { client.release(); }
});

// ==========================================
// 🏫 CLASSES & SUBJECTS ROUTES
// ==========================================
// --- GET ALL CLASSES ---
app.get('/api/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY class_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Fetch Error (Classes):", err);
    res.status(500).json({ success: false, message: 'Error fetching classes' });
  }
});

// 👉 NEW: BULK DELETE CLASSES
app.post('/api/classes/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No class IDs provided" });
  }
  try {
    // PostgreSQL ANY($1) query for multiple IDs
    const query = "DELETE FROM classes WHERE class_id = ANY($1)";
    const result = await pool.query(query, [ids]);

    if (result.rowCount > 0) {
      res.json({ success: true, message: `${result.rowCount} class(es) deleted successfully.` });
    } else {
      res.json({ success: false, message: "No records found to delete." });
    }
  } catch (error) {
    console.error("Bulk Delete Error (Classes):", error);
    res.status(500).json({ success: false, message: "Server Database Error" });
  }
});

// --- UPDATE EXISTING CLASS (PUT) ---
app.put('/api/classes/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    const {
      grade, section, maxCapacity, roomNumber, academicYear,
      notes, teacher, coTeacher, startTime, endTime,
      subjects, settings
    } = req.body;

    const query = `
      UPDATE classes
      SET
        grade = $1, section = $2, max_capacity = $3, room_number = $4,
        academic_year = $5, notes = $6, teacher_name = $7, co_teacher = $8,
        start_time = $9, end_time = $10, subjects = $11, settings = $12
      WHERE class_id = $13
      RETURNING *;
    `;

    const values = [
      grade,
      section,
      maxCapacity ? parseInt(maxCapacity) : 0,
      roomNumber,
      academicYear,
      notes,
      teacher,
      coTeacher,
      startTime,
      endTime,
      subjects || [],
      JSON.stringify(settings || {}),
      classId
    ];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Class not found." });

    res.json({ success: true, message: "Class updated successfully!" });
  } catch (error) {
    console.error("Update Error (Classes):", error);
    res.status(500).json({ success: false, message: "Server error during update" });
  }
});

// --- ADD NEW CLASS (POST) ---
app.post('/api/classes', async (req, res) => {
  try {
    const {
      grade, section, maxCapacity, roomNumber, academicYear,
      notes, teacher, coTeacher, startTime, endTime,
      subjects, settings
    } = req.body;

    const query = `
      INSERT INTO classes (
        grade, section, max_capacity, room_number, academic_year,
        notes, teacher_name, co_teacher, start_time, end_time,
        subjects, settings, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Active'
      ) RETURNING *;
    `;

    const values = [
      grade,
      section,
      maxCapacity ? parseInt(maxCapacity) : 0,
      roomNumber,
      academicYear,
      notes,
      teacher,
      coTeacher,
      startTime,
      endTime,
      subjects || [],
      JSON.stringify(settings || {})
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, message: "Class created successfully!", data: result.rows[0] });

  } catch (error) {
    console.error("Insert Error (Classes):", error);
    res.status(500).json({ success: false, message: "Server error during class creation" });
  }
});

// ==========================================
// 📚 SUBJECTS ROUTES
// ==========================================

app.get('/api/subjects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY subject_id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
});

// 👉 NEW: BULK DELETE SUBJECTS
app.post('/api/subjects/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No subject IDs provided" });
  }
  try {
    // PostgreSQL ANY($1) query for multiple IDs
    const query = "DELETE FROM subjects WHERE subject_id = ANY($1)";
    const result = await pool.query(query, [ids]);

    if (result.rowCount > 0) {
      res.json({ success: true, message: `${result.rowCount} subject(s) deleted successfully.` });
    } else {
      res.json({ success: false, message: "No records found to delete." });
    }
  } catch (error) {
    console.error("Bulk Delete Error (Subjects):", error);
    res.status(500).json({ success: false, message: "Server Database Error" });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { subjectName, subjectCode, gradeLevel, subjectCategory, teacherName, weeklyPeriods, creditHours, isElective, hasLab } = req.body;
  try {
    const query = `
      UPDATE subjects
      SET subject_name = $1,
          subject_code = $2,
          grade_level = $3,
          subject_category = $4,
          teacher_name = $5,
          weekly_periods = $6,
          credit_hours = $7,
          is_elective = $8,
          has_lab = $9
      WHERE subject_id = $10
      RETURNING *;
    `;
    const result = await pool.query(query, [
      subjectName,
      subjectCode,
      gradeLevel,
      subjectCategory,
      teacherName,
      weeklyPeriods,
      creditHours,
      isElective,
      hasLab,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({ success: true, message: 'Subject updated successfully!', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  const { subjectName, subjectCode, gradeLevel, subjectCategory, teacherName, weeklyPeriods, creditHours, isElective, hasLab } = req.body;
  try {
    const query = `
      INSERT INTO subjects (subject_name, subject_code, grade_level, subject_category, teacher_name, weekly_periods, credit_hours, is_elective, has_lab)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    await pool.query(query, [subjectName, subjectCode, gradeLevel, subjectCategory, teacherName, weeklyPeriods, creditHours, isElective, hasLab]);
    res.json({ success: true, message: 'Subject added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📅 ATTENDANCE ROUTES
// ==========================================

app.get('/api/attendance', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attendance ORDER BY attendance_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: 'Error fetching attendance' }); }
});

app.post('/api/attendance/bulk', async (req, res) => {
  const { date, classId, attendanceList, markedBy } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const teacherId = String(markedBy);

    for (let record of attendanceList) {
      const stId = parseInt(record.student_id);
      const clId = parseInt(classId || 1);

      const query = `
        INSERT INTO attendance (student_id, class_id, attendance_date, status, remarks, marked_by)
        VALUES ($1::integer, $2::integer, $3::date, $4::varchar, $5::text, $6::varchar)
        ON CONFLICT (student_id, attendance_date)
        DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, marked_by = EXCLUDED.marked_by;
      `;

      const fullStatus = record.status === 'P' ? 'Present' : record.status === 'A' ? 'Absent' : record.status === 'L' ? 'Late' : 'Holiday';

      await client.query(query, [stId, clId, date, fullStatus, record.remarks || '', teacherId]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Attendance published successfully!' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// 👉 NEW: BULK DELETE ATTENDANCE
app.post('/api/attendance/bulk-delete', async (req, res) => {
  const { ids, dates } = req.body;
  if (!ids || ids.length === 0 || !dates || dates.length === 0) {
    return res.status(400).json({ success: false, message: "No students or dates selected." });
  }
  try {
    // Selected students aur visible dates ka record delete karega
    const query = "DELETE FROM attendance WHERE student_id = ANY($1) AND attendance_date = ANY($2)";
    const result = await pool.query(query, [ids, dates]);
    res.json({ success: true, message: `${result.rowCount} records cleared.` });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
});
// ==========================================
// 📝 EXAMS ROUTES
// ==========================================

app.get('/api/exams', async (req, res) => {
  try {
    const query = `
      SELECT
        e.*,
        s.subject_name,
        c.grade, c.section,
        t.first_name AS invigilator_first_name, t.last_name AS invigilator_last_name
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.subject_id
      LEFT JOIN classes c ON e.class_id = c.class_id
      LEFT JOIN teachers t ON e.invigilator_id = t.teacher_id
      ORDER BY e.exam_date ASC;
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 NEW: BULK DELETE EXAMS
app.post('/api/exams/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No exam IDs provided" });
  }
  try {
    // PostgreSQL ANY($1) query for multiple IDs
    const query = "DELETE FROM exams WHERE exam_id = ANY($1)";
    const result = await pool.query(query, [ids]);

    if (result.rowCount > 0) {
      res.json({ success: true, message: `${result.rowCount} exam(s) deleted successfully.` });
    } else {
      res.json({ success: false, message: "No records found to delete." });
    }
  } catch (error) {
    console.error("Bulk Delete Error (Exams):", error);
    res.status(500).json({ success: false, message: "Server Database Error" });
  }
});

app.put('/api/exams/:id', async (req, res) => {
  const data = req.body;
  const toInt = (val) => {
    const p = parseInt(val, 10);
    return isNaN(p) ? null : p;
  };

  try {
    const query = `
      UPDATE exams
      SET
        exam_title = $1,
        exam_type = $2,
        subject_id = $3,
        class_id = $4,
        exam_date = $5,
        start_time = $6,
        duration = $7,
        room_number = $8,
        invigilator_id = $9,
        total_marks = $10,
        passing_marks = $11,
        weightage_percent = $12,
        grading_scale = $13,
        notify_portal = $14,
        send_sms = $15,
        auto_publish = $16
      WHERE exam_id = $17
      RETURNING *;
    `;
    const values = [
      data.examTitle,
      data.examType,
      toInt(data.subjectId),
      toInt(data.classId),
      data.examDate || null,
      data.startTime || null,
      data.duration,
      data.roomNumber,
      toInt(data.invigilatorId),
      toInt(data.totalMarks) || 100,
      toInt(data.passingMarks) || 50,
      toInt(data.weightagePercent) || 0,
      data.gradingScale,
      data.notifyPortal,
      data.sendSms,
      data.autoPublish,
      req.params.id
    ];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Exam not found.' });
    res.json({ success: true, data: result.rows[0], message: 'Exam updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Database Error: " + err.message });
  }
});

app.post('/api/exams', async (req, res) => {
  const data = req.body;
  try {
    const query = `
      INSERT INTO exams (
        exam_title, exam_type, subject_id, class_id, exam_date, start_time,
        duration, room_number, invigilator_id, total_marks, passing_marks,
        weightage_percent, grading_scale, notify_portal, send_sms, auto_publish
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `;

    const toInt = (val) => {
      const p = parseInt(val, 10);
      return isNaN(p) ? null : p;
    };

    const values = [
      data.examTitle, data.examType, toInt(data.subjectId), toInt(data.classId),
      data.examDate || null, data.startTime || null, data.duration,
      data.roomNumber, toInt(data.invigilatorId), toInt(data.totalMarks) || 100,
      toInt(data.passingMarks) || 50, toInt(data.weightagePercent) || 0,
      data.gradingScale, data.notifyPortal, data.sendSms, data.autoPublish
    ];

    await pool.query(query, values);
    res.json({ success: true, message: 'Exam scheduled successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Database Error: " + err.message });
  }
});

const formatVoucherDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const drawSingleFeeVoucher = (doc, voucher) => {
  const studentName = `${voucher.first_name || ''} ${voucher.last_name || ''}`.trim() || 'Student';
  const amount = Number(voucher.amount_due || 0);

  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(0.8);
  doc.roundedRect(12, 16, 186, 128, 3, 3);

  doc.setFillColor(239, 246, 255);
  doc.rect(12, 16, 186, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(7, 19, 55);
  doc.text('EduSync Fee Voucher', 18, 31);
  doc.setFontSize(9);
  doc.setTextColor(83, 102, 143);
  doc.text(`Fee Month: ${voucher.fee_month || '-'}`, 190, 27, { align: 'right' });
  doc.text(`Voucher No: FV-${voucher.voucher_id}`, 190, 34, { align: 'right' });

  const rows = [
    ['Student Name', studentName, 'Student ID', voucher.student_id || '-'],
    ['Guardian Name', voucher.guardian_name || '-', 'Amount', `PKR ${amount.toLocaleString('en-US')}`],
    ['Grade', voucher.grade || '-', 'Section', voucher.section || '-'],
    ['Issue Date', formatVoucherDate(voucher.issue_date), 'Last Date', formatVoucherDate(voucher.due_date)]
  ];

  rows.forEach((row, index) => {
    const y = 58 + (index * 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(83, 102, 143);
    doc.text(`${row[0]}:`, 18, y);
    doc.text(`${row[2]}:`, 112, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(row[1]), 50, y);
    doc.text(String(row[3]), 142, y);
  });

  doc.setDrawColor(226, 232, 240);
  doc.line(18, 110, 192, 110);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(7, 19, 55);
  doc.text('Payment Instructions', 18, 123);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(83, 102, 143);
  doc.text('Please submit this fee before the last date. Keep this voucher for your record.', 18, 133);
};

app.post('/api/fee-vouchers', async (req, res) => {
  const { studentIds, feeMonth, amount, issueDate, lastDate, grade, section } = req.body;
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one student.' });
  }
  if (!feeMonth || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Fee month and amount are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saved = [];
    for (const studentId of studentIds) {
      const result = await client.query(
        `INSERT INTO fee_vouchers (student_id, fee_month, amount_due, issue_date, due_date, grade, section, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Generated')
         ON CONFLICT (student_id, fee_month)
         DO UPDATE SET amount_due = EXCLUDED.amount_due,
                       issue_date = EXCLUDED.issue_date,
                       due_date = EXCLUDED.due_date,
                       grade = EXCLUDED.grade,
                       section = EXCLUDED.section,
                       status = 'Generated',
                       created_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [parseInt(studentId, 10), feeMonth, parseFloat(amount) || 0, issueDate || null, lastDate || null, grade || null, section || null]
      );
      saved.push(result.rows[0]);
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true, data: saved, message: `${saved.length} voucher(s) generated.` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Voucher generation failed: ' + err.message });
  } finally {
    client.release();
  }
});

app.get('/api/fee-vouchers', async (req, res) => {
  try {
    const { studentId } = req.query;
    const whereClause = studentId ? 'WHERE fv.student_id = $1' : '';
    const params = studentId ? [studentId] : [];
    const result = await pool.query(
      `SELECT fv.*, s.first_name, s.last_name, s.roll_no, s.guardian_name
       FROM fee_vouchers fv
       JOIN students s ON fv.student_id = s.student_id
       ${whereClause}
       ORDER BY fv.created_at DESC, fv.voucher_id DESC`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/fee-vouchers/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No voucher IDs provided.' });
  }

  try {
    const result = await pool.query('DELETE FROM fee_vouchers WHERE voucher_id = ANY($1)', [ids]);
    res.json({ success: true, message: `${result.rowCount} voucher(s) deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Voucher delete failed: ' + err.message });
  }
});

app.get('/api/fee-vouchers/:id/pdf', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fv.*, s.first_name, s.last_name, s.roll_no, s.guardian_name
       FROM fee_vouchers fv
       JOIN students s ON fv.student_id = s.student_id
       WHERE fv.voucher_id = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Voucher not found.' });

    const voucher = result.rows[0];
    const doc = new jsPDF('p', 'mm', 'a4');
    drawSingleFeeVoucher(doc, voucher);
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Fee_Voucher_${voucher.voucher_id}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    res.status(500).json({ success: false, message: 'PDF Error: ' + err.message });
  }
});

// --- GET ALL FEE RECORDS ---
app.get('/api/fees', async (req, res) => {
  try {
    const query = `
      SELECT f.*, s.first_name, s.last_name, s.roll_no, s.grade, s.section
      FROM fee_payments f
      JOIN students s ON f.student_id = s.student_id
      ORDER BY f.payment_date DESC;
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 👉 NEW: BULK DELETE FEE RECORDS
app.post('/api/fees/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No payment IDs provided" });
  }
  try {
    // PostgreSQL ANY($1) query for multiple IDs
    const query = "DELETE FROM fee_payments WHERE payment_id = ANY($1)";
    const result = await pool.query(query, [ids]);

    if (result.rowCount > 0) {
      res.json({ success: true, message: `${result.rowCount} fee record(s) deleted successfully.` });
    } else {
      res.json({ success: false, message: "No records found to delete." });
    }
  } catch (error) {
    console.error("Bulk Delete Error (Fees):", error);
    res.status(500).json({ success: false, message: "Server Database Error" });
  }
});

app.put('/api/fees/:id', async (req, res) => {
  const data = req.body;
  try {
    const query = `
      UPDATE fee_payments
      SET
        student_id = $1,
        payment_type = $2,
        fee_month = $3,
        payment_date = $4,
        amount_due = $5,
        discount_amount = $6,
        amount_received = $7,
        payment_method = $8,
        transaction_id = $9,
        remarks = $10,
        print_receipt = $11,
        email_guardian = $12,
        sms_confirm = $13
      WHERE payment_id = $14
      RETURNING *;
    `;
    const values = [
      parseInt(data.studentId, 10),
      data.paymentType || 'Monthly fee',
      data.feeMonth,
      data.paymentDate || new Date(),
      parseFloat(data.amountDue) || 0,
      parseFloat(data.discountAmount) || 0,
      parseFloat(data.amountReceived) || 0,
      data.paymentMethod || 'Cash',
      data.transactionId || null,
      data.remarks || '',
      data.printReceipt ?? true,
      data.emailGuardian ?? true,
      data.smsConfirm ?? false,
      req.params.id
    ];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Fee record not found.' });
    res.json({ success: true, data: result.rows[0], message: 'Payment updated!' });
  } catch (err) {
    console.error("Database Error updating Fees:", err.message);
    res.status(500).json({ success: false, message: "Database Error: " + err.message });
  }
});

// --- RECORD NEW PAYMENT ---
app.post('/api/fees', async (req, res) => {
  const data = req.body;
  try {
    const query = `
      INSERT INTO fee_payments (
        student_id, payment_type, fee_month, payment_date, amount_due,
        discount_amount, amount_received, payment_method, transaction_id,
        remarks, print_receipt, email_guardian, sms_confirm
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      parseInt(data.studentId, 10),
      data.paymentType || 'Monthly fee',
      data.feeMonth,
      data.paymentDate || new Date(),
      parseFloat(data.amountDue) || 0,
      parseFloat(data.discountAmount) || 0,
      parseFloat(data.amountReceived) || 0,
      data.paymentMethod || 'Cash',
      data.transactionId || null,
      data.remarks || '',
      data.printReceipt ?? true,
      data.emailGuardian ?? true,
      data.smsConfirm ?? false
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows[0], message: 'Payment recorded!' });
  } catch (err) {
    console.error("❌ Database Error in Fees:", err.message);
    res.status(500).json({ success: false, message: "Database Error: " + err.message });
  }
});

// --- ANALYTICS SNAPSHOT ---
app.get('/api/reports/snapshot', async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM students");
    const classes = await pool.query("SELECT COUNT(*) FROM classes");
    const fees = await pool.query("SELECT SUM(amount_received) as total FROM fee_payments");

    res.json({
      success: true,
      data: [
        { label: "Total Students", val: students.rows[0].count, color: "blue" },
        { label: "Active Classes", val: classes.rows[0].count, color: "green" },
        { label: "Fee Collection", val: `PKR ${fees.rows[0].total || 0}`, color: "yellow" }
      ]
    });
  } catch (err) { res.status(500).send(err.message); }
});

// 2. Fetch Recent Reports
app.get('/api/reports/recent', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM generated_reports ORDER BY created_at DESC LIMIT 10");
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/reports/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No report IDs provided.' });
  }

  try {
    const result = await pool.query("DELETE FROM generated_reports WHERE report_id = ANY($1)", [ids]);
    res.json({ success: true, message: `${result.rowCount} report(s) deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const { jsPDF } = require("jspdf");
require("jspdf-autotable");

app.get('/api/reports/download-pdf/:id', async (req, res) => {
    const reportId = req.params.id;
    try {
        // 1. Report ki details fetch karein
        const reportInfo = await pool.query("SELECT * FROM generated_reports WHERE report_id = $1", [reportId]);
        const report = reportInfo.rows[0];

        // 2. Sample Data (Yahan aap students ya fees ka asli data fetch kar sakte hain)
        const tableData = [
            ["ID", "Name", "Status", "Date"],
            ["101", "Ali Khan", "Paid", "2024-05-01"],
            ["102", "Sara Ahmed", "Pending", "2024-05-02"],
            ["103", "Zain Malik", "Paid", "2024-05-03"],
        ];

        const doc = new jsPDF();

        // 🏫 Header
        doc.setFontSize(20);
        doc.text("EDUSYNC LMS - OFFICIAL REPORT", 105, 15, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Report Name: ${report.report_name}`, 14, 25);
        doc.text(`Generated By: ${report.generated_by}`, 14, 30);
        doc.text(`Date: ${new Date(report.created_at).toLocaleString()}`, 14, 35);

        // 📊 Table
        doc.autoTable({
            startY: 45,
            head: [tableData[0]],
            body: tableData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] } // School Green Color
        });

        const pdfBuffer = doc.output("arraybuffer");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${report.report_name}.pdf`);
        res.send(Buffer.from(pdfBuffer));

    } catch (err) {
        res.status(500).send("PDF Error: " + err.message);
    }
});

// 3. Save Generated Report Entry
app.post('/api/reports/generate', async (req, res) => {
  const { reportName, reportType, format, generatedBy } = req.body;
  try {
    await pool.query(
      "INSERT INTO generated_reports (report_name, report_type, generated_by, format) VALUES ($1, $2, $3, $4)",
      [reportName, reportType, generatedBy, format]
    );
    res.json({ success: true, message: 'Report generated successfully!' });
  } catch (err) { res.status(500).send(err.message); }
});

// ==========================================
// 🏁 SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EduSync Server running on http://localhost:${PORT}`);
});
