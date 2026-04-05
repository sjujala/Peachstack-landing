import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "peachstack-super-secret-key";
const PORT = 3000;

// Resend setup
const resend = new Resend("re_Vsnfvc7g_3Dj1Zzne7kKdDit2Mm7orzxF");

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
`);

try {
  db.prepare("ALTER TABLE student_onboarding ADD COLUMN why_opportunity TEXT").run();
} catch (e) {
  // Column already exists
}

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
    `).run(university, major, minor, year, JSON.stringify(skills), bio, profile_picture_url, req.params.id);
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
