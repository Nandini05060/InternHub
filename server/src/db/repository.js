import { getDbPool, isDbConnected } from './mysql.js';
import { getInitialData } from './mockData.js';

// In-memory persistent state (fallback or test runner)
const store = getInitialData();
let nextUserId = 10;
let nextProfileId = 10;
let nextInternshipId = 20;
let nextAppId = 20;
let nextSavedId = 20;
let nextNotifId = 20;
let nextResumeId = 20;
let nextAnalysisId = 20;
let nextTaskId = 30;
let nextCertId = 20;
let nextPracticeId = 20;
let nextVaultDocId = 20;


// ==========================================
// User & Profile Functions
// ==========================================
export async function findUserByEmail(email) {
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return rows[0] || null;
  }
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export async function findUserById(id) {
  const numericId = parseInt(id, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT id, name, email, role, is_blocked, created_at FROM users WHERE id = ?', [numericId]);
    return rows[0] || null;
  }
  const u = store.users.find(user => user.id === numericId);
  if (!u) return null;
  const { password, ...safeUser } = u;
  return safeUser;
}

export async function createUser({ name, email, password, role = 'student' }) {
  const normalizedEmail = email.toLowerCase().trim();
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, password, role]
    );
    const newId = result.insertId;
    if (role === 'student') {
      await pool.query(
        'INSERT INTO student_profiles (user_id, university, degree, graduation_year, skills) VALUES (?, ?, ?, ?, ?)',
        [newId, 'University Institute of Technology', 'Bachelor of Engineering', 2026, '']
      );
    }
    return { id: newId, name: name.trim(), email: normalizedEmail, role, is_blocked: false };
  }

    const newUser = {
    id: nextUserId++,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    is_blocked: false,
    failed_login_attempts: 0,
    lockout_until: null,
    created_at: new Date().toISOString()
  };
  store.users.push(newUser);

  if (role === 'student') {
    store.profiles.push({
      id: nextProfileId++,
      user_id: newUser.id,
      university: 'University Institute of Technology',
      degree: 'Bachelor of Engineering',
      graduation_year: 2026,
      skills: '',
      resume_url: '',
      github_url: '',
      linkedin_url: '',
      bio: ''
    });
  }

  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

export async function recordFailedLogin(email, mockTime = null) {
  const normalizedEmail = email.toLowerCase().trim();
  const baseTime = mockTime ? new Date(mockTime).getTime() : Date.now();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) return null;

    const attempts = (user.failed_login_attempts || 0) + 1;
    let lockoutUntil = null;
    if (attempts >= 5) {
      lockoutUntil = new Date(baseTime + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    }

    await pool.query(
      'UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?',
      [attempts, lockoutUntil, user.id]
    );
    return { ...user, failed_login_attempts: attempts, lockout_until: lockoutUntil };
  }

  const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;

  user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
  if (user.failed_login_attempts >= 5) {
    user.lockout_until = new Date(baseTime + 15 * 60 * 1000).toISOString();
  }
  return { ...user };
}

export async function resetFailedLogin(email) {
  const normalizedEmail = email.toLowerCase().trim();
  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE email = ?',
      [normalizedEmail]
    );
    return true;
  }
  const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (user) {
    user.failed_login_attempts = 0;
    user.lockout_until = null;
    return true;
  }
  return false;
}

export async function clearAllLockouts() {
  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('UPDATE users SET failed_login_attempts = 0, lockout_until = NULL');
  }
  store.users.forEach(u => {
    u.failed_login_attempts = 0;
    u.lockout_until = null;
  });
  return true;
}

export async function updateUserPassword(email, newHashedPassword) {
  const normalizedEmail = email.toLowerCase().trim();
  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [newHashedPassword, normalizedEmail]);
    return true;
  }
  const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (user) {
    user.password = newHashedPassword;
    return true;
  }
  return false;
}

