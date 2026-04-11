import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "peachstack-super-secret-key";
const PORT = 3000;

// Resend setup
const resend = new Resend(process.env.RESEND_API_KEY || 're_hDVQdpBc_MCtewQMYAF6TnFb4p9Av2o2R');

const sendStudentWelcomeEmail = async (studentData: any) => {
  const { firstName, lastName, email, birthday, university, major, year, additionalAcademicDetails, whyOpportunity } = studentData;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || "New Student");
  
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "peachstackadmin@gmail.com",
      subject: `${fullName} - New Student Application`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h1 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">New Student Application</h1>
          <p>A new student has submitted their application details.</p>
          
          <h2 style="color: #334155; font-size: 18px;">Personal Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">First Name:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${firstName || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Last Name:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${lastName || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Birthday:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${birthday || 'N/A'}</td></tr>
          </table>

          <h2 style="color: #334155; font-size: 18px; margin-top: 20px;">Academic Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">University:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${university || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Major:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${major || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Year:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${year || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Additional Details:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${Array.isArray(additionalAcademicDetails) ? additionalAcademicDetails.join(', ') : (additionalAcademicDetails || 'None')}</td></tr>
          </table>

          <h2 style="color: #334155; font-size: 18px; margin-top: 20px;">Why Peachstack?</h2>
          <div style="padding: 15px; background-color: #f8fafc; border-radius: 4px; border-left: 4px solid #f97316; font-style: italic;">
            ${whyOpportunity || 'No essay provided.'}
          </div>
          
          <br />
          <p style="color: #64748b; font-size: 12px;">This is an automated notification from Peachstack Admin.</p>
        </div>
      `,
    });
    console.log(`Admin notification email sent for ${email}`);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return { success: false, error };
  }
};

// Database setup
const db = new Database("peachstack.db");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'employer', 'admin')),
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY,
    university TEXT,
    major TEXT,
    minor TEXT,
    year TEXT,
    skills TEXT, -- JSON string
    bio TEXT,
    profile_picture_url TEXT,
    badges_earned TEXT, -- JSON string
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    description TEXT,
    logo_url TEXT,
    contact_person TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    employer_id TEXT NOT NULL,
    skills_required TEXT, -- JSON string
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'in-progress')),
    deadline DATETIME,
    compensation TEXT,
    FOREIGN KEY(employer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cover_letter TEXT,
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS student_onboarding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    birthday TEXT,
    university TEXT,
    major TEXT,
    year TEXT,
    additional_details TEXT, -- JSON string
    why_opportunity TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_id TEXT,
    created_by TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','in_progress','in_review','completed','blocked')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    due_date TEXT,
    estimated_hours REAL,
    actual_hours REAL,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(created_by) REFERENCES users(id),
    FOREIGN KEY(assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS task_comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS task_activity_log (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cohorts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming','active','completed')),
    max_capacity INTEGER DEFAULT 10,
    fee_amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cohort_members (
    cohort_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','removed')),
    payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','partial','paid')),
    PRIMARY KEY(cohort_id, user_id),
    FOREIGN KEY(cohort_id) REFERENCES cohorts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admin_audit_log (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.prepare("ALTER TABLE student_onboarding ADD COLUMN why_opportunity TEXT").run();
} catch (e) {
  // Column already exists
}
try { db.prepare("ALTER TABLE users ADD COLUMN is_superadmin INTEGER DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1").run(); } catch(e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE contact_submissions ADD COLUMN is_read INTEGER DEFAULT 0").run(); } catch(e) {}
try { db.prepare("ALTER TABLE contact_submissions ADD COLUMN is_archived INTEGER DEFAULT 0").run(); } catch(e) {}

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
if (userCount.count === 0) {
  const studentId = "1";
  const employerId = "2";
  
  const insertUser = db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)");
  insertUser.run(studentId, "student@peachstack.com", bcrypt.hashSync("password123", 10), "Alex Johnson", "student");
  insertUser.run(employerId, "employer@peachstack.com", bcrypt.hashSync("password123", 10), "Sarah Miller", "employer");

  const insertStudent = db.prepare("INSERT INTO student_profiles (user_id, university, major, year, skills) VALUES (?, ?, ?, ?, ?)");
  insertStudent.run(studentId, "Stanford University", "Computer Science", "Junior", JSON.stringify(["React", "Node.js", "Python"]));

  const insertEmployer = db.prepare("INSERT INTO employer_profiles (user_id, company_name, industry, company_size) VALUES (?, ?, ?, ?)");
  insertEmployer.run(employerId, "PeachTech", "Technology", "50-200");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  // API routes
  app.post("/api/register", async (req, res) => {
    const { email, password, name, role } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)").run(id, email, hashedPassword, name, role);
      
      if (role === "student") {
        db.prepare("INSERT INTO student_profiles (user_id) VALUES (?)").run(id);
        // Fire and forget email to admin
        sendStudentWelcomeEmail({ firstName: name, email });
      } else if (role === "employer") {
        db.prepare("INSERT INTO employer_profiles (user_id, company_name) VALUES (?, ?)").run(id, name);
      }

      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      res.json({ user: decoded });
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Student Profiles
  app.get("/api/students/:id", authenticate, (req, res) => {
    const profile = db.prepare(`
      SELECT u.name, u.email, s.* 
      FROM users u 
      JOIN student_profiles s ON u.id = s.user_id 
      WHERE u.id = ?
    `).get(req.params.id) as any;
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    profile.skills = JSON.parse(profile.skills || "[]");
    profile.badges_earned = JSON.parse(profile.badges_earned || "[]");
    res.json(profile);
  });

  app.put("/api/students/:id", authenticate, (req: any, res: any) => {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { university, major, minor, year, skills, bio, profile_picture_url } = req.body;
    db.prepare(`
      UPDATE student_profiles 
      SET university = ?, major = ?, minor = ?, year = ?, skills = ?, bio = ?, profile_picture_url = ?
      WHERE user_id = ?
    `).run(university, major, minor, year, JSON.stringify(skills), bio, profile_picture_url, req.params.id)
    // Send email notification
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'peachstackadmin@gmail.com',
        subject: 'New Student Signup - Peachstack',
        html: `<div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#f97316">New Student Signup</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>University</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${university || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Major</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${major || 'N/A'}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Minor</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${minor || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Year</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${year || 'N/A'}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Skills</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${Array.isArray(skills) ? skills.join(', ') : (skills || 'N/A')}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Bio</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${bio || 'N/A'}</td></tr>
          </table>
        </div>`
      });
    } catch (emailErr) { console.error('Email send error:', emailErr); };
    res.json({ message: "Profile updated" });
  });

  // Employer Profiles
  app.get("/api/employers/:id", authenticate, (req: any, res: any) => {
    const profile = db.prepare(`
      SELECT u.name, u.email, e.* 
      FROM users u 
      JOIN employer_profiles e ON u.id = e.user_id 
      WHERE u.id = ?
    `).get(req.params.id) as any;
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  // Projects
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects WHERE status = 'open'").all();
    res.json(projects.map((p: any) => ({ ...p, skills_required: JSON.parse(p.skills_required || "[]") })));
  });

  app.post("/api/projects", authenticate, (req: any, res: any) => {
    if (req.user.role !== "employer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { title, description, skills_required, deadline, compensation } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    db.prepare(`
      INSERT INTO projects (id, title, description, employer_id, skills_required, deadline, compensation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, req.user.id, JSON.stringify(skills_required), deadline, compensation);
    // Send email notification
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'peachstackadmin@gmail.com',
        subject: 'New Employer Listing - Peachstack',
        html: `<div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#f97316">New Employer Listing</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Title</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${title || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Description</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${description || 'N/A'}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Skills Required</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${Array.isArray(skills_required) ? skills_required.join(', ') : (skills_required || 'N/A')}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Deadline</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${deadline || 'N/A'}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Compensation</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${compensation || 'N/A'}</td></tr>
          </table>
        </div>`
      });
    } catch (emailErr) { console.error('Email send error:', emailErr); }
    res.status(201).json({ id, message: "Project created" });
  });

  // Applications
  app.post("/api/applications", authenticate, (req: any, res: any) => {
    if (req.user.role !== "student") return res.status(403).json({ message: "Only students can apply" });
    const { project_id, cover_letter } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    try {
      db.prepare(`
        INSERT INTO applications (id, student_id, project_id, cover_letter)
        VALUES (?, ?, ?, ?)
      `).run(id, req.user.id, project_id, cover_letter);
      res.status(201).json({ id, message: "Application submitted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contact Form
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    db.prepare("INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)").run(name, email, message);
    // Send email notification
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'peachstackadmin@gmail.com',
        subject: 'New Contact Form Message - Peachstack',
        html: `<div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#f97316">New Contact Form Submission</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Name</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${name || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${email || 'N/A'}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Message</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${message || 'N/A'}</td></tr>
          </table>
        </div>`
      });
    } catch (emailErr) { console.error('Email send error:', emailErr); }
    res.status(201).json({ message: "Message sent" });
  });

  // Student Onboarding
  app.post("/api/student-onboarding", (req, res) => {
    const { firstName, lastName, email, birthday, university, major, year, additionalAcademicDetails, whyOpportunity } = req.body;
    try {
      db.prepare(`
        INSERT INTO student_onboarding (first_name, last_name, email, birthday, university, major, year, additional_details, why_opportunity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(firstName, lastName, email, birthday, university, major, year, JSON.stringify(additionalAcademicDetails || []), whyOpportunity);
      
      // Fire and forget email to admin
      sendStudentWelcomeEmail(req.body);
      
      res.status(201).json({ message: "Application submitted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Test Email Endpoint
  app.get("/api/test-email", async (req, res) => {
    const testData = {
      firstName: "Srikar",
      lastName: "Jujala",
      email: "srikarjujala@gmail.com",
      birthday: "01/15/2003",
      university: "Stanford University",
      major: "Computer Science",
      year: "1st Year",
      additionalAcademicDetails: [],
      whyOpportunity: "Test submission to verify email integration works."
    };

    const result = await sendStudentWelcomeEmail(testData);
    if (result.success) {
      res.json({ message: "Test email sent successfully", data: result.data });
    } else {
      res.status(500).json({ message: "Failed to send test email", error: result.error });
    }
  });

  // ─── Admin Middleware ────────────────────────────────────────────────────────
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

  const requireAdmin = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role !== 'admin' && decoded.role !== 'superadmin' && !decoded.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      const user = db.prepare('SELECT token_version, is_active FROM users WHERE id = ?').get(decoded.id) as any;
      if (!user || !user.is_active) return res.status(403).json({ message: 'Account deactivated' });
      if (user.token_version !== undefined && decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.token_version) {
        return res.status(401).json({ message: 'Session expired' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  const requireSuperadmin = (req: any, res: any, next: any) => {
    requireAdmin(req, res, () => {
      if (req.user.role !== 'superadmin' && !req.user.isSuperadmin) {
        return res.status(403).json({ message: 'Superadmin access required' });
      }
      next();
    });
  };

  // ─── Admin Auth ──────────────────────────────────────────────────────────────
  app.post('/api/admin/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND (role = 'admin' OR role = 'superadmin' OR is_superadmin = 1)").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.is_active) return res.status(403).json({ message: 'Account deactivated' });
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    const tokenVersion = user.token_version || 0;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, isAdmin: true, isSuperadmin: !!user.is_superadmin, tokenVersion }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name, isSuperadmin: !!user.is_superadmin } });
  });

  app.post('/api/admin/logout', requireAdmin, (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' });
    res.json({ message: 'Logged out' });
  });

  // ─── Dashboard Metrics ───────────────────────────────────────────────────────
  app.get('/api/admin/metrics', requireAdmin, (req, res) => {
    const totalInterns = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1").get() as any;
    const totalApplications = db.prepare("SELECT COUNT(*) as count FROM applications").get() as any;
    const pendingApplications = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'").get() as any;
    const acceptedApplications = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'accepted'").get() as any;
    const rejectedApplications = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'").get() as any;
    const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get() as any;
    const openProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'open'").get() as any;
    const unreadContacts = db.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE is_read = 0").get() as any;
    const totalTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'completed'").get() as any;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as any;
    const recentApplications = db.prepare("SELECT u.name, u.email, a.status, a.applied_at as created_at FROM applications a JOIN users u ON a.student_id = u.id ORDER BY a.applied_at DESC LIMIT 5").all();
    res.json({ totalInterns: totalInterns.count, totalApplications: totalApplications.count, pendingApplications: pendingApplications.count, acceptedApplications: acceptedApplications.count, rejectedApplications: rejectedApplications.count, totalProjects: totalProjects.count, openProjects: openProjects.count, unreadContacts: unreadContacts.count, totalTasks: totalTasks.count, completedTasks: completedTasks.count, recentApplications });
  });

  // ─── Admin Users (Team Management) ──────────────────────────────────────────
  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const admins = db.prepare("SELECT id, email, name, role, is_superadmin, is_active, created_at, last_login FROM users WHERE role = 'admin' OR role = 'superadmin' OR is_superadmin = 1").all();
    res.json(admins);
  });

  app.post('/api/admin/users', requireSuperadmin, async (req, res) => {
    const { email, name, password, isSuperadmin } = req.body;
    if (!email || !name || !password) return res.status(400).json({ message: 'Email, name, and password required' });
    const id = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 12);
    try {
      db.prepare("INSERT INTO users (id, email, password, name, role, is_superadmin, is_active) VALUES (?, ?, ?, ?, 'admin', ?, 1)").run(id, email, hashed, name, isSuperadmin ? 1 : 0);
      const adminId = (req as any).user.id;
      db.prepare("INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, 'created_admin', 'user', ?, ?, ?)").run(crypto.randomUUID(), adminId, id, JSON.stringify({ email, name }), req.ip);
      res.status(201).json({ id, message: 'Admin created' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const { name, email, is_active, is_superadmin, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.params.id);
    if (email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, req.params.id);
    if (is_active !== undefined) {
      db.prepare('UPDATE users SET is_active = ?, token_version = token_version + 1 WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
    }
    if (is_superadmin !== undefined && (req as any).user.isSuperadmin) db.prepare('UPDATE users SET is_superadmin = ? WHERE id = ?').run(is_superadmin ? 1 : 0, req.params.id);
    if (password) { const hashed = await bcrypt.hash(password, 12); db.prepare('UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?').run(hashed, req.params.id); }
    res.json({ message: 'User updated' });
  });

  app.delete('/api/admin/users/:id', requireSuperadmin, (req, res) => {
    db.prepare('UPDATE users SET is_active = 0, token_version = token_version + 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deactivated' });
  });

  // ─── Intern Management ───────────────────────────────────────────────────────
  app.get('/api/admin/interns', requireAdmin, (req, res) => {
    const { search, status, page = '1', limit = '20' } = req.query as any;
    let query = `SELECT u.id, u.email, u.name, u.created_at, u.last_login, u.is_active, sp.university, sp.major, sp.year FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student'`;
    const params: any[] = [];
    if (search) { query += ` AND (u.name LIKE ? OR u.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (status === 'active') query += ` AND u.is_active = 1`;
    if (status === 'inactive') query += ` AND u.is_active = 0`;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const countQuery = query.replace('SELECT u.id, u.email, u.name, u.created_at, u.last_login, u.is_active, sp.university, sp.major, sp.year', 'SELECT COUNT(*) as count');
    const total = (db.prepare(countQuery).get(...params) as any)?.count || 0;
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    const interns = db.prepare(query).all(...params);
    res.json({ data: interns, total, page: parseInt(page), limit: parseInt(limit) });
  });

  app.get('/api/admin/interns/:id', requireAdmin, (req, res) => {
    const intern = db.prepare(`SELECT u.*, sp.* FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ? AND u.role = 'student'`).get(req.params.id) as any;
    if (!intern) return res.status(404).json({ message: 'Not found' });
    intern.skills = JSON.parse(intern.skills || '[]');
    intern.badges_earned = JSON.parse(intern.badges_earned || '[]');
    const tasks = db.prepare('SELECT * FROM tasks WHERE assigned_to = ? ORDER BY created_at DESC').all(req.params.id);
    const applications = db.prepare('SELECT a.*, p.title as project_title FROM applications a LEFT JOIN projects p ON a.project_id = p.id WHERE a.student_id = ?').all(req.params.id);
    res.json({ ...intern, tasks, applications });
  });

  app.patch('/api/admin/interns/:id', requireAdmin, (req, res) => {
    const { is_active } = req.body;
    if (is_active !== undefined) db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
    res.json({ message: 'Updated' });
  });

  // ─── Task Management ─────────────────────────────────────────────────────────
  app.get('/api/admin/tasks', requireAdmin, (req, res) => {
    const { status, assignee, priority, page = '1', limit = '50' } = req.query as any;
    let query = `SELECT t.*, u.name as assignee_name, c.name as creator_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN users c ON t.created_by = c.id WHERE 1=1`;
    const params: any[] = [];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (assignee) { query += ' AND t.assigned_to = ?'; params.push(assignee); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const total = (db.prepare(query.replace('SELECT t.*, u.name as assignee_name, c.name as creator_name', 'SELECT COUNT(*) as count')).get(...params) as any)?.count || 0;
    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    const tasks = db.prepare(query).all(...params).map((t: any) => ({ ...t, tags: JSON.parse(t.tags || '[]') }));
    res.json({ data: tasks, total, page: parseInt(page), limit: parseInt(limit) });
  });

  app.post('/api/admin/tasks', requireAdmin, (req, res) => {
    const { title, description, assigned_to, project_id, priority, due_date, estimated_hours, tags } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
    const id = crypto.randomUUID();
    const createdBy = (req as any).user.id;
    db.prepare(`INSERT INTO tasks (id, title, description, assigned_to, project_id, created_by, priority, due_date, estimated_hours, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, title, description, assigned_to || null, project_id || null, createdBy, priority || 'medium', due_date || null, estimated_hours || null, JSON.stringify(tags || []));
    db.prepare(`INSERT INTO task_activity_log (id, task_id, user_id, action, new_value) VALUES (?, ?, ?, 'created', ?)`).run(crypto.randomUUID(), id, createdBy, title);
    res.status(201).json({ id, message: 'Task created' });
  });

  app.get('/api/admin/tasks/:id', requireAdmin, (req, res) => {
    const task = db.prepare(`SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = ?`).get(req.params.id) as any;
    if (!task) return res.status(404).json({ message: 'Not found' });
    task.tags = JSON.parse(task.tags || '[]');
    const comments = db.prepare(`SELECT tc.*, u.name as author_name FROM task_comments tc JOIN users u ON tc.user_id = u.id WHERE tc.task_id = ? ORDER BY tc.created_at ASC`).all(req.params.id);
    const activity = db.prepare(`SELECT tal.*, u.name as actor_name FROM task_activity_log tal JOIN users u ON tal.user_id = u.id WHERE tal.task_id = ? ORDER BY tal.created_at DESC LIMIT 20`).all(req.params.id);
    res.json({ ...task, comments, activity });
  });

  app.patch('/api/admin/tasks/:id', requireAdmin, (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
    if (!task) return res.status(404).json({ message: 'Not found' });
    const { title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, tags } = req.body;
    const userId = (req as any).user.id;
    if (status && status !== task.status) {
      db.prepare(`INSERT INTO task_activity_log (id, task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, 'status_changed', ?, ?)`).run(crypto.randomUUID(), req.params.id, userId, task.status, status);
    }
    if (assigned_to !== undefined && assigned_to !== task.assigned_to) {
      db.prepare(`INSERT INTO task_activity_log (id, task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, 'assigned', ?, ?)`).run(crypto.randomUUID(), req.params.id, userId, task.assigned_to, assigned_to);
    }
    db.prepare(`UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status), priority = COALESCE(?, priority), assigned_to = COALESCE(?, assigned_to), due_date = COALESCE(?, due_date), estimated_hours = COALESCE(?, estimated_hours), actual_hours = COALESCE(?, actual_hours), tags = COALESCE(?, tags), updated_at = CURRENT_TIMESTAMP, completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?`).run(title || null, description || null, status || null, priority || null, assigned_to !== undefined ? assigned_to : null, due_date !== undefined ? due_date : null, estimated_hours || null, actual_hours || null, tags ? JSON.stringify(tags) : null, status || null, req.params.id);
    res.json({ message: 'Updated' });
  });

  app.delete('/api/admin/tasks/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Deleted' });
  });

  app.post('/api/admin/tasks/:id/comments', requireAdmin, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });
    const id = crypto.randomUUID();
    const userId = (req as any).user.id;
    db.prepare('INSERT INTO task_comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)').run(id, req.params.id, userId, content);
    db.prepare(`INSERT INTO task_activity_log (id, task_id, user_id, action) VALUES (?, ?, ?, 'commented')`).run(crypto.randomUUID(), req.params.id, userId);
    res.status(201).json({ id });
  });

  // Intern task view (student-facing)
  app.get('/api/tasks/mine', authenticate, (req: any, res: any) => {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
    const tasks = db.prepare(`SELECT t.*, u.name as creator_name FROM tasks t LEFT JOIN users u ON t.created_by = u.id WHERE t.assigned_to = ? ORDER BY t.created_at DESC`).all(req.user.id).map((t: any) => ({ ...t, tags: JSON.parse(t.tags || '[]') }));
    res.json(tasks);
  });

  app.patch('/api/tasks/:id', authenticate, (req: any, res: any) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
    if (!task) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'student') {
      if (task.assigned_to !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
      const { status, actual_hours } = req.body;
      if (status && !['in_progress', 'in_review'].includes(status)) return res.status(400).json({ message: 'Students can only set in_progress or in_review' });
      if (status) db.prepare('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
      if (actual_hours !== undefined) db.prepare('UPDATE tasks SET actual_hours = ? WHERE id = ?').run(actual_hours, req.params.id);
    }
    res.json({ message: 'Updated' });
  });

  app.post('/api/tasks/:id/comments', authenticate, (req: any, res: any) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
    if (!task) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'student' && task.assigned_to !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const { content } = req.body;
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO task_comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)').run(id, req.params.id, req.user.id, content);
    res.status(201).json({ id });
  });

  // ─── Cohorts ─────────────────────────────────────────────────────────────────
  app.get('/api/admin/cohorts', requireAdmin, (req, res) => {
    const cohorts = db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM cohort_members cm WHERE cm.cohort_id = c.id AND cm.status = 'active') as member_count FROM cohorts c ORDER BY c.created_at DESC`).all();
    res.json(cohorts);
  });

  app.post('/api/admin/cohorts', requireAdmin, (req, res) => {
    const { name, start_date, end_date, max_capacity, fee_amount } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO cohorts (id, name, start_date, end_date, max_capacity, fee_amount) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, start_date || null, end_date || null, max_capacity || 10, fee_amount || null);
    res.status(201).json({ id });
  });

  app.patch('/api/admin/cohorts/:id', requireAdmin, (req, res) => {
    const { name, status, start_date, end_date, max_capacity, fee_amount } = req.body;
    db.prepare('UPDATE cohorts SET name = COALESCE(?, name), status = COALESCE(?, status), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), max_capacity = COALESCE(?, max_capacity), fee_amount = COALESCE(?, fee_amount) WHERE id = ?').run(name || null, status || null, start_date || null, end_date || null, max_capacity || null, fee_amount || null, req.params.id);
    res.json({ message: 'Updated' });
  });

  app.get('/api/admin/cohorts/:id', requireAdmin, (req, res) => {
    const cohort = db.prepare('SELECT * FROM cohorts WHERE id = ?').get(req.params.id) as any;
    if (!cohort) return res.status(404).json({ message: 'Not found' });
    const members = db.prepare(`SELECT cm.*, u.name, u.email FROM cohort_members cm JOIN users u ON cm.user_id = u.id WHERE cm.cohort_id = ?`).all(req.params.id);
    res.json({ ...cohort, members });
  });

  app.post('/api/admin/cohorts/:id/members', requireAdmin, (req, res) => {
    const { user_id } = req.body;
    try {
      db.prepare('INSERT INTO cohort_members (cohort_id, user_id) VALUES (?, ?)').run(req.params.id, user_id);
      res.status(201).json({ message: 'Member added' });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  // ─── Communications ───────────────────────────────────────────────────────────
  app.get('/api/admin/contacts', requireAdmin, (req, res) => {
    const contacts = db.prepare('SELECT * FROM contact_submissions ORDER BY submitted_at DESC').all();
    res.json(contacts);
  });

  app.patch('/api/admin/contacts/:id', requireAdmin, (req, res) => {
    const { is_read, is_archived } = req.body;
    if (is_read !== undefined) db.prepare('UPDATE contact_submissions SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, req.params.id);
    if (is_archived !== undefined) db.prepare('UPDATE contact_submissions SET is_archived = ? WHERE id = ?').run(is_archived ? 1 : 0, req.params.id);
    res.json({ message: 'Updated' });
  });

  app.get('/api/admin/announcements', requireAdmin, (req, res) => {
    const announcements = db.prepare('SELECT a.*, u.name as creator_name FROM announcements a JOIN users u ON a.created_by = u.id ORDER BY a.is_pinned DESC, a.created_at DESC').all();
    res.json(announcements);
  });

  app.post('/api/admin/announcements', requireAdmin, (req, res) => {
    const { title, content, is_pinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO announcements (id, title, content, created_by, is_pinned) VALUES (?, ?, ?, ?, ?)').run(id, title, content, (req as any).user.id, is_pinned ? 1 : 0);
    res.status(201).json({ id });
  });

  app.get('/api/announcements', authenticate, (req, res) => {
    const announcements = db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC LIMIT 10').all();
    res.json(announcements);
  });

  // ─── Analytics ────────────────────────────────────────────────────────────────
  app.get('/api/admin/analytics', requireAdmin, (req, res) => {
    const tasksByStatus = db.prepare("SELECT status, COUNT(*) as count FROM tasks GROUP BY status").all();
    const tasksByPriority = db.prepare("SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority").all();
    const internActivity = db.prepare("SELECT u.name, COUNT(t.id) as task_count, SUM(CASE WHEN t.status='completed' THEN 1 ELSE 0 END) as completed FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id WHERE u.role = 'student' GROUP BY u.id ORDER BY task_count DESC LIMIT 10").all();
    const overdueTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status NOT IN ('completed','blocked')").get() as any;
    res.json({ tasksByStatus, tasksByPriority, internActivity, overdueTasks: overdueTasks.count });
  });

  // ─── Projects (admin) ─────────────────────────────────────────────────────────
  app.get('/api/admin/projects', requireAdmin, (req, res) => {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all().map((p: any) => ({ ...p, skills_required: JSON.parse(p.skills_required || '[]') }));
    res.json(projects);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
