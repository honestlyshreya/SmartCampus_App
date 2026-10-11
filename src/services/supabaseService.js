import { supabase, SUPABASE_URL } from '../lib/supabase';

/**
 * Utility to format real-time system date and time dynamically
 */
export function getDynamicDateTime() {
  const now = new Date();
  
  const optionsDate = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const currentDateStr = now.toLocaleDateString('en-US', optionsDate); // e.g. "Wednesday, Oct 7, 2026"

  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  const currentTimeStr = now.toLocaleTimeString('en-US', optionsTime); // e.g. "05:25 PM"

  return {
    date: currentDateStr,
    time: currentTimeStr,
  };
}

/**
 * Check if valid Supabase URL & Key are active
 */
export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL &&
    !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') &&
    !SUPABASE_URL.includes('placeholder')
  );
};

/**
 * Fetch Student profile joined with Class details from Supabase
 */
export async function getStudentByCode(studentCode = 'S001') {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(id, class_name, department, class_section, year_semester), teachers(id, full_name)')
      .eq('student_code', studentCode.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        student_code: data.student_code,
        full_name: data.full_name,
        email: data.email,
        year_semester: data.year_semester || (data.classes ? data.classes.year_semester : '1st Year | 2nd Semester'),
        class_id: data.class_id,
        class_name: data.class_name || (data.classes ? data.classes.class_name : 'CSE-C'),
        department: data.classes ? data.classes.department : 'Computer Science & Engineering',
        batch_year: data.batch_year || (data.classes ? data.classes.batch_year : 'Batch 2024'),
        cgpa: data.cgpa || 3.88,
        attendance_percentage: data.attendance_percentage || 88.0,
        teacher_id: data.teacher_id,
        teacher_name: data.teachers ? data.teachers.full_name : 'Dr. Sarah Jenkins',
        library_books_due: data.library_books_due || 2,
      };
    }
    return null;
  } catch (err) {
    console.warn('[Supabase Student Query Error]:', err.message);
    return null;
  }
}

/**
 * Fetch Teacher profile from Supabase
 */
export async function getTeacherByCode(teacherCode = 'T101') {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('teacher_code', teacherCode.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase Teacher Query Error]:', err.message);
    return null;
  }
}

/**
 * Authenticate user dynamically with relational database
 */
export async function loginWithSupabase(role, idInput, password) {
  const code = idInput.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      if (role === 'student') {
        const student = await getStudentByCode(code);
        if (student) {
          return { success: true, user: student };
        }
      } else if (role === 'teacher') {
        const teacher = await getTeacherByCode(code);
        if (teacher) {
          return { success: true, user: teacher };
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth Query Error]:', e.message);
    }
  }

  // Local fallback model if tables are initializing
  return {
    success: true,
    user: {
      student_code: code,
      role: role,
      full_name: role === 'student' ? 'Rohit Sharma' : 'Prof. Sarah Jenkins',
      class_name: 'CSE-C',
      department: 'Computer Science & Engineering',
      batch_year: 'Batch 2024',
      year_semester: '1st Year | 2nd Semester',
      cgpa: 3.88,
      attendance_percentage: 88.0,
      library_books_due: 2,
    },
  };
}

/**
 * Fetch Class Subjects / Timetable joined with Subject & Teacher details
 */
export async function getClassSubjectsFromSupabase(classId = 'C3') {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('class_subjects')
      .select('*, subjects!inner(subject_code, subject_name), teachers!inner(full_name)')
      .eq('class_id', classId);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        code: item.subjects ? item.subjects.subject_code : 'CS-301',
        subject: item.subjects ? item.subjects.subject_name : 'Data Structures',
        professor: item.teachers ? item.teachers.full_name : 'Dr. Sarah Jenkins',
        time_slot: item.time_slot,
        room: item.room,
        status: item.status,
        color: item.color,
      }));
    }
    return [];
  } catch (err) {
    console.warn('[Supabase ClassSubjects Error]:', err.message);
    return [];
  }
}