export async function getAllStudents() {
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.is_blocked, u.created_at,
             p.university, p.degree, p.graduation_year, p.skills, p.resume_url,
             (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id) as total_applications,
             (SELECT COUNT(*) FROM saved_internships s WHERE s.user_id = u.id) as saved_count
      FROM users u
      LEFT JOIN student_profiles p ON u.id = p.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);
    return rows;
  }

  return store.users
    .filter(u => u.role === 'student')
    .map(u => {
      const p = store.profiles.find(prof => prof.user_id === u.id) || {};
      const total_applications = store.applications.filter(a => a.user_id === u.id).length;
      const saved_count = store.savedInternships.filter(s => s.user_id === u.id).length;
      const { password, ...safe } = u;
      return {
        ...safe,
        ...p,
        total_applications,
        saved_count
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function toggleBlockUser(id, isBlocked) {
  const numericId = parseInt(id, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('UPDATE users SET is_blocked = ? WHERE id = ?', [isBlocked, numericId]);
    return { success: true, id: numericId, is_blocked: isBlocked };
  }
  const user = store.users.find(u => u.id === numericId);
  if (user) {
    user.is_blocked = isBlocked;
    return { success: true, id: numericId, is_blocked: isBlocked };
  }
  return null;
}

export async function getStudentProfile(userId) {
  const numericId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(`
      SELECT p.*, u.name, u.email, u.role
      FROM users u
      LEFT JOIN student_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [numericId]);
    return rows[0] || null;
  }
  const user = store.users.find(u => u.id === numericId);
  if (!user) return null;
  const profile = store.profiles.find(p => p.user_id === numericId) || {};
  return {
    ...profile,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function upsertStudentProfile(userId, profileData) {
  const numericId = parseInt(userId, 10);
  const { name, university, degree, graduation_year, skills, resume_url, github_url, linkedin_url, bio } = profileData;

  if (isDbConnected()) {
    const pool = await getDbPool();
    if (name) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), numericId]);
    }
    await pool.query(`
      INSERT INTO student_profiles (user_id, university, degree, graduation_year, skills, resume_url, github_url, linkedin_url, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        university = VALUES(university),
        degree = VALUES(degree),
        graduation_year = VALUES(graduation_year),
        skills = VALUES(skills),
        resume_url = VALUES(resume_url),
        github_url = VALUES(github_url),
        linkedin_url = VALUES(linkedin_url),
        bio = VALUES(bio)
    `, [numericId, university, degree, graduation_year, skills, resume_url, github_url, linkedin_url, bio]);
    return getStudentProfile(numericId);
  }

  const user = store.users.find(u => u.id === numericId);
  if (user && name) user.name = name.trim();

  let p = store.profiles.find(prof => prof.user_id === numericId);
  if (!p) {
    p = { id: nextProfileId++, user_id: numericId };
    store.profiles.push(p);
  }
  p.university = university !== undefined ? university : p.university;
  p.degree = degree !== undefined ? degree : p.degree;
  p.graduation_year = graduation_year !== undefined ? parseInt(graduation_year, 10) : p.graduation_year;
  p.skills = skills !== undefined ? skills : p.skills;
  p.resume_url = resume_url !== undefined ? resume_url : p.resume_url;
  p.github_url = github_url !== undefined ? github_url : p.github_url;
  p.linkedin_url = linkedin_url !== undefined ? linkedin_url : p.linkedin_url;
  p.bio = bio !== undefined ? bio : p.bio;

  return getStudentProfile(numericId);
}

// ==========================================
// Internship Listing Functions
// ==========================================
export async function getInternships({ search, category, workType, status, isExpired, sort = 'newest', userId = null }) {
  if (isDbConnected()) {
    const pool = await getDbPool();
    let query = `
      SELECT i.*, 
        (SELECT COUNT(*) FROM applications a WHERE a.internship_id = i.id) as total_applicants,
        ${userId ? `(SELECT COUNT(*) > 0 FROM saved_internships s WHERE s.internship_id = i.id AND s.user_id = ?) as is_saved,` : '0 as is_saved,'}
        ${userId ? `(SELECT status FROM applications a WHERE a.internship_id = i.id AND a.user_id = ? LIMIT 1) as application_status` : 'NULL as application_status'}
      FROM internships i
      WHERE 1=1
    `;
    const params = [];
    if (userId) {
      params.push(userId, userId);
    }

    if (search) {
      query += ` AND (i.title LIKE ? OR i.company_name LIKE ? OR i.description LIKE ? OR i.requirements LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (category && category !== 'All') {
      query += ` AND i.category = ?`;
      params.push(category);
    }
    if (workType && workType !== 'All') {
      query += ` AND i.work_type = ?`;
      params.push(workType);
    }
    if (status) {
      query += ` AND i.verification_status = ?`;
      params.push(status);
    }
    if (isExpired !== undefined && isExpired !== null && isExpired !== '') {
      query += ` AND i.is_expired = ?`;
      params.push(isExpired === 'true' || isExpired === true ? 1 : 0);
    }

    if (sort === 'deadline') {
      query += ` ORDER BY i.deadline ASC`;
    } else if (sort === 'oldest') {
      query += ` ORDER BY i.created_at ASC`;
    } else {
      query += ` ORDER BY i.created_at DESC`;
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // In-memory fallback
  let list = [...store.internships];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.company_name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.requirements.toLowerCase().includes(q)
    );
  }
  if (category && category !== 'All') {
    list = list.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (workType && workType !== 'All') {
    list = list.filter(i => i.work_type.toLowerCase() === workType.toLowerCase());
  }
  if (status) {
    list = list.filter(i => i.verification_status.toLowerCase() === status.toLowerCase());
  }
  if (isExpired !== undefined && isExpired !== null && isExpired !== '') {
    const expiredBool = isExpired === 'true' || isExpired === true;
    list = list.filter(i => !!i.is_expired === expiredBool);
  }

  // Annotate saved & application status
  const numericUserId = userId ? parseInt(userId, 10) : null;
  const result = list.map(item => {
    const total_applicants = store.applications.filter(a => a.internship_id === item.id).length;
    const is_saved = numericUserId
      ? store.savedInternships.some(s => s.user_id === numericUserId && s.internship_id === item.id)
      : false;
    const userApp = numericUserId
      ? store.applications.find(a => a.user_id === numericUserId && a.internship_id === item.id)
      : null;

    return {
      ...item,
      total_applicants,
      is_saved: is_saved ? 1 : 0,
      application_status: userApp ? userApp.status : null
    };
  });

  if (sort === 'deadline') {
    result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return result;
}

export async function getInternshipById(id, userId = null) {
  const numericId = parseInt(id, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const query = `
      SELECT i.*, 
        (SELECT COUNT(*) FROM applications a WHERE a.internship_id = i.id) as total_applicants,
        ${userId ? `(SELECT COUNT(*) > 0 FROM saved_internships s WHERE s.internship_id = i.id AND s.user_id = ?) as is_saved,` : '0 as is_saved,'}
        ${userId ? `(SELECT status FROM applications a WHERE a.internship_id = i.id AND a.user_id = ? LIMIT 1) as application_status` : 'NULL as application_status'}
      FROM internships i
      WHERE i.id = ?
    `;
    const params = userId ? [userId, userId, numericId] : [numericId];
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  }

  const item = store.internships.find(i => i.id === numericId);
  if (!item) return null;

  const numericUserId = userId ? parseInt(userId, 10) : null;
  const total_applicants = store.applications.filter(a => a.internship_id === item.id).length;
  const is_saved = numericUserId
    ? store.savedInternships.some(s => s.user_id === numericUserId && s.internship_id === item.id)
    : false;
  const userApp = numericUserId
    ? store.applications.find(a => a.user_id === numericUserId && a.internship_id === item.id)
    : null;

  return {
    ...item,
    total_applicants,
    is_saved: is_saved ? 1 : 0,
    application_status: userApp ? userApp.status : null
  };
}

export async function createInternship(data, postedBy = 1) {
  const {
    title,
    company_name,
    company_logo,
    location,
    work_type = 'remote',
    category,
    stipend,
    duration,
    application_link,
    deadline,
    description,
    requirements,
    perks = '',
    verification_status = 'verified'
  } = data;

  const defaultLogo = company_logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop';

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [result] = await pool.query(`
      INSERT INTO internships 
      (title, company_name, company_logo, location, work_type, category, stipend, duration, application_link, deadline, description, requirements, perks, verification_status, is_expired, posted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `, [title, company_name, defaultLogo, location, work_type, category, stipend, duration, application_link, deadline, description, requirements, perks, verification_status, postedBy]);
    return getInternshipById(result.insertId);
  }

  const newItem = {
    id: nextInternshipId++,
    title,
    company_name,
    company_logo: defaultLogo,
    location,
    work_type,
    category,
    stipend,
    duration,
    application_link,
    deadline,
    description,
    requirements,
    perks,
    verification_status,
    is_expired: false,
    posted_by: postedBy,
    created_at: new Date().toISOString()
  };
  store.internships.unshift(newItem);
  return newItem;
}

export async function updateInternship(id, data) {
  const numericId = parseInt(id, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const fields = [];
    const values = [];

    const allowed = [
      'title', 'company_name', 'company_logo', 'location', 'work_type',
      'category', 'stipend', 'duration', 'application_link', 'deadline',
      'description', 'requirements', 'perks', 'verification_status', 'is_expired'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length > 0) {
      values.push(numericId);
      await pool.query(`UPDATE internships SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return getInternshipById(numericId);
  }

  const item = store.internships.find(i => i.id === numericId);
  if (!item) return null;
  Object.assign(item, data);
  return item;
}

export async function deleteInternship(id) {
  const numericId = parseInt(id, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('DELETE FROM internships WHERE id = ?', [numericId]);
    return { success: true, id: numericId };
  }
  const idx = store.internships.findIndex(i => i.id === numericId);
  if (idx !== -1) {
    store.internships.splice(idx, 1);
    store.savedInternships = store.savedInternships.filter(s => s.internship_id !== numericId);
    store.applications = store.applications.filter(a => a.internship_id !== numericId);
    return { success: true, id: numericId };
  }
  return { success: false, message: 'Internship not found' };
}

export async function verifyInternship(id, status = 'verified') {
  return updateInternship(id, { verification_status: status });
}

export async function toggleExpiredInternship(id, isExpired) {
  return updateInternship(id, { is_expired: isExpired });
}

// ==========================================
// Saved Internships (Bookmarks)
// ==========================================
export async function getSavedInternships(userId) {
  const numericUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(`
      SELECT i.*, s.saved_at, 1 as is_saved,
        (SELECT status FROM applications a WHERE a.internship_id = i.id AND a.user_id = ?) as application_status
      FROM saved_internships s
      JOIN internships i ON s.internship_id = i.id
      WHERE s.user_id = ?
      ORDER BY s.saved_at DESC
    `, [numericUserId, numericUserId]);
    return rows;
  }

  const userSaved = store.savedInternships.filter(s => s.user_id === numericUserId);
  return userSaved.map(s => {
    const i = store.internships.find(item => item.id === s.internship_id);
    const app = store.applications.find(a => a.internship_id === s.internship_id && a.user_id === numericUserId);
    return {
      ...i,
      saved_at: s.saved_at,
      is_saved: 1,
      application_status: app ? app.status : null
    };
  }).filter(Boolean);
}

export async function saveInternship(userId, internshipId) {
  const numericUserId = parseInt(userId, 10);
  const numericInternshipId = parseInt(internshipId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query(`
      INSERT INTO saved_internships (user_id, internship_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE saved_at = CURRENT_TIMESTAMP
    `, [numericUserId, numericInternshipId]);
    return { success: true, saved: true };
  }

  const exists = store.savedInternships.some(
    s => s.user_id === numericUserId && s.internship_id === numericInternshipId
  );
  if (!exists) {
    store.savedInternships.push({
      id: nextSavedId++,
      user_id: numericUserId,
      internship_id: numericInternshipId,
      saved_at: new Date().toISOString()
    });
  }
  return { success: true, saved: true };
}

export async function unsaveInternship(userId, internshipId) {
  const numericUserId = parseInt(userId, 10);
  const numericInternshipId = parseInt(internshipId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('DELETE FROM saved_internships WHERE user_id = ? AND internship_id = ?', [numericUserId, numericInternshipId]);
    return { success: true, saved: false };
  }

  store.savedInternships = store.savedInternships.filter(
    s => !(s.user_id === numericUserId && s.internship_id === numericInternshipId)
  );
  return { success: true, saved: false };
}

// ==========================================
// Application Tracker Functions
// ==========================================
export async function getStudentApplications(userId) {
  const numericUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(`
      SELECT a.*, 
        i.title, i.company_name, i.company_logo, i.location, i.work_type, 
        i.category, i.stipend, i.deadline, i.application_link, i.is_expired
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [numericUserId]);
    return rows;
  }

  return store.applications
    .filter(a => a.user_id === numericUserId)
    .map(a => {
      const i = store.internships.find(item => item.id === a.internship_id) || {};
      return {
        ...a,
        title: i.title,
        company_name: i.company_name,
        company_logo: i.company_logo,
        location: i.location,
        work_type: i.work_type,
        category: i.category,
        stipend: i.stipend,
        deadline: i.deadline,
        application_link: i.application_link,
        is_expired: i.is_expired
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function applyOrTrack(userId, internshipId, status = 'Applied', appliedDate = null, notes = '') {
  const numericUserId = parseInt(userId, 10);
  const numericInternshipId = parseInt(internshipId, 10);
  const appDate = appliedDate || new Date().toISOString().split('T')[0];

  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query(`
      INSERT INTO applications (user_id, internship_id, status, applied_date, notes)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        applied_date = VALUES(applied_date),
        notes = VALUES(notes),
        updated_at = CURRENT_TIMESTAMP
    `, [numericUserId, numericInternshipId, status, appDate, notes]);

    const [rows] = await pool.query(`
      SELECT a.*, i.title, i.company_name, i.company_logo
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE a.user_id = ? AND a.internship_id = ?
    `, [numericUserId, numericInternshipId]);
    return rows[0];
  }

  let app = store.applications.find(
    a => a.user_id === numericUserId && a.internship_id === numericInternshipId
  );
  if (app) {
    app.status = status;
    app.applied_date = appDate;
    app.notes = notes;
    app.updated_at = new Date().toISOString();
  } else {
    app = {
      id: nextAppId++,
      user_id: numericUserId,
      internship_id: numericInternshipId,
      status,
      applied_date: appDate,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.applications.push(app);
  }

  const i = store.internships.find(item => item.id === numericInternshipId) || {};
  return {
    ...app,
    title: i.title,
    company_name: i.company_name,
    company_logo: i.company_logo
  };
}

export async function updateApplicationStatus(userId, internshipId, status, notes) {
  return applyOrTrack(userId, internshipId, status, null, notes);
}

export async function getApplicationStats(userId) {
  const numericUserId = parseInt(userId, 10);
  const apps = await getStudentApplications(numericUserId);
  const saved = await getSavedInternships(numericUserId);

  const stats = {
    totalApplications: apps.length,
    savedCount: saved.length,
    inReview: apps.filter(a => a.status === 'In Review').length,
    interviewing: apps.filter(a => a.status === 'Interviewing').length,
    offered: apps.filter(a => a.status === 'Offered').length,
    rejected: apps.filter(a => a.status === 'Rejected').length
  };
  return stats;
}

// ==========================================
// Notifications Functions
// ==========================================
export async function getUserNotifications(userId) {
  const numericUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [numericUserId]);
    return rows;
  }

  return store.notifications
    .filter(n => n.user_id === numericUserId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function markNotificationRead(notificationId, userId) {
  const notifId = parseInt(notificationId, 10);
  const numericUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notifId, numericUserId]);
    return { success: true };
  }

  const notif = store.notifications.find(n => n.id === notifId && n.user_id === numericUserId);
  if (notif) notif.is_read = true;
  return { success: true };
}

export async function markAllNotificationsRead(userId) {
  const numericUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [numericUserId]);
    return { success: true };
  }
  store.notifications.filter(n => n.user_id === numericUserId).forEach(n => { n.is_read = true; });
  return { success: true };
}

export async function createNotification({ userId, title, message, type = 'system', link = '' }) {
  const numericUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [result] = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read, link)
      VALUES (?, ?, ?, ?, 0, ?)
    `, [numericUserId, title, message, type, link]);
    return { id: result.insertId, user_id: numericUserId, title, message, type, is_read: false, link };
  }

  const newNotif = {
    id: nextNotifId++,
    user_id: numericUserId,
    title,
    message,
    type,
    is_read: false,
    link,
    created_at: new Date().toISOString()
  };
  store.notifications.unshift(newNotif);
  return newNotif;
}

// ==========================================
// Admin Overview Metrics
// ==========================================
export async function getAdminStats() {
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [[internshipStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_internships,
        SUM(CASE WHEN verification_status = 'verified' AND is_expired = 0 THEN 1 ELSE 0 END) as active_verified,
        SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending_verification,
        SUM(CASE WHEN is_expired = 1 THEN 1 ELSE 0 END) as expired_listings
      FROM internships
    `);

    const [[userStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN is_blocked = 1 THEN 1 ELSE 0 END) as blocked_students
      FROM users WHERE role = 'student'
    `);

    const [[appStats]] = await pool.query(`
      SELECT COUNT(*) as total_applications_tracked FROM applications
    `);

    return {
      totalInternships: internshipStats.total_internships || 0,
      activeVerified: internshipStats.active_verified || 0,
      pendingVerification: internshipStats.pending_verification || 0,
      expiredListings: internshipStats.expired_listings || 0,
      totalStudents: userStats.total_students || 0,
      blockedStudents: userStats.blocked_students || 0,
      totalApplicationsTracked: appStats.total_applications_tracked || 0
    };
  }

  return {
    totalInternships: store.internships.length,
    activeVerified: store.internships.filter(i => i.verification_status === 'verified' && !i.is_expired).length,
    pendingVerification: store.internships.filter(i => i.verification_status === 'pending').length,
    expiredListings: store.internships.filter(i => i.is_expired).length,
    totalStudents: store.users.filter(u => u.role === 'student').length,
    blockedStudents: store.users.filter(u => u.role === 'student' && u.is_blocked).length,
    totalApplicationsTracked: store.applications.length
  };
}

// ==========================================
// Career Tools: Resumes (ATS Resume Builder)
// ==========================================
export async function getResumesByUserId(userId) {
  const numericUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC',
      [numericUserId]
    );
    return rows.map(r => ({
      ...r,
      personal_info: typeof r.personal_info === 'string' ? JSON.parse(r.personal_info || '{}') : r.personal_info,
      education: typeof r.education === 'string' ? JSON.parse(r.education || '[]') : r.education,
      experience: typeof r.experience === 'string' ? JSON.parse(r.experience || '[]') : r.experience,
      projects: typeof r.projects === 'string' ? JSON.parse(r.projects || '[]') : r.projects,
      skills: typeof r.skills === 'string' ? JSON.parse(r.skills || '{}') : r.skills,
      certifications: typeof r.certifications === 'string' ? JSON.parse(r.certifications || '[]') : r.certifications,
      achievements: typeof r.achievements === 'string' ? JSON.parse(r.achievements || '[]') : r.achievements,
      extracurriculars: typeof r.extracurriculars === 'string' ? JSON.parse(r.extracurriculars || '[]') : r.extracurriculars
    }));
  }

  return (store.resumes || [])
    .filter(r => r.user_id === numericUserId)
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
}

export async function getResumeById(resumeId, userId = null) {
  const numResumeId = parseInt(resumeId, 10);
  const numUserId = userId !== null ? parseInt(userId, 10) : null;

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM resumes WHERE id = ?', [numResumeId]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    if (numUserId !== null && r.user_id !== numUserId) return null; // Ownership check

    return {
      ...r,
      personal_info: typeof r.personal_info === 'string' ? JSON.parse(r.personal_info || '{}') : r.personal_info,
      education: typeof r.education === 'string' ? JSON.parse(r.education || '[]') : r.education,
      experience: typeof r.experience === 'string' ? JSON.parse(r.experience || '[]') : r.experience,
      projects: typeof r.projects === 'string' ? JSON.parse(r.projects || '[]') : r.projects,
      skills: typeof r.skills === 'string' ? JSON.parse(r.skills || '{}') : r.skills,
      certifications: typeof r.certifications === 'string' ? JSON.parse(r.certifications || '[]') : r.certifications,
      achievements: typeof r.achievements === 'string' ? JSON.parse(r.achievements || '[]') : r.achievements,
      extracurriculars: typeof r.extracurriculars === 'string' ? JSON.parse(r.extracurriculars || '[]') : r.extracurriculars
    };
  }

  const resume = (store.resumes || []).find(r => r.id === numResumeId);
  if (!resume) return null;
  if (numUserId !== null && resume.user_id !== numUserId) return null; // Ownership check
  return JSON.parse(JSON.stringify(resume));
}

export async function createResume({
  userId,
  title,
  target_role = 'Software Developer',
  target_company = '',
  template_id = 'ats_minimal',
  personal_info = {},
  summary = '',
  education = [],
  experience = [],
  projects = [],
  skills = {},
  certifications = [],
  achievements = [],
  extracurriculars = [],
  version_status = 'draft',
  quality_score = 0
}) {
  const numUserId = parseInt(userId, 10);
  const trimmedTitle = (title || 'My ATS Resume').trim();
  const now = new Date().toISOString();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [result] = await pool.query(
      `INSERT INTO resumes 
       (user_id, title, target_role, target_company, template_id, personal_info, summary, education, experience, projects, skills, certifications, achievements, extracurriculars, version_status, quality_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        numUserId,
        trimmedTitle,
        target_role,
        target_company,
        template_id,
        JSON.stringify(personal_info),
        summary,
        JSON.stringify(education),
        JSON.stringify(experience),
        JSON.stringify(projects),
        JSON.stringify(skills),
        JSON.stringify(certifications),
        JSON.stringify(achievements),
        JSON.stringify(extracurriculars),
        version_status,
        quality_score
      ]
    );

    return getResumeById(result.insertId, numUserId);
  }

  if (!store.resumes) store.resumes = [];
  const newResume = {
    id: nextResumeId++,
    user_id: numUserId,
    title: trimmedTitle,
    target_role,
    target_company,
    template_id,
    personal_info,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
    extracurriculars,
    version_status,
    quality_score,
    created_at: now,
    updated_at: now
  };
  store.resumes.push(newResume);
  return JSON.parse(JSON.stringify(newResume));
}

export async function updateResume(resumeId, userId, updateData) {
  const numResumeId = parseInt(resumeId, 10);
  const numUserId = parseInt(userId, 10);

  const existing = await getResumeById(numResumeId, numUserId);
  if (!existing) return null; // Not found or ownership check failed

  const now = new Date().toISOString();
  const merged = {
    ...existing,
    ...updateData,
    id: numResumeId,
    user_id: numUserId,
    updated_at: now
  };

  if (isDbConnected()) {
    const pool = await getDbPool();
    await pool.query(
      `UPDATE resumes SET 
       title = ?, target_role = ?, target_company = ?, template_id = ?, personal_info = ?, summary = ?, 
       education = ?, experience = ?, projects = ?, skills = ?, certifications = ?, achievements = ?, 
       extracurriculars = ?, version_status = ?, quality_score = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        merged.title,
        merged.target_role,
        merged.target_company,
        merged.template_id,
        JSON.stringify(merged.personal_info || {}),
        merged.summary || '',
        JSON.stringify(merged.education || []),
        JSON.stringify(merged.experience || []),
        JSON.stringify(merged.projects || []),
        JSON.stringify(merged.skills || {}),
        JSON.stringify(merged.certifications || []),
        JSON.stringify(merged.achievements || []),
        JSON.stringify(merged.extracurriculars || []),
        merged.version_status || 'draft',
        merged.quality_score || 0,
        numResumeId,
        numUserId
      ]
    );
    return getResumeById(numResumeId, numUserId);
  }

  const idx = store.resumes.findIndex(r => r.id === numResumeId && r.user_id === numUserId);
  if (idx !== -1) {
    store.resumes[idx] = merged;
  }
  return JSON.parse(JSON.stringify(merged));
}

export async function duplicateResume(resumeId, userId, newTitle = null) {
  const existing = await getResumeById(resumeId, userId);
  if (!existing) return null;

  const duplicatedTitle = newTitle || `${existing.title} (Copy)`;
  return createResume({
    ...existing,
    userId,
    title: duplicatedTitle,
    version_status: 'draft'
  });
}

export async function deleteResume(resumeId, userId) {
  const numResumeId = parseInt(resumeId, 10);
  const numUserId = parseInt(userId, 10);

  const existing = await getResumeById(numResumeId, numUserId);
  if (!existing) return false;

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query('DELETE FROM resumes WHERE id = ? AND user_id = ?', [numResumeId, numUserId]);
    return res.affectedRows > 0;
  }

  const prevLen = store.resumes.length;
  store.resumes = store.resumes.filter(r => !(r.id === numResumeId && r.user_id === numUserId));
  return store.resumes.length < prevLen;
}

// ==========================================
// Career Tools: Resume Analyses
// ==========================================
export async function getAnalysesByUserId(userId) {
  const numUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(
      'SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC',
      [numUserId]
    );
    return rows.map(r => ({
      ...r,
      breakdown: typeof r.breakdown === 'string' ? JSON.parse(r.breakdown || '{}') : r.breakdown,
      skills_identified: typeof r.skills_identified === 'string' ? JSON.parse(r.skills_identified || '[]') : r.skills_identified,
      matching_keywords: typeof r.matching_keywords === 'string' ? JSON.parse(r.matching_keywords || '[]') : r.matching_keywords,
      missing_keywords: typeof r.missing_keywords === 'string' ? JSON.parse(r.missing_keywords || '[]') : r.missing_keywords,
      suggestions: typeof r.suggestions === 'string' ? JSON.parse(r.suggestions || '[]') : r.suggestions
    }));
  }

  return (store.resumeAnalyses || [])
    .filter(a => a.user_id === numUserId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function createResumeAnalysis({
  userId,
  resumeId = null,
  resumeTitle = 'Uploaded Resume',
  targetRole = 'General Candidate',
  jobDescription = '',
  score = 70,
  breakdown = {},
  skillsIdentified = [],
  matchingKeywords = [],
  missingKeywords = [],
  suggestions = [],
  extractedText = ''
}) {
  const numUserId = parseInt(userId, 10);
  const now = new Date().toISOString();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query(
      `INSERT INTO resume_analyses
       (user_id, resume_id, resume_title, target_role, job_description, score, breakdown, skills_identified, matching_keywords, missing_keywords, suggestions, extracted_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        numUserId,
        resumeId,
        resumeTitle,
        targetRole,
        jobDescription,
        score,
        JSON.stringify(breakdown),
        JSON.stringify(skillsIdentified),
        JSON.stringify(matchingKeywords),
        JSON.stringify(missingKeywords),
        JSON.stringify(suggestions),
        extractedText
      ]
    );

    const [rows] = await pool.query('SELECT * FROM resume_analyses WHERE id = ?', [res.insertId]);
    const r = rows[0];
    return {
      ...r,
      breakdown: typeof r.breakdown === 'string' ? JSON.parse(r.breakdown || '{}') : r.breakdown,
      skills_identified: typeof r.skills_identified === 'string' ? JSON.parse(r.skills_identified || '[]') : r.skills_identified,
      matching_keywords: typeof r.matching_keywords === 'string' ? JSON.parse(r.matching_keywords || '[]') : r.matching_keywords,
      missing_keywords: typeof r.missing_keywords === 'string' ? JSON.parse(r.missing_keywords || '[]') : r.missing_keywords,
      suggestions: typeof r.suggestions === 'string' ? JSON.parse(r.suggestions || '[]') : r.suggestions
    };
  }

  if (!store.resumeAnalyses) store.resumeAnalyses = [];
  const newAnalysis = {
    id: nextAnalysisId++,
    user_id: numUserId,
    resume_id: resumeId,
    resume_title: resumeTitle,
    target_role: targetRole,
    job_description: jobDescription,
    score,
    breakdown,
    skills_identified: skillsIdentified,
    matching_keywords: matchingKeywords,
    missing_keywords: missingKeywords,
    suggestions,
    extracted_text: extractedText,
    created_at: now
  };
  store.resumeAnalyses.unshift(newAnalysis);
  return JSON.parse(JSON.stringify(newAnalysis));
}

export async function deleteResumeAnalysis(analysisId, userId) {
  const numAnalysisId = parseInt(analysisId, 10);
  const numUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query('DELETE FROM resume_analyses WHERE id = ? AND user_id = ?', [numAnalysisId, numUserId]);
    return res.affectedRows > 0;
  }

  const prevLen = (store.resumeAnalyses || []).length;
  store.resumeAnalyses = (store.resumeAnalyses || []).filter(a => !(a.id === numAnalysisId && a.user_id === numUserId));
  return store.resumeAnalyses.length < prevLen;
}

// ==========================================
// Career Tools: Placement Tasks
// ==========================================
export async function getPlacementTasks(userId, filter = {}) {
  const numUserId = parseInt(userId, 10);
  let tasks = [];

  if (isDbConnected()) {
    const pool = await getDbPool();
    let query = 'SELECT * FROM placement_tasks WHERE user_id = ?';
    const params = [numUserId];
    if (filter.category && filter.category !== 'All') {
      query += ' AND category = ?';
      params.push(filter.category);
    }
    query += ' ORDER BY is_completed ASC, deadline ASC, created_at DESC';
    const [rows] = await pool.query(query, params);
    tasks = rows.map(t => ({ ...t, is_completed: Boolean(t.is_completed) }));
  } else {
    tasks = (store.placementTasks || []).filter(t => t.user_id === numUserId);
    if (filter.category && filter.category !== 'All') {
      tasks = tasks.filter(t => t.category === filter.category);
    }
    tasks.sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      return new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01');
    });
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.is_completed).length;
  const pending = total - completed;
  const now = new Date();
  const overdue = tasks.filter(t => !t.is_completed && t.deadline && new Date(t.deadline) < now).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    tasks,
    summary: {
      total,
      completed,
      pending,
      overdue,
      completionPercentage
    }
  };
}