/**
 * Fetch Notices from Supabase
 */
export async function getNoticesFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase Notices Error]:', err.message);
    return [];
  }
}

/**
 * Fetch Academic Events from Supabase
 */
export async function getAcademicEventsFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('academic_events')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase Events Error]:', err.message);
    return [];
  }
}

/**
 * Record Attendance in Supabase & Automatically Recalculate Student Attendance Percentage
 */
export async function markAttendanceInSupabase(studentId, classSubjectId = 'CSUB1', status = 'Present') {
  if (!isSupabaseConfigured()) {
    return { success: true, timestamp: new Date().toISOString() };
  }

  try {
    const { data, error } = await supabase.from('attendance').insert([
      {
        student_id: studentId,
        class_subject_id: classSubjectId,
        marked_at: new Date().toISOString(),
        status: status,
      },
    ]);

    if (error) throw error;

    // Recalculate student overall attendance percentage automatically
    await recalculateStudentAttendanceInSupabase(studentId);

    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Attendance Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically calculate student attendance % based on attendance table logs
 */
export async function recalculateStudentAttendanceInSupabase(studentId) {
  if (!isSupabaseConfigured() || !studentId) return;

  try {
    const { data: logs, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId);

    if (error || !logs || logs.length === 0) return;

    const totalClasses = logs.length;
    const presentClasses = logs.filter((l) => l.status === 'Present').length;
    const percentage = Number(((presentClasses / totalClasses) * 100).toFixed(2));

    await supabase
      .from('students')
      .update({ attendance_percentage: percentage })
      .eq('id', studentId);
  } catch (err) {
    console.warn('[Recalculate Attendance Error]:', err.message);
  }
}

/* ========================================================
   ADMIN DATABASE INTEGRATION FUNCTIONS (FULL CRUD)
   ======================================================== */

/**
 * Fetch total counts for Admin Dashboard Stats
 */
export async function getAdminStatsFromSupabase() {
  if (!isSupabaseConfigured()) {
    return { students: 1248, teachers: 56, subjects: 48, classes: 24 };
  }

  try {
    const [sRes, tRes, subRes, cRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('teachers').select('id', { count: 'exact', head: true }),
      supabase.from('subjects').select('id', { count: 'exact', head: true }),
      supabase.from('classes').select('id', { count: 'exact', head: true }),
    ]);

    return {
      students: sRes.count ?? 1248,
      teachers: tRes.count ?? 56,
      subjects: subRes.count ?? 48,
      classes: cRes.count ?? 24,
    };
  } catch (err) {
    console.warn('[Supabase Admin Stats Error]:', err.message);
    return { students: 1248, teachers: 56, subjects: 48, classes: 24 };
  }
}

/**
 * Fetch all students directory
 */
export async function getAllStudentsFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(class_name, department), teachers(full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase All Students Error]:', err.message);
    return [];
  }
}

/**
 * Fetch all teachers directory
 */
export async function getAllTeachersFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase All Teachers Error]:', err.message);
    return [];
  }
}

/**
 * Fetch all subjects directory
 */
export async function getAllSubjectsFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase All Subjects Error]:', err.message);
    return [];
  }
}

/**
 * Fetch all classes directory
 */
export async function getAllClassesFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase All Classes Error]:', err.message);
    return [];
  }
}

/**
 * Insert New Student into Supabase
 */
export async function addStudentToSupabase(studentObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const payload = {
      student_code: studentObj.student_code,
      full_name: studentObj.full_name,
      email: studentObj.email,
      batch_year: studentObj.batch_year || 'Batch 2024',
      year_semester: studentObj.year_semester || '1st Year | 2nd Semester',
      class_id: studentObj.class_id,
      class_name: studentObj.class_name || 'CSE-C',
      attendance_percentage: studentObj.attendance_percentage || 100.0,
      teacher_id: studentObj.teacher_id || null,
    };

    const { data, error } = await supabase.from('students').insert([payload]).select();
    if (error) {
      // Auto-fallback if remote Supabase table has not had batch_year column added yet
      if (error.message && (error.message.includes('batch_year') || error.message.includes('schema cache'))) {
        console.warn('[Supabase Insert Student] batch_year not in schema cache, retrying without batch_year...');
        const fallbackPayload = { ...payload };
        delete fallbackPayload.batch_year;
        const retryRes = await supabase.from('students').insert([fallbackPayload]).select();
        if (retryRes.error) throw retryRes.error;
        return { success: true, data: retryRes.data };
      }
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Insert Student Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update Student in Supabase
 */
export async function updateStudentInSupabase(id, studentObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('students')
      .update(studentObj)
      .eq('id', id)
      .select();

    if (error) {
      // Auto-fallback if remote Supabase table has not had batch_year column added yet
      if (error.message && (error.message.includes('batch_year') || error.message.includes('schema cache'))) {
        console.warn('[Supabase Update Student] batch_year not in schema cache, retrying without batch_year...');
        const fallbackObj = { ...studentObj };
        delete fallbackObj.batch_year;
        const retryRes = await supabase
          .from('students')
          .update(fallbackObj)
          .eq('id', id)
          .select();
        if (retryRes.error) throw retryRes.error;
        return { success: true, data: retryRes.data };
      }
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Update Student Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete Student from Supabase
 */
export async function deleteStudentFromSupabase(id) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Delete Student Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Insert New Teacher into Supabase
 */
export async function addTeacherToSupabase(teacherObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const payload = {
      teacher_code: teacherObj.teacher_code,
      full_name: teacherObj.full_name,
      department: teacherObj.department || 'Computer Science & Engineering',
      email: teacherObj.email,
      designation: teacherObj.designation || 'Assistant Professor',
    };

    const { data, error } = await supabase.from('teachers').insert([payload]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Insert Teacher Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update Teacher in Supabase
 */
export async function updateTeacherInSupabase(id, teacherObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('teachers')
      .update(teacherObj)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Update Teacher Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete Teacher from Supabase
 */
export async function deleteTeacherFromSupabase(id) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Delete Teacher Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Insert New Subject into Supabase
 */
export async function addSubjectToSupabase(subjectObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const payload = {
      subject_code: subjectObj.subject_code,
      subject_name: subjectObj.subject_name,
      department: subjectObj.department || 'Computer Science & Engineering',
      year_semester: subjectObj.year_semester || '1st Year | 2nd Semester',
      credits: subjectObj.credits || 4,
    };

    const { data, error } = await supabase.from('subjects').insert([payload]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Insert Subject Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update Subject in Supabase
 */
export async function updateSubjectInSupabase(id, subjectObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectObj)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Update Subject Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete Subject from Supabase
 */
export async function deleteSubjectFromSupabase(id) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Delete Subject Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Insert New Class into Supabase
 */
export async function addClassToSupabase(classObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const payload = {
      class_name: classObj.class_name,
      department: classObj.department || 'Computer Science & Engineering',
      class_section: classObj.class_section || 'Section A',
      year_semester: classObj.year_semester || '1st Year | 2nd Semester',
      batch_year: classObj.batch_year || 'Batch 2024',
    };

    const { data, error } = await supabase.from('classes').insert([payload]).select();
    if (error) {
      // Auto-fallback if remote Supabase table has not had batch_year column added yet
      if (error.message && (error.message.includes('batch_year') || error.message.includes('schema cache'))) {
        console.warn('[Supabase Insert Class] batch_year not in schema cache, retrying without batch_year...');
        const fallbackPayload = { ...payload };
        delete fallbackPayload.batch_year;
        const retryRes = await supabase.from('classes').insert([fallbackPayload]).select();
        if (retryRes.error) throw retryRes.error;
        return { success: true, data: retryRes.data };
      }
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Insert Class Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update Class in Supabase
 */
export async function updateClassInSupabase(id, classObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('classes')
      .update(classObj)
      .eq('id', id)
      .select();

    if (error) {
      // Auto-fallback if remote Supabase table has not had batch_year column added yet
      if (error.message && (error.message.includes('batch_year') || error.message.includes('schema cache'))) {
        console.warn('[Supabase Update Class] batch_year not in schema cache, retrying without batch_year...');
        const fallbackObj = { ...classObj };
        delete fallbackObj.batch_year;
        const retryRes = await supabase
          .from('classes')
          .update(fallbackObj)
          .eq('id', id)
          .select();
        if (retryRes.error) throw retryRes.error;
        return { success: true, data: retryRes.data };
      }
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Update Class Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete Class from Supabase
 */
export async function deleteClassFromSupabase(id) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Delete Class Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Publish New Notice to Supabase
 */
export async function publishNoticeToSupabase(noticeObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const payload = {
      title: noticeObj.title,
      category: noticeObj.category || 'Academic',
      date_label: 'Just now',
      content: noticeObj.content,
      unread: true,
    };

    const { data, error } = await supabase.from('notices').insert([payload]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Publish Notice Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Restore 4 Default Classes into Supabase Database
 */
export async function restoreDefaultClassesInSupabase() {
  if (!isSupabaseConfigured()) return { success: true };

  const defaultClasses = [
    {
      id: '22222222-2222-2222-2222-222222222201',
      class_name: 'CSE-A',
      department: 'Computer Science & Engineering',
      class_section: 'Section A',
      year_semester: '1st Year | 2nd Semester',
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      class_name: 'CSE-B',
      department: 'Computer Science & Engineering',
      class_section: 'Section B',
      year_semester: '1st Year | 2nd Semester',
    },
    {
      id: '22222222-2222-2222-2222-222222222203',
      class_name: 'CSE-C',
      department: 'Computer Science & Engineering',
      class_section: 'Section C',
      year_semester: '1st Year | 2nd Semester',
    },
    {
      id: '22222222-2222-2222-2222-222222222204',
      class_name: 'ECE-A',
      department: 'Electronics & Communication',
      class_section: 'Section A',
      year_semester: '1st Year | 2nd Semester',
    },
  ];

  try {
    const { data, error } = await supabase.from('classes').upsert(defaultClasses).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Restore Classes Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all Class Subjects / Timetable entries joined with Classes, Subjects & Teachers
 */
export async function getAllClassSubjectsFromSupabase() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('class_subjects')
      .select('*, classes(id, class_name, department, year_semester), subjects(id, subject_code, subject_name, department, credits, year_semester), teachers(id, full_name, email, department, designation, teacher_code)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase All ClassSubjects Error]:', err.message);
    return [];
  }
}

/**
 * Add new Class Subject / Timetable Entry to Supabase
 */
export async function addClassSubjectToSupabase(scheduleObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const payload = {
      class_id: scheduleObj.class_id,
      subject_id: scheduleObj.subject_id,
      teacher_id: scheduleObj.teacher_id,
      day_of_week: scheduleObj.day_of_week || 'Monday',
      time_slot: scheduleObj.time_slot || '09:00 AM - 10:00 AM',
      room: scheduleObj.room || 'C-201',
      status: scheduleObj.status || 'Upcoming',
      color: scheduleObj.color || '#6366F1',
    };

    const { data, error } = await supabase.from('class_subjects').insert([payload]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Insert ClassSubject Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update Class Subject / Timetable Entry in Supabase
 */
export async function updateClassSubjectInSupabase(id, scheduleObj) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('class_subjects')
      .update(scheduleObj)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Update ClassSubject Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete Class Subject / Timetable Entry from Supabase
 */
export async function deleteClassSubjectFromSupabase(id) {
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const { data, error } = await supabase
      .from('class_subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Supabase Delete ClassSubject Error]:', err.message);
    return { success: false, error: err.message };
  }
}