export async function createPlacementTask({
  userId,
  category,
  title,
  description = '',
  priority = 'medium',
  deadline = null
}) {
  const numUserId = parseInt(userId, 10);
  const now = new Date().toISOString();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query(
      `INSERT INTO placement_tasks (user_id, category, title, description, priority, deadline, is_completed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
      [numUserId, category, title.trim(), description, priority, deadline]
    );
    const [rows] = await pool.query('SELECT * FROM placement_tasks WHERE id = ?', [res.insertId]);
    return { ...rows[0], is_completed: false };
  }

  if (!store.placementTasks) store.placementTasks = [];
  const newTask = {
    id: nextTaskId++,
    user_id: numUserId,
    category,
    title: title.trim(),
    description,
    priority,
    deadline,
    is_completed: false,
    completed_at: null,
    created_at: now
  };
  store.placementTasks.push(newTask);
  return JSON.parse(JSON.stringify(newTask));
}

export async function togglePlacementTask(taskId, userId) {
  const numTaskId = parseInt(taskId, 10);
  const numUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM placement_tasks WHERE id = ? AND user_id = ?', [numTaskId, numUserId]);
    if (!rows || rows.length === 0) return null;
    const task = rows[0];
    const newStatus = !task.is_completed;
    const completedAt = newStatus ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    await pool.query(
      'UPDATE placement_tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
      [newStatus ? 1 : 0, completedAt, numTaskId, numUserId]
    );

    const [updated] = await pool.query('SELECT * FROM placement_tasks WHERE id = ?', [numTaskId]);
    return { ...updated[0], is_completed: Boolean(updated[0].is_completed) };
  }

  const task = (store.placementTasks || []).find(t => t.id === numTaskId && t.user_id === numUserId);
  if (!task) return null;
  task.is_completed = !task.is_completed;
  task.completed_at = task.is_completed ? new Date().toISOString() : null;
  return JSON.parse(JSON.stringify(task));
}

export async function deletePlacementTask(taskId, userId) {
  const numTaskId = parseInt(taskId, 10);
  const numUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query('DELETE FROM placement_tasks WHERE id = ? AND user_id = ?', [numTaskId, numUserId]);
    return res.affectedRows > 0;
  }

  const prevLen = (store.placementTasks || []).length;
  store.placementTasks = (store.placementTasks || []).filter(t => !(t.id === numTaskId && t.user_id === numUserId));
  return store.placementTasks.length < prevLen;
}

// ==========================================
// Career Tools: Student Certifications & Skills
// ==========================================
export async function getStudentCertifications(userId) {
  const numUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(
      'SELECT * FROM student_certifications WHERE user_id = ? ORDER BY status ASC, created_at DESC',
      [numUserId]
    );
    return rows;
  }

  return (store.studentCertifications || []).filter(c => c.user_id === numUserId);
}

export async function createStudentCertification({
  userId,
  title,
  provider = '',
  skill_name = '',
  skill_level = 'Intermediate',
  status = 'In Progress',
  target_date = null,
  completed_date = null,
  credential_url = ''
}) {
  const numUserId = parseInt(userId, 10);
  const now = new Date().toISOString();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query(
      `INSERT INTO student_certifications 
       (user_id, title, provider, skill_name, skill_level, status, target_date, completed_date, credential_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [numUserId, title.trim(), provider, skill_name, skill_level, status, target_date, completed_date, credential_url]
    );
    const [rows] = await pool.query('SELECT * FROM student_certifications WHERE id = ?', [res.insertId]);
    return rows[0];
  }

  if (!store.studentCertifications) store.studentCertifications = [];
  const newCert = {
    id: nextCertId++,
    user_id: numUserId,
    title: title.trim(),
    provider,
    skill_name,
    skill_level,
    status,
    target_date,
    completed_date,
    credential_url,
    created_at: now
  };
  store.studentCertifications.push(newCert);
  return JSON.parse(JSON.stringify(newCert));
}

export async function updateStudentCertification(certId, userId, updates) {
  const numCertId = parseInt(certId, 10);
  const numUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM student_certifications WHERE id = ? AND user_id = ?', [numCertId, numUserId]);
    if (!rows || rows.length === 0) return null;
    const current = rows[0];
    const merged = { ...current, ...updates };

    await pool.query(
      `UPDATE student_certifications SET 
       title = ?, provider = ?, skill_name = ?, skill_level = ?, status = ?, target_date = ?, completed_date = ?, credential_url = ?
       WHERE id = ? AND user_id = ?`,
      [
        merged.title,
        merged.provider,
        merged.skill_name,
        merged.skill_level,
        merged.status,
        merged.target_date,
        merged.completed_date,
        merged.credential_url,
        numCertId,
        numUserId
      ]
    );

    const [updated] = await pool.query('SELECT * FROM student_certifications WHERE id = ?', [numCertId]);
    return updated[0];
  }

  const cert = (store.studentCertifications || []).find(c => c.id === numCertId && c.user_id === numUserId);
  if (!cert) return null;
  Object.assign(cert, updates);
  return JSON.parse(JSON.stringify(cert));
}

export async function deleteStudentCertification(certId, userId) {
  const numCertId = parseInt(certId, 10);
  const numUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query('DELETE FROM student_certifications WHERE id = ? AND user_id = ?', [numCertId, numUserId]);
    return res.affectedRows > 0;
  }

  const prevLen = (store.studentCertifications || []).length;
  store.studentCertifications = (store.studentCertifications || []).filter(c => !(c.id === numCertId && c.user_id === numUserId));
  return store.studentCertifications.length < prevLen;
}

// ==========================================
// Career Tools: Interview Practice
// ==========================================
export async function getInterviewPractice(userId) {
  const numUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM interview_practice_records WHERE user_id = ?', [numUserId]);
    return rows.map(r => ({ ...r, is_practiced: Boolean(r.is_practiced) }));
  }

  return (store.interviewPracticeRecords || []).filter(p => p.user_id === numUserId);
}

export async function saveInterviewPractice({
  userId,
  questionId,
  category = 'technical',
  questionText = '',
  userAnswer = '',
  notes = '',
  isPracticed = true
}) {
  const numUserId = parseInt(userId, 10);
  const now = new Date().toISOString();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [existing] = await pool.query(
      'SELECT id FROM interview_practice_records WHERE user_id = ? AND question_id = ?',
      [numUserId, questionId]
    );

    if (existing && existing.length > 0) {
      await pool.query(
        `UPDATE interview_practice_records SET 
         user_answer = ?, notes = ?, is_practiced = ?, practiced_at = NOW() 
         WHERE user_id = ? AND question_id = ?`,
        [userAnswer, notes, isPracticed ? 1 : 0, numUserId, questionId]
      );
    } else {
      await pool.query(
        `INSERT INTO interview_practice_records 
         (user_id, question_id, category, question_text, user_answer, notes, is_practiced, practiced_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [numUserId, questionId, category, questionText, userAnswer, notes, isPracticed ? 1 : 0]
      );
    }

    const [rows] = await pool.query(
      'SELECT * FROM interview_practice_records WHERE user_id = ? AND question_id = ?',
      [numUserId, questionId]
    );
    return { ...rows[0], is_practiced: Boolean(rows[0].is_practiced) };
  }

  if (!store.interviewPracticeRecords) store.interviewPracticeRecords = [];
  let item = store.interviewPracticeRecords.find(p => p.user_id === numUserId && p.question_id === questionId);
  if (item) {
    item.user_answer = userAnswer;
    item.notes = notes;
    item.is_practiced = isPracticed;
    item.practiced_at = now;
  } else {
    item = {
      id: nextPracticeId++,
      user_id: numUserId,
      question_id: questionId,
      category,
      question_text: questionText,
      user_answer: userAnswer,
      notes,
      is_practiced: isPracticed,
      practiced_at: now,
      created_at: now
    };
    store.interviewPracticeRecords.push(item);
  }
  return JSON.parse(JSON.stringify(item));
}

// ==========================================
// Career Tools: Document Vault
// ==========================================
export async function getVaultDocuments(userId) {
  const numUserId = parseInt(userId, 10);
  if (isDbConnected()) {
    const pool = await getDbPool();
    const [rows] = await pool.query(
      `SELECT v.*, a.status as application_status, i.title as internship_title, i.company_name as internship_company 
       FROM vault_documents v
       LEFT JOIN applications a ON v.application_id = a.id
       LEFT JOIN internships i ON a.internship_id = i.id
       WHERE v.user_id = ? ORDER BY v.created_at DESC`,
      [numUserId]
    );
    return rows;
  }

  return (store.vaultDocuments || [])
    .filter(d => d.user_id === numUserId)
    .map(d => {
      const app = (store.applications || []).find(a => a.id === d.application_id);
      const internship = app ? (store.internships || []).find(i => i.id === app.internship_id) : null;
      return {
        ...d,
        application_status: app?.status || null,
        internship_title: internship?.title || null,
        internship_company: internship?.company_name || null
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function createVaultDocument({
  userId,
  name,
  documentType = 'resume',
  fileUrl = '',
  fileSize = 0,
  mimeType = 'application/pdf',
  applicationId = null,
  notes = ''
}) {
  const numUserId = parseInt(userId, 10);
  const now = new Date().toISOString();

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query(
      `INSERT INTO vault_documents 
       (user_id, name, document_type, file_url, file_size, mime_type, application_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [numUserId, name.trim(), documentType, fileUrl, fileSize, mimeType, applicationId, notes]
    );
    const [rows] = await pool.query('SELECT * FROM vault_documents WHERE id = ?', [res.insertId]);
    return rows[0];
  }

  if (!store.vaultDocuments) store.vaultDocuments = [];
  const newDoc = {
    id: nextVaultDocId++,
    user_id: numUserId,
    name: name.trim(),
    document_type: documentType,
    file_url: fileUrl,
    file_size: fileSize,
    mime_type: mimeType,
    application_id: applicationId ? parseInt(applicationId, 10) : null,
    notes,
    created_at: now
  };
  store.vaultDocuments.unshift(newDoc);
  return JSON.parse(JSON.stringify(newDoc));
}

export async function deleteVaultDocument(docId, userId) {
  const numDocId = parseInt(docId, 10);
  const numUserId = parseInt(userId, 10);

  if (isDbConnected()) {
    const pool = await getDbPool();
    const [res] = await pool.query('DELETE FROM vault_documents WHERE id = ? AND user_id = ?', [numDocId, numUserId]);
    return res.affectedRows > 0;
  }

  const prevLen = (store.vaultDocuments || []).length;
  store.vaultDocuments = (store.vaultDocuments || []).filter(d => !(d.id === numDocId && d.user_id === numUserId));
  return store.vaultDocuments.length < prevLen;
}

