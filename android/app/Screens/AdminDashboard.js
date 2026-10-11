import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getDynamicDateTime,
  getAdminStatsFromSupabase,
  getAllStudentsFromSupabase,
  getAllTeachersFromSupabase,
  getAllSubjectsFromSupabase,
  getAllClassesFromSupabase,
  addStudentToSupabase,
  updateStudentInSupabase,
  deleteStudentFromSupabase,
  addTeacherToSupabase,
  updateTeacherInSupabase,
  deleteTeacherFromSupabase,
  addSubjectToSupabase,
  updateSubjectInSupabase,
  deleteSubjectFromSupabase,
  addClassToSupabase,
  updateClassInSupabase,
  deleteClassFromSupabase,
  publishNoticeToSupabase,
  markAttendanceInSupabase,
  getAllClassSubjectsFromSupabase,
  addClassSubjectToSupabase,
  updateClassSubjectInSupabase,
  deleteClassSubjectFromSupabase,
} from '../../../src/services/supabaseService';

const { width } = Dimensions.get('window');

// Dropdown Options Constants
const YEAR_SEMESTER_OPTIONS = [
  '1st Year | 1st Semester',
  '1st Year | 2nd Semester',
  '2nd Year | 3rd Semester',
  '2nd Year | 4th Semester',
  '3rd Year | 5th Semester',
  '3rd Year | 6th Semester',
  '4th Year | 7th Semester',
  '4th Year | 8th Semester',
];

const DEPARTMENT_OPTIONS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const SECTION_OPTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

const BATCH_YEAR_OPTIONS = [
  'Batch 2026',
  'Batch 2025',
  'Batch 2024',
  'Batch 2023',
  'Batch 2022',
  'Batch 2021',
];

const ACADEMIC_YEAR_OPTIONS = ['2025 - 2026', '2024 - 2025', '2026 - 2027'];
const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];
const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOT_START_OPTIONS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:15 AM',
  '12:15 PM',
  '01:00 PM',
  '02:00 PM',
  '03:15 PM',
  '04:15 PM',
];
const TIME_SLOT_END_OPTIONS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:15 PM',
  '01:15 PM',
  '02:00 PM',
  '03:00 PM',
  '04:15 PM',
  '05:15 PM',
];
const ROOM_OPTIONS = ['C-201', 'C-202', 'C-203', 'C-204', 'C-205', 'Lab 402', 'Hall B', 'Auditorium 1'];

const DEFAULT_TIMETABLE_ENTRIES = [
  {
    id: 'tt-101',
    day_of_week: 'Monday',
    time_slot: '09:00 AM - 10:00 AM',
    subject_name: 'Data Structures and Algorithms',
    subject_code: 'CS201',
    teacher_name: 'Prof. Sarah Jenkins',
    teacher_code: 'T023',
    room: 'C-201',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#3B82F6',
  },
  {
    id: 'tt-102',
    day_of_week: 'Monday',
    time_slot: '10:00 AM - 11:00 AM',
    subject_name: 'Database Management Systems',
    subject_code: 'CS304',
    teacher_name: 'Prof. A. Kumar',
    teacher_code: 'T012',
    room: 'C-202',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#F59E0B',
  },
  {
    id: 'tt-103',
    day_of_week: 'Monday',
    time_slot: '11:15 AM - 12:15 PM',
    subject_name: 'Computer Networks',
    subject_code: 'CS402',
    teacher_name: 'Prof. R. Singh',
    teacher_code: 'T045',
    room: 'C-203',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#EF4444',
  },
  {
    id: 'tt-104',
    day_of_week: 'Monday',
    time_slot: '01:00 PM - 02:00 PM',
    subject_name: 'Operating Systems',
    subject_code: 'CS302',
    teacher_name: 'Prof. M. Patel',
    teacher_code: 'T018',
    room: 'C-204',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#10B981',
  },
  {
    id: 'tt-105',
    day_of_week: 'Monday',
    time_slot: '02:00 PM - 03:00 PM',
    subject_name: 'Software Engineering',
    subject_code: 'CS305',
    teacher_name: 'Prof. K. Sharma',
    teacher_code: 'T029',
    room: 'C-205',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#F59E0B',
  },
  {
    id: 'tt-106',
    day_of_week: 'Tuesday',
    time_slot: '09:00 AM - 10:00 AM',
    subject_name: 'Computer Networks',
    subject_code: 'CS402',
    teacher_name: 'Prof. R. Singh',
    teacher_code: 'T045',
    room: 'C-203',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#EF4444',
  },
  {
    id: 'tt-107',
    day_of_week: 'Tuesday',
    time_slot: '10:00 AM - 11:00 AM',
    subject_name: 'Data Structures and Algorithms',
    subject_code: 'CS201',
    teacher_name: 'Prof. Sarah Jenkins',
    teacher_code: 'T023',
    room: 'C-201',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#3B82F6',
  },
  {
    id: 'tt-108',
    day_of_week: 'Wednesday',
    time_slot: '09:00 AM - 10:00 AM',
    subject_name: 'Database Management Systems',
    subject_code: 'CS304',
    teacher_name: 'Prof. A. Kumar',
    teacher_code: 'T012',
    room: 'C-202',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#F59E0B',
  },
  {
    id: 'tt-109',
    day_of_week: 'Thursday',
    time_slot: '11:15 AM - 12:15 PM',
    subject_name: 'Operating Systems',
    subject_code: 'CS302',
    teacher_name: 'Prof. M. Patel',
    teacher_code: 'T018',
    room: 'C-204',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#10B981',
  },
  {
    id: 'tt-110',
    day_of_week: 'Friday',
    time_slot: '01:00 PM - 02:00 PM',
    subject_name: 'Software Engineering',
    subject_code: 'CS305',
    teacher_name: 'Prof. K. Sharma',
    teacher_code: 'T029',
    room: 'C-205',
    class_name: 'CSE-A',
    academic_year: '2025 - 2026',
    semester: '2nd Semester',
    color: '#F59E0B',
  },
];

/**
 * Reusable Collapsible Dropdown Select Menu Component
 */
function DropdownSelect({ label, value, options, onSelect, placeholder = 'Select option...' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      {/* Select Box Header */}
      <TouchableOpacity
        style={[styles.dropdownSelectBox, isOpen && styles.dropdownSelectBoxActive]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.85}
      >
        <Text style={styles.dropdownSelectText} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownChevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Dropdown Options Popup Menu */}
      {isOpen && (
        <View style={styles.dropdownMenuWrapper}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
            {options.map((opt, idx) => {
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const isSelected = value === optVal || value === optLabel;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dropdownMenuItem, isSelected && styles.dropdownMenuItemSelected]}
                  onPress={() => {
                    onSelect(optVal, optLabel);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownMenuItemText,
                      isSelected && styles.dropdownMenuItemTextSelected,
                    ]}
                  >
                    {isSelected ? '✓ ' : ''}{optLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function AdminDashboard({ onLogout }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Database Data States
  const [stats, setStats] = useState({
    students: 1248,
    teachers: 56,
    subjects: 48,
    classes: 24,
  });
  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [classesList, setClassesList] = useState([]);

  // Timetable State & Filters
  const [timetableList, setTimetableList] = useState(DEFAULT_TIMETABLE_ENTRIES);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025 - 2026');
  const [selectedSemester, setSelectedSemester] = useState('2nd Semester');
  const [selectedClassFilter, setSelectedClassFilter] = useState('CSE-A');
  const [timetableSubTab, setTimetableSubTab] = useState('weekly'); // 'weekly', 'subject', 'teacher', 'classes'
  const [selectedDayTab, setSelectedDayTab] = useState('Mon'); // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'

  // Timetable Form Modal State
  const [scheduleAcadYear, setScheduleAcadYear] = useState('2025 - 2026');
  const [scheduleSem, setScheduleSem] = useState('2nd Semester');
  const [scheduleClassId, setScheduleClassId] = useState('');
  const [scheduleClassName, setScheduleClassName] = useState('CSE-A');
  const [scheduleSubjectId, setScheduleSubjectId] = useState('');
  const [scheduleSubjectObj, setScheduleSubjectObj] = useState(null);
  const [scheduleTeacherId, setScheduleTeacherId] = useState('');
  const [scheduleTeacherObj, setScheduleTeacherObj] = useState(null);
  const [scheduleRoom, setScheduleRoom] = useState('C-201');
  const [scheduleDay, setScheduleDay] = useState('Monday');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00 AM');
  const [scheduleEndTime, setScheduleEndTime] = useState('10:00 AM');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'studentForm', 'teacherForm', 'subjectForm', 'classForm', 'publishNotice', 'timetableForm'
  const [editingItem, setEditingItem] = useState(null); // Item currently being edited (null if adding new)

  // Form States (with Dropdown selection)
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentBatchYear, setStudentBatchYear] = useState('Batch 2024');
  const [studentYearSem, setStudentYearSem] = useState('1st Year | 2nd Semester');
  const [studentClassId, setStudentClassId] = useState('');
  const [studentClassName, setStudentClassName] = useState('CSE-C');
  const [studentTeacherId, setStudentTeacherId] = useState('');

  const [teacherName, setTeacherName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherDept, setTeacherDept] = useState('Computer Science & Engineering');

  // Subject Form States
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDept, setSubjectDept] = useState('Computer Science & Engineering');
  const [subjectYearSem, setSubjectYearSem] = useState('1st Year | 2nd Semester');

  // Class Form States
  const [classNameInput, setClassNameInput] = useState('');
  const [classBatchYearInput, setClassBatchYearInput] = useState('Batch 2024');
  const [classDeptInput, setClassDeptInput] = useState('Computer Science & Engineering');
  const [classSecInput, setClassSecInput] = useState('Section A');
  const [classYearSemInput, setClassYearSemInput] = useState('1st Year | 2nd Semester');

  // Notice Form States
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('Academic');
  const [noticeContent, setNoticeContent] = useState('');

  // Search & Dropdown Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterDept, setSelectedFilterDept] = useState('All Departments');
  const [selectedFilterYearSem, setSelectedFilterYearSem] = useState('All Semesters');
  const [selectedFilterClass, setSelectedFilterClass] = useState('All Classes');
  const [selectedFilterBatchYear, setSelectedFilterBatchYear] = useState('All Batches');

  // Recent System Activities
  const [activities, setActivities] = useState([
    { id: '1', title: 'New student added', sub: 'Student ID: S1250', time: '10 mins ago', icon: '👤' },
    { id: '2', title: 'Teacher updated', sub: 'Prof. A. Kumar (T023)', time: '25 mins ago', icon: '👤' },
    { id: '3', title: 'Subject added', sub: 'Machine Learning (CS401)', time: '1 hour ago', icon: '📖' },
    { id: '4', title: 'Timetable updated', sub: 'Class CSE-2A', time: '2 hours ago', icon: '📅' },
  ]);

  const { date: currentDate, time: currentTime } = getDynamicDateTime();

  // Load Data from Supabase Database on Mount
  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [liveStats, liveStudents, liveTeachers, liveSubjects, liveClasses, liveClassSubjects] = await Promise.all([
        getAdminStatsFromSupabase(),
        getAllStudentsFromSupabase(),
        getAllTeachersFromSupabase(),
        getAllSubjectsFromSupabase(),
        getAllClassesFromSupabase(),
        getAllClassSubjectsFromSupabase(),
      ]);

      setStats(liveStats);
      if (liveStudents) setStudentsList(liveStudents);
      if (liveTeachers) setTeachersList(liveTeachers);
      if (liveSubjects) setSubjectsList(liveSubjects);
      if (liveClasses) setClassesList(liveClasses);

      if (liveClassSubjects && liveClassSubjects.length > 0) {
        const mapped = liveClassSubjects.map((item) => ({
          id: item.id,
          day_of_week: item.day_of_week || 'Monday',
          time_slot: item.time_slot || '09:00 AM - 10:00 AM',
          subject_name: item.subjects ? item.subjects.subject_name : 'Subject',
          subject_code: item.subjects ? item.subjects.subject_code : 'CS201',
          teacher_name: item.teachers ? item.teachers.full_name : 'Teacher',
          teacher_code: item.teachers ? item.teachers.teacher_code : 'T001',
          room: item.room || 'C-201',
          class_name: item.classes ? item.classes.class_name : 'CSE-A',
          class_id: item.class_id,
          subject_id: item.subject_id,
          teacher_id: item.teacher_id,
          academic_year: '2025 - 2026',
          semester: '2nd Semester',
          color: item.color || '#3B82F6',
        }));
        setTimetableList(mapped);
      }
    } catch (e) {
      console.warn('Database loading error:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleDbError = (errStr) => {
    if (errStr && (errStr.includes('row-level security') || errStr.includes('policy'))) {
      Alert.alert(
        'Supabase Policy Update',
        'Your Supabase table requires RLS write policies. Please run the updated SQL script from supabase_schema.sql in your Supabase SQL Editor.',
        [{ text: 'OK' }]
      );
    } else if (errStr && (errStr.includes('batch_year') || errStr.includes('schema cache'))) {
      Alert.alert(
        'Database Schema Update Needed',
        "Your Supabase database does not have the 'batch_year' column yet.\n\nPlease copy and run the 3-line quick fix at the top of 'supabase_schema.sql' in your Supabase SQL Editor.",
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Database Error', errStr || 'Failed database operation');
    }
  };

  /* ================= STUDENT CRUD ================= */

  const openAddStudentModal = () => {
    setEditingItem(null);
    setStudentName('');
    setStudentEmail('');
    setStudentCode(`S${stats.students + 1}`);
    setStudentBatchYear('Batch 2024');
    setStudentYearSem('1st Year | 2nd Semester');
    setStudentClassName(classesList.length > 0 ? classesList[0].class_name : 'CSE-C');
    setStudentClassId(classesList.length > 0 ? classesList[0].id : '');
    setStudentTeacherId(teachersList.length > 0 ? teachersList[0].id : '');
    setActiveModal('studentForm');
  };

  const openEditStudentModal = (student) => {
    setEditingItem(student);
    setStudentName(student.full_name || '');
    setStudentEmail(student.email || '');
    setStudentCode(student.student_code || '');
    setStudentBatchYear(student.batch_year || 'Batch 2024');
    setStudentYearSem(student.year_semester || '1st Year | 2nd Semester');
    setStudentClassName(student.class_name || 'CSE-C');
    setStudentClassId(student.class_id || '');
    setStudentTeacherId(student.teacher_id || '');
    setActiveModal('studentForm');
  };

  const handleSaveStudent = async () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      Alert.alert('Validation Error', 'Please enter student full name and email address.');
      return;
    }

    const payload = {
      student_code: studentCode.trim() || `S${Date.now().toString().slice(-4)}`,
      full_name: studentName.trim(),
      email: studentEmail.trim(),
      batch_year: studentBatchYear,
      year_semester: studentYearSem,
      class_id: studentClassId || (classesList.length > 0 ? classesList[0].id : null),
      class_name: studentClassName,
      teacher_id: studentTeacherId || null,
    };

    setIsLoading(true);
    let res;
    if (editingItem) {
      res = await updateStudentInSupabase(editingItem.id, payload);
    } else {
      res = await addStudentToSupabase(payload);
    }
    setIsLoading(false);

    if (res.success) {
      showToast(editingItem ? `✅ Student ${studentName} updated!` : `✅ Student ${studentName} added!`);
      setActiveModal(null);
      loadDatabaseData();
    } else {
      handleDbError(res.error);
    }
  };

  const handleDeleteStudent = (student) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove student "${student.full_name}" (${student.student_code})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const res = await deleteStudentFromSupabase(student.id);
            setIsLoading(false);
            if (res.success) {
              showToast(`🗑️ Student ${student.full_name} removed.`);
              loadDatabaseData();
            } else {
              handleDbError(res.error);
            }
          },
        },
      ]
    );
  };

  const handleQuickMarkAttendance = async (student, status = 'Present') => {
    setIsLoading(true);
    const res = await markAttendanceInSupabase(student.id, 'CSUB1', status);
    setIsLoading(false);
    if (res.success) {
      showToast(`📍 Attendance marked (${status}) for ${student.full_name}!`);
      loadDatabaseData();
    } else {
      handleDbError(res.error);
    }
  };

  /* ================= TEACHER CRUD ================= */

  const openAddTeacherModal = () => {
    setEditingItem(null);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherCode(`T${stats.teachers + 101}`);
    setTeacherDept('Computer Science & Engineering');
    setActiveModal('teacherForm');
  };

  const openEditTeacherModal = (teacher) => {
    setEditingItem(teacher);
    setTeacherName(teacher.full_name || '');
    setTeacherEmail(teacher.email || '');
    setTeacherCode(teacher.teacher_code || '');
    setTeacherDept(teacher.department || 'Computer Science & Engineering');
    setActiveModal('teacherForm');
  };

  const handleSaveTeacher = async () => {
    if (!teacherName.trim() || !teacherEmail.trim()) {
      Alert.alert('Validation Error', 'Please enter teacher name and email address.');
      return;
    }

    const payload = {
      teacher_code: teacherCode.trim() || `T${Date.now().toString().slice(-4)}`,
      full_name: teacherName.trim(),
      email: teacherEmail.trim(),
      department: teacherDept,
    };

    setIsLoading(true);
    let res;
    if (editingItem) {
      res = await updateTeacherInSupabase(editingItem.id, payload);
    } else {
      res = await addTeacherToSupabase(payload);
    }
    setIsLoading(false);

    if (res.success) {
      showToast(editingItem ? `✅ Teacher ${teacherName} updated!` : `✅ Teacher ${teacherName} added!`);
      setActiveModal(null);
      loadDatabaseData();
    } else {
      handleDbError(res.error);
    }
  };

  const handleDeleteTeacher = (teacher) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove teacher "${teacher.full_name}" (${teacher.teacher_code})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const res = await deleteTeacherFromSupabase(teacher.id);
            setIsLoading(false);
            if (res.success) {
              showToast(`🗑️ Teacher ${teacher.full_name} removed.`);
              loadDatabaseData();
            } else {
              handleDbError(res.error);
            }
          },
        },
      ]
    );
  };

  /* ================= SUBJECT CRUD ================= */

  const openAddSubjectModal = () => {
    setEditingItem(null);
    setSubjectCode('');
    setSubjectName('');
    setSubjectDept('Computer Science & Engineering');
    setSubjectYearSem('1st Year | 2nd Semester');
    setActiveModal('subjectForm');
  };

  const openEditSubjectModal = (subject) => {
    setEditingItem(subject);
    setSubjectCode(subject.subject_code || '');
    setSubjectName(subject.subject_name || '');
    setSubjectDept(subject.department || 'Computer Science & Engineering');
    setSubjectYearSem(subject.year_semester || '1st Year | 2nd Semester');
    setActiveModal('subjectForm');
  };

  const handleSaveSubject = async () => {
    if (!subjectCode.trim() || !subjectName.trim()) {
      Alert.alert('Validation Error', 'Please enter subject code and subject name.');
      return;
    }

    const payload = {
      subject_code: subjectCode.trim(),
      subject_name: subjectName.trim(),
      department: subjectDept,
      year_semester: subjectYearSem,
    };

    setIsLoading(true);
    let res;
    if (editingItem) {
      res = await updateSubjectInSupabase(editingItem.id, payload);
    } else {
      res = await addSubjectToSupabase(payload);
    }
    setIsLoading(false);

    if (res.success) {
      showToast(
        editingItem
          ? `✅ Subject ${subjectCode} updated!`
          : `✅ Subject ${subjectCode} assigned to ${subjectDept}!`
      );
      setActiveModal(null);
      loadDatabaseData();
    } else {
      handleDbError(res.error);
    }
  };

  const handleDeleteSubject = (subject) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove subject "${subject.subject_name}" (${subject.subject_code})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const res = await deleteSubjectFromSupabase(subject.id);
            setIsLoading(false);
            if (res.success) {
              showToast(`🗑️ Subject ${subject.subject_code} removed.`);
              loadDatabaseData();
            } else {
              handleDbError(res.error);
            }
          },
        },
      ]
    );
  };

  /* ================= CLASS CRUD ================= */

  const openAddClassModal = () => {
    setEditingItem(null);
    setClassNameInput('');
    setClassBatchYearInput('Batch 2024');
    setClassDeptInput('Computer Science & Engineering');
    setClassSecInput('Section A');
    setClassYearSemInput('1st Year | 2nd Semester');
    setActiveModal('classForm');
  };

  const openEditClassModal = (cls) => {
    setEditingItem(cls);
    setClassNameInput(cls.class_name || '');
    setClassBatchYearInput(cls.batch_year || 'Batch 2024');
    setClassDeptInput(cls.department || 'Computer Science & Engineering');
    setClassSecInput(cls.class_section || 'Section A');
    setClassYearSemInput(cls.year_semester || '1st Year | 2nd Semester');
    setActiveModal('classForm');
  };

  const handleSaveClass = async () => {
    if (!classNameInput.trim()) {
      Alert.alert('Validation Error', 'Please enter class code name (e.g. CSE-D)');
      return;
    }

    const payload = {
      class_name: classNameInput.trim(),
      department: classDeptInput,
      class_section: classSecInput,
      year_semester: classYearSemInput,
      batch_year: classBatchYearInput,
    };

    setIsLoading(true);
    let res;
    if (editingItem) {
      res = await updateClassInSupabase(editingItem.id, payload);
    } else {
      res = await addClassToSupabase(payload);
    }
    setIsLoading(false);

    if (res.success) {
      showToast(editingItem ? `✅ Class ${classNameInput} updated!` : `✅ Class ${classNameInput} created!`);
      setActiveModal(null);
      loadDatabaseData();
    } else {
      handleDbError(res.error);
    }
  };

  const handleDeleteClass = (cls) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove class "${cls.class_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const res = await deleteClassFromSupabase(cls.id);
            setIsLoading(false);
            if (res.success) {
              showToast(`🗑️ Class ${cls.class_name} removed.`);
              loadDatabaseData();
            } else {
              handleDbError(res.error);
            }
          },
        },
      ]
    );
  };

  const handlePublishNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      Alert.alert('Error', 'Please fill notice title and content');
      return;
    }

    setIsLoading(true);
    const res = await publishNoticeToSupabase({
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
    });
    setIsLoading(false);

    if (res.success) {
      showToast(`📢 Notice "${noticeTitle}" published!`);
      setNoticeTitle('');
      setNoticeContent('');
      setActiveModal(null);
    } else {
      handleDbError(res.error);
    }
  };

  /* ================= TIMETABLE ENTRY CRUD ================= */

  const openAddTimetableModal = () => {
    setEditingItem(null);
    setScheduleAcadYear(selectedAcademicYear || '2025 - 2026');
    setScheduleSem(selectedSemester || '2nd Semester');

    const matchedCls = classesList.find((c) => c.class_name === selectedClassFilter) || classesList[0] || { id: '', class_name: selectedClassFilter || 'CSE-A' };
    setScheduleClassId(matchedCls.id || '');
    setScheduleClassName(matchedCls.class_name || 'CSE-A');

    const defaultSub = subjectsList[0] || { id: '', subject_name: 'Data Structures and Algorithms', subject_code: 'CS201', department: 'Computer Science', credits: 4 };
    setScheduleSubjectId(defaultSub.id || '');
    setScheduleSubjectObj(defaultSub);

    const defaultTeacher = teachersList[0] || { id: '', full_name: 'Prof. Sarah Jenkins', teacher_code: 'T023', email: 'sarah.jenkins@college.edu', department: 'CSE', designation: 'Professor' };
    setScheduleTeacherId(defaultTeacher.id || '');
    setScheduleTeacherObj(defaultTeacher);

    setScheduleRoom('C-201');
    const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
    setScheduleDay(dayMap[selectedDayTab] || 'Monday');
    setScheduleStartTime('09:00 AM');
    setScheduleEndTime('10:00 AM');
    setScheduleNotes('');
    setActiveModal('timetableForm');
  };

  const openEditTimetableModal = (entry) => {
    setEditingItem(entry);
    setScheduleAcadYear(entry.academic_year || '2025 - 2026');
    setScheduleSem(entry.semester || '2nd Semester');

    const matchedCls = classesList.find((c) => c.id === entry.class_id || c.class_name === entry.class_name) || { id: entry.class_id, class_name: entry.class_name || 'CSE-A' };
    setScheduleClassId(matchedCls.id || '');
    setScheduleClassName(matchedCls.class_name || 'CSE-A');

    const matchedSub = subjectsList.find((s) => s.id === entry.subject_id || s.subject_name === entry.subject_name) || {
      id: entry.subject_id || '',
      subject_name: entry.subject_name || 'Data Structures and Algorithms',
      subject_code: entry.subject_code || 'CS201',
      department: 'Computer Science',
      credits: 4,
    };
    setScheduleSubjectId(matchedSub.id || '');
    setScheduleSubjectObj(matchedSub);

    const matchedTeacher = teachersList.find((t) => t.id === entry.teacher_id || t.full_name === entry.teacher_name) || {
      id: entry.teacher_id || '',
      full_name: entry.teacher_name || 'Prof. Sarah Jenkins',
      teacher_code: entry.teacher_code || 'T023',
      email: 'teacher@college.edu',
      department: 'CSE',
      designation: 'Professor',
    };
    setScheduleTeacherId(matchedTeacher.id || '');
    setScheduleTeacherObj(matchedTeacher);

    setScheduleRoom(entry.room || 'C-201');
    setScheduleDay(entry.day_of_week || 'Monday');

    if (entry.time_slot && entry.time_slot.includes('-')) {
      const parts = entry.time_slot.split('-');
      setScheduleStartTime(parts[0].trim());
      setScheduleEndTime(parts[1].trim());
    } else {
      setScheduleStartTime('09:00 AM');
      setScheduleEndTime('10:00 AM');
    }
    setScheduleNotes(entry.notes || '');
    setActiveModal('timetableForm');
  };

  const handleSaveTimetable = async () => {
    const selectedSub = scheduleSubjectObj || subjectsList.find((s) => s.id === scheduleSubjectId) || { subject_name: 'Data Structures and Algorithms', subject_code: 'CS201' };
    const selectedTeacher = scheduleTeacherObj || teachersList.find((t) => t.id === scheduleTeacherId) || { full_name: 'Prof. Sarah Jenkins', teacher_code: 'T023' };

    const timeSlotStr = `${scheduleStartTime} - ${scheduleEndTime}`;
    const colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const payload = {
      class_id: scheduleClassId || (classesList[0] ? classesList[0].id : '22222222-2222-2222-2222-222222222201'),
      subject_id: scheduleSubjectId || (subjectsList[0] ? subjectsList[0].id : '11111111-1111-1111-1111-111111111101'),
      teacher_id: scheduleTeacherId || (teachersList[0] ? teachersList[0].id : '33333333-3333-3333-3333-333333333301'),
      day_of_week: scheduleDay,
      time_slot: timeSlotStr,
      room: scheduleRoom,
      color: randomColor,
    };

    setIsLoading(true);
    let res;
    if (editingItem && editingItem.id && !editingItem.id.startsWith('tt-')) {
      res = await updateClassSubjectInSupabase(editingItem.id, payload);
    } else {
      res = await addClassSubjectToSupabase(payload);
    }
    setIsLoading(false);

    const updatedEntry = {
      id: editingItem ? editingItem.id : `tt-${Date.now()}`,
      day_of_week: scheduleDay,
      time_slot: timeSlotStr,
      subject_name: selectedSub.subject_name || 'Subject',
      subject_code: selectedSub.subject_code || 'CS201',
      teacher_name: selectedTeacher.full_name || 'Teacher',
      teacher_code: selectedTeacher.teacher_code || 'T001',
      room: scheduleRoom,
      class_name: scheduleClassName,
      academic_year: scheduleAcadYear,
      semester: scheduleSem,
      color: editingItem?.color || randomColor,
    };

    if (editingItem) {
      setTimetableList((prev) => prev.map((item) => (item.id === editingItem.id ? updatedEntry : item)));
      showToast('✅ Timetable entry updated!');
    } else {
      setTimetableList((prev) => [updatedEntry, ...prev]);
      showToast('✅ New class schedule added!');
    }

    setActiveModal(null);
    loadDatabaseData();
  };

  const handleDeleteTimetable = (entry) => {
    Alert.alert(
      'Remove Class Schedule',
      `Are you sure you want to remove "${entry.subject_name}" on ${entry.day_of_week} (${entry.time_slot})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            if (entry.id && !entry.id.startsWith('tt-')) {
              await deleteClassSubjectFromSupabase(entry.id);
            }
            setTimetableList((prev) => prev.filter((item) => item.id !== entry.id));
            setIsLoading(false);
            showToast(`🗑️ Class schedule removed.`);
            loadDatabaseData();
          },
        },
      ]
    );
  };

  // Filtered lists for search and dropdown menus
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedFilterDept === 'All Departments' ||
      s.department === selectedFilterDept ||
      (s.classes && s.classes.department === selectedFilterDept);
    const matchesYearSem =
      selectedFilterYearSem === 'All Semesters' || s.year_semester === selectedFilterYearSem;
    const matchesClass =
      selectedFilterClass === 'All Classes' ||
      s.class_name === selectedFilterClass ||
      (s.classes && s.classes.class_name === selectedFilterClass);
    const matchesBatch =
      selectedFilterBatchYear === 'All Batches' ||
      (s.batch_year || 'Batch 2024') === selectedFilterBatchYear;
    return matchesSearch && matchesDept && matchesYearSem && matchesClass && matchesBatch;
  });

  const filteredTeachers = teachersList.filter((t) => {
    const matchesSearch =
      t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacher_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedFilterDept === 'All Departments' || t.department === selectedFilterDept;
    return matchesSearch && matchesDept;
  });

  const filteredSubjects = subjectsList.filter((sub) => {
    const matchesSearch =
      sub.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subject_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedFilterDept === 'All Departments' || sub.department === selectedFilterDept;
    const matchesYearSem =
      selectedFilterYearSem === 'All Semesters' || sub.year_semester === selectedFilterYearSem;
    return matchesSearch && matchesDept && matchesYearSem;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header App Bar */}
      <View style={[styles.headerAppBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuIconButton} activeOpacity={0.7} onPress={loadDatabaseData}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.appTitleWrapper}>
            <View style={styles.sparkleBadge}>
              <Text style={styles.sparkleIcon}>✨</Text>
            </View>
            <Text style={styles.headerAppTitle}>Smart Campus Assistant</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.adminPillBadge}>
            <Text style={styles.adminBadgeCrown}>👑</Text>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.avatarCircle} onPress={onLogout} activeOpacity={0.8}>
            <Text style={styles.avatarLetter}>A</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Database Sync Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#7E22CE" />
          <Text style={styles.loadingText}>Syncing with Supabase Database...</Text>
        </View>
      )}

      {/* Toast Notification Alert */}
      {toastMessage ? (
        <View style={styles.toastBanner}>
          <Text style={styles.toastBannerText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Banner Hero Card */}
            <View style={styles.welcomeHeroCard}>
              <View style={styles.welcomeLeftContent}>
                <Text style={styles.welcomeHandText}>👋 Welcome,</Text>
                <Text style={styles.welcomeAdminTitle}>Admin</Text>
                <Text style={styles.welcomeSubText}>Manage your campus efficiently</Text>
              </View>
              <View style={styles.welcomeRightContent}>
                <Text style={styles.heroDateText}>{currentDate}</Text>
                <Text style={styles.heroTimeText}>{currentTime}</Text>
              </View>
            </View>

            {/* Overview Stats 2x2 Grid */}
            <View style={styles.stats2x2Grid}>
              <TouchableOpacity
                style={[styles.statBoxCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}
                onPress={() => setActiveTab('students')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={styles.statBoxEmoji}>👥</Text>
                </View>
                <Text style={styles.statBoxLabel}>Total Students</Text>
                <Text style={styles.statBoxValue}>{stats.students.toLocaleString()}</Text>
                <Text style={[styles.statBoxTrend, { color: '#16A34A' }]}>↑ +12 this month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statBoxCard, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}
                onPress={() => setActiveTab('teachers')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={styles.statBoxEmoji}>👤</Text>
                </View>
                <Text style={styles.statBoxLabel}>Total Teachers</Text>
                <Text style={styles.statBoxValue}>{stats.teachers}</Text>
                <Text style={[styles.statBoxTrend, { color: '#16A34A' }]}>↑ +3 this month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statBoxCard, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}
                onPress={() => setActiveTab('subjects')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: '#E9D5FF' }]}>
                  <Text style={styles.statBoxEmoji}>📖</Text>
                </View>
                <Text style={styles.statBoxLabel}>Total Subjects</Text>
                <Text style={styles.statBoxValue}>{stats.subjects}</Text>
                <Text style={[styles.statBoxTrend, { color: '#16A34A' }]}>↑ +2 this month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statBoxCard, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}
                onPress={() => openAddClassModal()}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.statBoxEmoji}>🏫</Text>
                </View>
                <Text style={styles.statBoxLabel}>Total Classes</Text>
                <Text style={styles.statBoxValue}>{stats.classes}</Text>
                <Text style={[styles.statBoxTrend, { color: '#16A34A' }]}>↑ +1 this month</Text>
              </TouchableOpacity>
            </View>

            {/* Management Panel Section */}
            <View style={styles.sectionHeadingWrapper}>
              <Text style={styles.mainSectionTitle}>Management Panel</Text>
              <Text style={styles.mainSectionSubTitle}>Manage all campus academic data and resources</Text>
            </View>

            {/* 2-Column Responsive Management Grid */}
            <View style={styles.managementGrid2Col}>
              <TouchableOpacity
                style={styles.mgmtCard2Col}
                onPress={() => setActiveTab('students')}
                activeOpacity={0.85}
              >
                <View style={styles.mgmtCardHeader}>
                  <View style={[styles.mgmtIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.mgmtIconText}>👥</Text>
                  </View>
                  <Text style={styles.mgmtTitle} numberOfLines={1}>Manage Students</Text>
                  <Text style={styles.mgmtChevron}>›</Text>
                </View>
                <Text style={styles.mgmtDesc} numberOfLines={2}>Add, edit, remove students. Promote to next year/semester.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mgmtCard2Col}
                onPress={() => setActiveTab('teachers')}
                activeOpacity={0.85}
              >
                <View style={styles.mgmtCardHeader}>
                  <View style={[styles.mgmtIconWrap, { backgroundColor: '#FCE7F3' }]}>
                    <Text style={styles.mgmtIconText}>👤</Text>
                  </View>
                  <Text style={styles.mgmtTitle} numberOfLines={1}>Manage Teachers</Text>
                  <Text style={styles.mgmtChevron}>›</Text>
                </View>
                <Text style={styles.mgmtDesc} numberOfLines={2}>Add, edit, remove teachers. Manage their details.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mgmtCard2Col}
                onPress={() => setActiveTab('subjects')}
                activeOpacity={0.85}
              >
                <View style={styles.mgmtCardHeader}>
                  <View style={[styles.mgmtIconWrap, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={styles.mgmtIconText}>📖</Text>
                  </View>
                  <Text style={styles.mgmtTitle} numberOfLines={1}>Manage Subjects</Text>
                  <Text style={styles.mgmtChevron}>›</Text>
                </View>
                <Text style={styles.mgmtDesc} numberOfLines={2}>Add, edit, assign subjects to Branch, Year & Semester.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mgmtCard2Col}
                onPress={() => openAddClassModal()}
                activeOpacity={0.85}
              >
                <View style={styles.mgmtCardHeader}>
                  <View style={[styles.mgmtIconWrap, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={styles.mgmtIconText}>🏫</Text>
                  </View>
                  <Text style={styles.mgmtTitle} numberOfLines={1}>Manage Classes</Text>
                  <Text style={styles.mgmtChevron}>›</Text>
                </View>
                <Text style={styles.mgmtDesc} numberOfLines={2}>Create class ID, assign teachers, assign subjects.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mgmtCard2Col}
                onPress={() => setActiveTab('timetable')}
                activeOpacity={0.85}
              >
                <View style={styles.mgmtCardHeader}>
                  <View style={[styles.mgmtIconWrap, { backgroundColor: '#FFF7ED' }]}>
                    <Text style={styles.mgmtIconText}>📅</Text>
                  </View>
                  <Text style={styles.mgmtTitle} numberOfLines={1}>Manage Timetable</Text>
                  <Text style={styles.mgmtChevron}>›</Text>
                </View>
                <Text style={styles.mgmtDesc} numberOfLines={2}>Create and manage class schedules with start & end time.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mgmtCard2Col}
                onPress={() => showToast('🚀 Student batch promotion initialized!')}
                activeOpacity={0.85}
              >
                <View style={styles.mgmtCardHeader}>
                  <View style={[styles.mgmtIconWrap, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.mgmtIconText}>📈</Text>
                  </View>
                  <Text style={styles.mgmtTitle} numberOfLines={1}>Promote Students</Text>
                  <Text style={styles.mgmtChevron}>›</Text>
                </View>
                <Text style={styles.mgmtDesc} numberOfLines={2}>Move students to next semester/year in bulk or individually.</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Row: Recent Activities & Quick Actions */}
            <View style={styles.bottomColumnsWrapper}>
              <View style={styles.activitiesColumnCard}>
                <View style={styles.columnHeaderRow}>
                  <Text style={styles.columnTitle}>Recent Activities</Text>
                  <TouchableOpacity onPress={() => showToast('Viewing all system logs...')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {activities.map((act) => (
                  <View key={act.id} style={styles.activityItemRow}>
                    <View style={[styles.activityIconCircle, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={styles.activityEmoji}>{act.icon}</Text>
                    </View>
                    <View style={styles.activityTextWrap}>
                      <Text style={styles.activityMainTitle}>{act.title}</Text>
                      <Text style={styles.activitySubTitle}>{act.sub}</Text>
                    </View>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.quickActionsColumnCard}>
                <Text style={styles.columnTitle}>Quick Actions</Text>

                <View style={styles.quickActions2x2Grid}>
                  <TouchableOpacity
                    style={[styles.quickActionBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}
                    onPress={() => openAddStudentModal()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionIcon}>👤⁺</Text>
                    <Text style={[styles.quickActionLabel, { color: '#2563EB' }]}>Add Student</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionBox, { backgroundColor: '#FCE7F3', borderColor: '#FBCFE8' }]}
                    onPress={() => openAddTeacherModal()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionIcon}>👤⁺</Text>
                    <Text style={[styles.quickActionLabel, { color: '#DB2777' }]}>Add Teacher</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionBox, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}
                    onPress={() => openAddSubjectModal()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionIcon}>📖⁺</Text>
                    <Text style={[styles.quickActionLabel, { color: '#9333EA' }]}>Add Subject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                    onPress={() => openAddClassModal()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionIcon}>🏫⁺</Text>
                    <Text style={[styles.quickActionLabel, { color: '#D97706' }]}>Create Class</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.wideQuickActionBtn, { backgroundColor: '#F3E8FF' }]}
                  onPress={() => setActiveModal('publishNotice')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.wideBtnIcon}>🔔⁺</Text>
                  <Text style={[styles.wideBtnLabel, { color: '#7E22CE' }]}>Publish Notice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Tab 2: Students Directory */}
        {activeTab === 'students' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.tabHeaderTitle}>Student Directory ({filteredStudents.length})</Text>
              <TouchableOpacity style={styles.primaryAddBtn} onPress={openAddStudentModal}>
                <Text style={styles.primaryAddBtnText}>+ Add Student</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search student name, roll no, class..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Dropdown Filters Row */}
            <View style={styles.filterDropdownsRow}>
              <View style={{ flex: 1, marginRight: 4 }}>
                <DropdownSelect
                  value={selectedFilterDept}
                  options={['All Departments', ...DEPARTMENT_OPTIONS]}
                  onSelect={(val) => setSelectedFilterDept(val)}
                  placeholder="Department..."
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <DropdownSelect
                  value={selectedFilterYearSem}
                  options={['All Semesters', ...YEAR_SEMESTER_OPTIONS]}
                  onSelect={(val) => setSelectedFilterYearSem(val)}
                  placeholder="Semester..."
                />
              </View>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <DropdownSelect
                  value={selectedFilterBatchYear}
                  options={['All Batches', ...BATCH_YEAR_OPTIONS]}
                  onSelect={(val) => setSelectedFilterBatchYear(val)}
                  placeholder="Batch..."
                />
              </View>
            </View>

            <View style={styles.directoryListCard}>
              {filteredStudents.length === 0 ? (
                <Text style={styles.emptyText}>No matching students found in database.</Text>
              ) : (
                filteredStudents.map((st) => (
                  <View key={st.id} style={styles.directoryItemFull}>
                    <View style={styles.directoryAvatar}>
                      <Text style={styles.directoryAvatarText}>
                        {st.full_name ? st.full_name.substring(0, 2).toUpperCase() : 'ST'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.directoryName}>{st.full_name}</Text>
                        <Text style={styles.codeTag}>({st.student_code})</Text>
                      </View>
                      <Text style={styles.directoryMeta}>
                        🎓 Batch: <Text style={styles.metaHighlight}>{st.batch_year || 'Batch 2024'}</Text> • Class: <Text style={styles.metaHighlight}>{st.class_name || (st.classes ? st.classes.class_name : 'CSE-C')}</Text> • {st.year_semester || '1st Year'}
                      </Text>
                      <Text style={styles.directoryMeta}>Email: {st.email}</Text>
                      <Text style={styles.directoryMeta}>
                        Mentor: {st.teachers ? st.teachers.full_name : 'Dr. Sarah Jenkins'}
                      </Text>

                      <View style={styles.attQuickRow}>
                        <Text style={styles.attLabel}>Dynamic Attendance:</Text>
                        <TouchableOpacity
                          style={styles.attPresentBtn}
                          onPress={() => handleQuickMarkAttendance(st, 'Present')}
                        >
                          <Text style={styles.attPresentText}>+ Present</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.attAbsentBtn}
                          onPress={() => handleQuickMarkAttendance(st, 'Absent')}
                        >
                          <Text style={styles.attAbsentText}>- Absent</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.actionRightCol}>
                      <View
                        style={[
                          styles.directoryBadge,
                          {
                            backgroundColor:
                              (st.attendance_percentage ?? 88) >= 80 ? '#DCFCE7' : '#FEE2E2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.directoryBadgeText,
                            {
                              color:
                                (st.attendance_percentage ?? 88) >= 80 ? '#15803D' : '#DC2626',
                            },
                          ]}
                        >
                          {st.attendance_percentage ?? 88}%
                        </Text>
                      </View>

                      <View style={styles.itemActionRow}>
                        <TouchableOpacity
                          style={styles.editBtnCircle}
                          onPress={() => openEditStudentModal(st)}
                        >
                          <Text style={styles.actionBtnIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtnCircle}
                          onPress={() => handleDeleteStudent(st)}
                        >
                          <Text style={styles.actionBtnIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Tab 3: Teachers Directory */}
        {activeTab === 'teachers' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.tabHeaderTitle}>Faculty Directory ({filteredTeachers.length})</Text>
              <TouchableOpacity style={styles.primaryAddBtn} onPress={openAddTeacherModal}>
                <Text style={styles.primaryAddBtnText}>+ Add Teacher</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search teacher name, code, dept..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Faculty Department Dropdown Filter */}
            <View style={{ marginBottom: 12 }}>
              <DropdownSelect
                value={selectedFilterDept}
                options={['All Departments', ...DEPARTMENT_OPTIONS]}
                onSelect={(val) => setSelectedFilterDept(val)}
                placeholder="Filter Faculty by Department..."
              />
            </View>

            <View style={styles.directoryListCard}>
              {filteredTeachers.length === 0 ? (
                <Text style={styles.emptyText}>No matching teachers found in database.</Text>
              ) : (
                filteredTeachers.map((tc) => (
                  <View key={tc.id} style={styles.directoryItemFull}>
                    <View style={[styles.directoryAvatar, { backgroundColor: '#FCE7F3' }]}>
                      <Text style={[styles.directoryAvatarText, { color: '#DB2777' }]}>
                        {tc.full_name ? tc.full_name.substring(0, 2).toUpperCase() : 'TC'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.directoryName}>{tc.full_name} ({tc.teacher_code})</Text>
                      <Text style={styles.directoryMeta}>{tc.department} • {tc.designation || 'Professor'}</Text>
                      <Text style={styles.directoryMeta}>Email: {tc.email}</Text>
                    </View>

                    <View style={styles.itemActionRow}>
                      <TouchableOpacity
                        style={styles.editBtnCircle}
                        onPress={() => openEditTeacherModal(tc)}
                      >
                        <Text style={styles.actionBtnIcon}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtnCircle}
                        onPress={() => handleDeleteTeacher(tc)}
                      >
                        <Text style={styles.actionBtnIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Tab 4: Subjects Directory */}
        {activeTab === 'subjects' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.tabHeaderTitle}>Subjects Directory ({filteredSubjects.length})</Text>
              <TouchableOpacity style={styles.primaryAddBtn} onPress={openAddSubjectModal}>
                <Text style={styles.primaryAddBtnText}>+ Assign New Subject</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search subject code, name, branch..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Subject Filters Row */}
            <View style={styles.filterDropdownsRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <DropdownSelect
                  value={selectedFilterDept}
                  options={['All Departments', ...DEPARTMENT_OPTIONS]}
                  onSelect={(val) => setSelectedFilterDept(val)}
                  placeholder="Department..."
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <DropdownSelect
                  value={selectedFilterYearSem}
                  options={['All Semesters', ...YEAR_SEMESTER_OPTIONS]}
                  onSelect={(val) => setSelectedFilterYearSem(val)}
                  placeholder="Semester..."
                />
              </View>
            </View>

            <View style={styles.directoryListCard}>
              {filteredSubjects.length === 0 ? (
                <Text style={styles.emptyText}>No subjects found in database.</Text>
              ) : (
                filteredSubjects.map((sub) => (
                  <View key={sub.id} style={styles.directoryItemFull}>
                    <View style={[styles.directoryAvatar, { backgroundColor: '#F3E8FF' }]}>
                      <Text style={[styles.directoryAvatarText, { color: '#7E22CE' }]}>📖</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.directoryName}>{sub.subject_name}</Text>
                        <Text style={styles.codeTag}>({sub.subject_code})</Text>
                      </View>
                      <Text style={styles.directoryMeta}>
                        Branch: <Text style={styles.metaHighlight}>{sub.department || 'Computer Science & Engineering'}</Text>
                      </Text>
                      <Text style={styles.directoryMeta}>
                        Semester: <Text style={styles.metaHighlight}>{sub.year_semester || '1st Year | 2nd Semester'}</Text>
                      </Text>
                    </View>

                    <View style={styles.itemActionRow}>
                      <TouchableOpacity
                        style={styles.editBtnCircle}
                        onPress={() => openEditSubjectModal(sub)}
                      >
                        <Text style={styles.actionBtnIcon}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtnCircle}
                        onPress={() => handleDeleteSubject(sub)}
                      >
                        <Text style={styles.actionBtnIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Tab 5: Timetable Management */}
        {activeTab === 'timetable' && (() => {
          const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
          const fullDayName = dayMap[selectedDayTab] || 'Monday';

          // Timetable entries filtered by selected class, batch year, and selected day
          const classTimetable = timetableList.filter((item) => {
            const matchesClass = !selectedClassFilter || selectedClassFilter === 'All Classes' || item.class_name === selectedClassFilter;
            const matchedClsObj = classesList.find(c => c.class_name === item.class_name);
            const matchesBatch = selectedFilterBatchYear === 'All Batches' || (matchedClsObj && (matchedClsObj.batch_year || 'Batch 2024') === selectedFilterBatchYear);
            return matchesClass && matchesBatch;
          });

          const daySchedule = classTimetable.filter((item) => {
            return item.day_of_week && (item.day_of_week.toLowerCase() === fullDayName.toLowerCase() || item.day_of_week.toLowerCase().startsWith(selectedDayTab.toLowerCase()));
          });

          // Dynamic Stats Calculation
          const totalSubjectsCount = subjectsList.length || 6;
          const totalStudentsCount = studentsList.filter(s => {
            const matchesClass = !selectedClassFilter || selectedClassFilter === 'All Classes' || s.class_name === selectedClassFilter || s.classes?.class_name === selectedClassFilter;
            const matchesBatch = selectedFilterBatchYear === 'All Batches' || (s.batch_year || 'Batch 2024') === selectedFilterBatchYear;
            return matchesClass && matchesBatch;
          }).length;
          const classesPerDayCount = daySchedule.length;
          const assignedTeachersCount = new Set(classTimetable.map(t => t.teacher_name)).size || 3;

          const availableClassOptions = ['All Classes', ...new Set([...classesList.map(c => c.class_name), 'CSE-A', 'CSE-B', 'CSE-C', 'ECE-A'])];

          return (
            <View style={styles.tabContentContainer}>
              {/* Header Banner Card */}
              <View style={styles.ttBannerCard}>
                <View style={styles.ttBannerIconWrapper}>
                  <Text style={styles.ttBannerIcon}>📅</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ttBannerTitle}>Timetable Management</Text>
                  <Text style={styles.ttBannerSubtitle}>
                    Create and manage class schedules for all departments & admission batches
                  </Text>
                </View>
              </View>

              {/* Filters Card: Academic Year, Semester, Batch, Class */}
              <View style={styles.ttFiltersCard}>
                <View style={{ flex: 1, marginRight: 3 }}>
                  <DropdownSelect
                    label="Academic Year"
                    value={selectedAcademicYear}
                    options={ACADEMIC_YEAR_OPTIONS}
                    onSelect={(val) => setSelectedAcademicYear(val)}
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 2 }}>
                  <DropdownSelect
                    label="Semester"
                    value={selectedSemester}
                    options={SEMESTER_OPTIONS}
                    onSelect={(val) => setSelectedSemester(val)}
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 2 }}>
                  <DropdownSelect
                    label="Admission Batch"
                    value={selectedFilterBatchYear}
                    options={['All Batches', ...BATCH_YEAR_OPTIONS]}
                    onSelect={(val) => setSelectedFilterBatchYear(val)}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 3 }}>
                  <DropdownSelect
                    label="Class"
                    value={selectedClassFilter}
                    options={availableClassOptions}
                    onSelect={(val) => setSelectedClassFilter(val)}
                  />
                </View>
              </View>

              {/* 4 Stat Cards Grid (2x2) */}
              <View style={styles.ttStatsGrid}>
                <View style={[styles.ttStatCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Text style={styles.ttStatIcon}>📖</Text>
                  <Text style={[styles.ttStatValue, { color: '#1D4ED8' }]}>{totalSubjectsCount}</Text>
                  <Text style={styles.ttStatLabel}>Total Subjects</Text>
                </View>

                <View style={[styles.ttStatCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Text style={styles.ttStatIcon}>👥</Text>
                  <Text style={[styles.ttStatValue, { color: '#047857' }]}>{totalStudentsCount}</Text>
                  <Text style={styles.ttStatLabel}>Total Students</Text>
                </View>

                <View style={[styles.ttStatCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
                  <Text style={styles.ttStatIcon}>📅</Text>
                  <Text style={[styles.ttStatValue, { color: '#7E22CE' }]}>{classesPerDayCount}</Text>
                  <Text style={styles.ttStatLabel}>Classes / Day</Text>
                </View>

                <View style={[styles.ttStatCard, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}>
                  <Text style={styles.ttStatIcon}>👤</Text>
                  <Text style={[styles.ttStatValue, { color: '#BE123C' }]}>{assignedTeachersCount}</Text>
                  <Text style={styles.ttStatLabel}>Assigned Teachers</Text>
                </View>
              </View>

              {/* View Selector Tabs */}
              <View style={styles.ttViewTabsRow}>
                <TouchableOpacity
                  style={[styles.ttViewTabBtn, timetableSubTab === 'weekly' && styles.ttViewTabBtnActive]}
                  onPress={() => setTimetableSubTab('weekly')}
                >
                  <Text style={[styles.ttViewTabLabel, timetableSubTab === 'weekly' && styles.ttViewTabLabelActive]}>
                    📅 Weekly Timetable
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ttViewTabBtn, timetableSubTab === 'subject' && styles.ttViewTabBtnActive]}
                  onPress={() => setTimetableSubTab('subject')}
                >
                  <Text style={[styles.ttViewTabLabel, timetableSubTab === 'subject' && styles.ttViewTabLabelActive]}>
                    📖 Subject-wise
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ttViewTabBtn, timetableSubTab === 'teacher' && styles.ttViewTabBtnActive]}
                  onPress={() => setTimetableSubTab('teacher')}
                >
                  <Text style={[styles.ttViewTabLabel, timetableSubTab === 'teacher' && styles.ttViewTabLabelActive]}>
                    👥 Teacher-wise
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ttViewTabBtn, timetableSubTab === 'classes' && styles.ttViewTabBtnActive]}
                  onPress={() => setTimetableSubTab('classes')}
                >
                  <Text style={[styles.ttViewTabLabel, timetableSubTab === 'classes' && styles.ttViewTabLabelActive]}>
                    🏫 Classes
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SUBTAB 1: WEEKLY TIMETABLE */}
              {timetableSubTab === 'weekly' && (
                <View>
                  {/* Day Tabs + [+ Add Class] Button Row */}
                  <View style={styles.ttDayControlRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[styles.ttDayPill, selectedDayTab === day && styles.ttDayPillActive]}
                          onPress={() => setSelectedDayTab(day)}
                        >
                          <Text style={[styles.ttDayPillText, selectedDayTab === day && styles.ttDayPillTextActive]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.ttAddClassPurpleBtn} onPress={openAddTimetableModal}>
                      <Text style={styles.ttAddClassPurpleBtnText}>+ Add Class</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Schedule Table Container */}
                  <View style={styles.ttTableCard}>
                    {/* Header Row */}
                    <View style={styles.ttTableHeaderRow}>
                      <Text style={[styles.ttTableHeaderCell, { width: 90 }]}>Time</Text>
                      <Text style={[styles.ttTableHeaderCell, { flex: 1 }]}>Subject</Text>
                      <Text style={[styles.ttTableHeaderCell, { width: 100 }]}>Teacher</Text>
                      <Text style={[styles.ttTableHeaderCell, { width: 60 }]}>Room</Text>
                      <Text style={[styles.ttTableHeaderCell, { width: 55, textAlign: 'right' }]}>Actions</Text>
                    </View>

                    {/* Table Body Rows */}
                    {daySchedule.length === 0 ? (
                      <View style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, marginBottom: 8 }}>📅</Text>
                        <Text style={{ color: '#64748B', fontWeight: '600' }}>No classes scheduled for {fullDayName}.</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Tap "+ Add Class" to create a new entry.</Text>
                      </View>
                    ) : (
                      daySchedule.map((entry) => (
                        <View key={entry.id} style={styles.ttTableRow}>
                          {/* Accent Color Indicator Bar on Left */}
                          <View style={[styles.ttAccentBar, { backgroundColor: entry.color || '#3B82F6' }]} />

                          {/* Time Column */}
                          <View style={{ width: 85 }}>
                            <Text style={[styles.ttTimeText, { color: entry.color || '#3B82F6' }]}>
                              {entry.time_slot}
                            </Text>
                          </View>

                          {/* Subject Column */}
                          <View style={{ flex: 1, paddingHorizontal: 6 }}>
                            <Text style={styles.ttSubjectTitle} numberOfLines={2}>
                              {entry.subject_name}
                            </Text>
                            {entry.subject_code ? (
                              <Text style={styles.ttSubCodeText}>({entry.subject_code})</Text>
                            ) : null}
                          </View>

                          {/* Teacher Column */}
                          <View style={{ width: 95, paddingHorizontal: 4 }}>
                            <Text style={styles.ttTeacherName} numberOfLines={2}>
                              {entry.teacher_name}
                            </Text>
                          </View>

                          {/* Room Badge */}
                          <View style={{ width: 55 }}>
                            <View style={styles.ttRoomBadge}>
                              <Text style={styles.ttRoomBadgeText}>{entry.room}</Text>
                            </View>
                          </View>

                          {/* Action Buttons */}
                          <View style={styles.ttActionsRow}>
                            <TouchableOpacity
                              style={styles.editBtnCircle}
                              onPress={() => openEditTimetableModal(entry)}
                            >
                              <Text style={styles.actionBtnIcon}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteBtnCircle}
                              onPress={() => handleDeleteTimetable(entry)}
                            >
                              <Text style={styles.actionBtnIcon}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}

              {/* SUBTAB 2: SUBJECT-WISE VIEW */}
              {timetableSubTab === 'subject' && (
                <View style={styles.ttTableCard}>
                  <Text style={styles.ttGroupHeader}>Subject-wise Class Schedule</Text>
                  {subjectsList.map((sub) => {
                    const subEntries = classTimetable.filter((t) => t.subject_name === sub.subject_name || t.subject_code === sub.subject_code);
                    return (
                      <View key={sub.id} style={{ marginBottom: 16 }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: '#1E293B', marginBottom: 6 }}>
                          📖 {sub.subject_name} ({sub.subject_code})
                        </Text>
                        {subEntries.length === 0 ? (
                          <Text style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>No classes assigned yet.</Text>
                        ) : (
                          subEntries.map((e) => (
                            <View key={e.id} style={styles.ttGroupRow}>
                              <Text style={{ fontWeight: '600', color: '#475569' }}>{e.day_of_week}: {e.time_slot}</Text>
                              <Text style={{ color: '#64748B' }}>{e.teacher_name} • {e.room}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* SUBTAB 3: TEACHER-WISE VIEW */}
              {timetableSubTab === 'teacher' && (
                <View style={styles.ttTableCard}>
                  <Text style={styles.ttGroupHeader}>Teacher-wise Assigned Schedule</Text>
                  {teachersList.map((tch) => {
                    const tchEntries = classTimetable.filter((t) => t.teacher_name === tch.full_name || t.teacher_code === tch.teacher_code);
                    return (
                      <View key={tch.id} style={{ marginBottom: 16 }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: '#1E293B', marginBottom: 6 }}>
                          👤 {tch.full_name} ({tch.department})
                        </Text>
                        {tchEntries.length === 0 ? (
                          <Text style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>No classes assigned yet.</Text>
                        ) : (
                          tchEntries.map((e) => (
                            <View key={e.id} style={styles.ttGroupRow}>
                              <Text style={{ fontWeight: '600', color: '#475569' }}>{e.day_of_week}: {e.time_slot}</Text>
                              <Text style={{ color: '#64748B' }}>{e.subject_name} • {e.room}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* SUBTAB 4: CLASS DIRECTORY VIEW */}
              {timetableSubTab === 'classes' && (
                <View>
                  <View style={styles.tabHeaderRow}>
                    <Text style={styles.tabHeaderTitle}>Classes Directory ({classesList.filter(c => selectedFilterBatchYear === 'All Batches' || (c.batch_year || 'Batch 2024') === selectedFilterBatchYear).length})</Text>
                    <TouchableOpacity style={styles.primaryAddBtn} onPress={openAddClassModal}>
                      <Text style={styles.primaryAddBtnText}>+ Create Class</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Batch Year Dropdown Filter for Classes */}
                  <View style={{ marginBottom: 12 }}>
                    <DropdownSelect
                      value={selectedFilterBatchYear}
                      options={['All Batches', ...BATCH_YEAR_OPTIONS]}
                      onSelect={(val) => setSelectedFilterBatchYear(val)}
                      placeholder="Filter by Admission Batch..."
                    />
                  </View>

                  <View style={styles.directoryListCard}>
                    {classesList
                      .filter(cls => selectedFilterBatchYear === 'All Batches' || (cls.batch_year || 'Batch 2024') === selectedFilterBatchYear)
                      .map((cls) => (
                      <View key={cls.id} style={styles.directoryItemFull}>
                        <View style={[styles.directoryAvatar, { backgroundColor: '#ECFDF5' }]}>
                          <Text style={[styles.directoryAvatarText, { color: '#059669' }]}>🏫</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.directoryName}>Class {cls.class_name}</Text>
                          <Text style={styles.directoryMeta}>{cls.department} • {cls.class_section || 'Section A'}</Text>
                          <Text style={styles.directoryMeta}>
                            🎓 Admission Batch: <Text style={styles.metaHighlight}>{cls.batch_year || 'Batch 2024'}</Text> • {cls.year_semester}
                          </Text>
                        </View>
                        <View style={styles.itemActionRow}>
                          <TouchableOpacity
                            style={styles.editBtnCircle}
                            onPress={() => openEditClassModal(cls)}
                          >
                            <Text style={styles.actionBtnIcon}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtnCircle}
                            onPress={() => handleDeleteClass(cls)}
                          >
                            <Text style={styles.actionBtnIcon}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })()}
      </ScrollView>

      {/* ================= MODALS WITH REAL COLLAPSIBLE DROPDOWN MENUS ================= */}

      {/* Student Form Modal */}
      <Modal visible={activeModal === 'studentForm'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={styles.modalContainerCard}>
              <Text style={styles.modalTitle}>
                {editingItem ? '✏️ Edit Student Profile' : '🎓 Add New Student'}
              </Text>

              <Text style={styles.inputLabel}>Student Roll No / ID Code</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. S001"
                value={studentCode}
                onChangeText={setStudentCode}
              />

              <Text style={styles.inputLabel}>Student Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Rohit Sharma"
                value={studentName}
                onChangeText={setStudentName}
              />

              <Text style={styles.inputLabel}>Student Email Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. rohit.sharma@svist.edu"
                keyboardType="email-address"
                value={studentEmail}
                onChangeText={setStudentEmail}
              />

              {/* Real Dropdown: Admission Batch Year Selector */}
              <DropdownSelect
                label="Admission Batch Year (Year of Admission)"
                value={studentBatchYear}
                options={BATCH_YEAR_OPTIONS}
                onSelect={(val) => setStudentBatchYear(val)}
              />

              {/* Real Dropdown 1: Year & Semester Selector */}
              <DropdownSelect
                label="Select Year & Semester"
                value={studentYearSem}
                options={YEAR_SEMESTER_OPTIONS}
                onSelect={(val) => setStudentYearSem(val)}
              />

              {/* Real Dropdown 2: Class Name Selector */}
              <DropdownSelect
                label="Select Class"
                value={studentClassName}
                options={(classesList.length > 0 ? classesList.map(c => ({ label: `🏫 Class ${c.class_name} (${c.department})`, value: c.class_name })) : ['CSE-A', 'CSE-B', 'CSE-C', 'ECE-A'])}
                onSelect={(val) => {
                  setStudentClassName(val);
                  const matched = classesList.find(c => c.class_name === val);
                  if (matched) setStudentClassId(matched.id);
                }}
              />

              {/* Real Dropdown 3: Mentor Teacher Selector */}
              <DropdownSelect
                label="Assign Mentor Teacher"
                value={teachersList.find(t => t.id === studentTeacherId)?.full_name || 'Select Teacher...'}
                options={teachersList.map(t => ({ label: `👨‍🏫 ${t.full_name} (${t.teacher_code})`, value: t.id }))}
                onSelect={(val) => setStudentTeacherId(val)}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveStudent}>
                  <Text style={styles.submitBtnText}>
                    {editingItem ? 'Update Student' : 'Save Student'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Teacher Form Modal */}
      <Modal visible={activeModal === 'teacherForm'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={styles.modalContainerCard}>
              <Text style={styles.modalTitle}>
                {editingItem ? '✏️ Edit Teacher Profile' : '👩‍🏫 Add New Teacher'}
              </Text>

              <Text style={styles.inputLabel}>Teacher Code / ID</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. T101"
                value={teacherCode}
                onChangeText={setTeacherCode}
              />

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Dr. Sarah Jenkins"
                value={teacherName}
                onChangeText={setTeacherName}
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. sarah.jenkins@svist.edu"
                keyboardType="email-address"
                value={teacherEmail}
                onChangeText={setTeacherEmail}
              />

              {/* Real Dropdown: Department */}
              <DropdownSelect
                label="Select Department / Branch"
                value={teacherDept}
                options={DEPARTMENT_OPTIONS}
                onSelect={(val) => setTeacherDept(val)}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveTeacher}>
                  <Text style={styles.submitBtnText}>
                    {editingItem ? 'Update Teacher' : 'Save Teacher'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Subject Form Modal */}
      <Modal visible={activeModal === 'subjectForm'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={styles.modalContainerCard}>
              <Text style={styles.modalTitle}>
                {editingItem ? '✏️ Edit Subject & Branch' : '📖 Add & Assign Subject'}
              </Text>

              <Text style={styles.inputLabel}>Subject Code</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. CS-301"
                value={subjectCode}
                onChangeText={setSubjectCode}
              />

              <Text style={styles.inputLabel}>Subject Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Data Structures & Algorithms"
                value={subjectName}
                onChangeText={setSubjectName}
              />

              {/* Real Dropdown: Assign Branch / Department */}
              <DropdownSelect
                label="Assign Branch / Department"
                value={subjectDept}
                options={DEPARTMENT_OPTIONS}
                onSelect={(val) => setSubjectDept(val)}
              />

              {/* Real Dropdown: Assign Year & Semester */}
              <DropdownSelect
                label="Assign Year & Semester"
                value={subjectYearSem}
                options={YEAR_SEMESTER_OPTIONS}
                onSelect={(val) => setSubjectYearSem(val)}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveSubject}>
                  <Text style={styles.submitBtnText}>
                    {editingItem ? 'Update Subject' : 'Assign & Save Subject'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Class Form Modal */}
      <Modal visible={activeModal === 'classForm'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={styles.modalContainerCard}>
              <Text style={styles.modalTitle}>
                {editingItem ? '✏️ Edit Class' : '🏫 Create New Class'}
              </Text>

              <Text style={styles.inputLabel}>Class Name Code</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. CSE-A"
                value={classNameInput}
                onChangeText={setClassNameInput}
              />

              {/* Real Dropdown: Department */}
              <DropdownSelect
                label="Department / Branch"
                value={classDeptInput}
                options={DEPARTMENT_OPTIONS}
                onSelect={(val) => setClassDeptInput(val)}
              />

              {/* Real Dropdown: Section */}
              <DropdownSelect
                label="Class Section"
                value={classSecInput}
                options={SECTION_OPTIONS}
                onSelect={(val) => setClassSecInput(val)}
              />

              {/* Real Dropdown: Admission Batch Year */}
              <DropdownSelect
                label="Admission Batch Year (Year Admitted)"
                value={classBatchYearInput}
                options={BATCH_YEAR_OPTIONS}
                onSelect={(val) => setClassBatchYearInput(val)}
              />

              {/* Real Dropdown: Year & Semester */}
              <DropdownSelect
                label="Year & Semester"
                value={classYearSemInput}
                options={YEAR_SEMESTER_OPTIONS}
                onSelect={(val) => setClassYearSemInput(val)}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveClass}>
                  <Text style={styles.submitBtnText}>
                    {editingItem ? 'Update Class' : 'Save Class'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Notice Form Modal */}
      <Modal visible={activeModal === 'publishNotice'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerCard}>
            <Text style={styles.modalTitle}>📢 Publish Campus Notice</Text>

            <Text style={styles.inputLabel}>Notice Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Mid-Semester Exam Schedule"
              value={noticeTitle}
              onChangeText={setNoticeTitle}
            />

            {/* Real Dropdown: Notice Category */}
            <DropdownSelect
              label="Notice Category"
              value={noticeCategory}
              options={['Academic', 'Events', 'Admin']}
              onSelect={(val) => setNoticeCategory(val)}
            />

            <Text style={styles.inputLabel}>Notice Announcement Text</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Enter announcement text..."
              multiline
              value={noticeContent}
              onChangeText={setNoticeContent}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handlePublishNotice}>
                <Text style={styles.submitBtnText}>Publish Notice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Timetable Entry Form Modal (Matching Screen 2 of Screenshot) */}
      <Modal visible={activeModal === 'timetableForm'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}>
            <View style={styles.modalContainerCard}>
              <View style={{ width: '100%', marginBottom: 12 }}>
                <Text style={styles.modalTitle}>
                  {editingItem ? '✏️ Edit Timetable Entry' : '➕ Add Timetable Entry'}
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: -4 }}>
                  Create or edit a class schedule entry
                </Text>
              </View>

              {/* Academic Year * */}
              <DropdownSelect
                label="Academic Year *"
                value={scheduleAcadYear}
                options={ACADEMIC_YEAR_OPTIONS}
                onSelect={(val) => setScheduleAcadYear(val)}
              />

              {/* Semester * */}
              <DropdownSelect
                label="Semester *"
                value={scheduleSem}
                options={SEMESTER_OPTIONS}
                onSelect={(val) => setScheduleSem(val)}
              />

              {/* Class * */}
              <DropdownSelect
                label="Class (Assigned Batch & Department) *"
                value={scheduleClassName}
                options={classesList.length > 0 ? classesList.map((c) => ({ label: `🏫 Class ${c.class_name} • ${c.batch_year || 'Batch 2024'} (${c.department})`, value: c.class_name })) : ['CSE-A', 'CSE-B', 'CSE-C', 'ECE-A']}
                onSelect={(val, label) => {
                  setScheduleClassName(val);
                  const foundCls = classesList.find((c) => c.class_name === val);
                  if (foundCls) setScheduleClassId(foundCls.id);
                }}
              />

              {/* Subject * */}
              <DropdownSelect
                label="Subject *"
                value={scheduleSubjectObj ? `${scheduleSubjectObj.subject_name} (${scheduleSubjectObj.subject_code || 'CS201'})` : 'Select Subject...'}
                options={subjectsList.length > 0 ? subjectsList.map((s) => ({ label: `${s.subject_name} (${s.subject_code})`, value: s.id })) : [
                  { label: 'Data Structures and Algorithms (CS201)', value: 'sub-1' },
                  { label: 'Database Management Systems (CS304)', value: 'sub-2' },
                  { label: 'Computer Networks (CS402)', value: 'sub-3' },
                  { label: 'Operating Systems (CS302)', value: 'sub-4' },
                  { label: 'Software Engineering (CS305)', value: 'sub-5' },
                ]}
                onSelect={(val, label) => {
                  const subObj = subjectsList.find((s) => s.id === val) || {
                    id: val,
                    subject_name: label.split('(')[0].trim(),
                    subject_code: label.includes('(') ? label.split('(')[1].replace(')', '').trim() : 'CS201',
                    department: 'Computer Science',
                    credits: 4,
                  };
                  setScheduleSubjectId(val);
                  setScheduleSubjectObj(subObj);
                }}
              />

              {/* Subject Details Preview Card */}
              {scheduleSubjectObj && (
                <View style={styles.ttDetailPreviewBox}>
                  <Text style={styles.ttDetailPreviewMeta}>
                    Subject Code: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{scheduleSubjectObj.subject_code || 'CS201'}</Text>
                    {'    '}Credits: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{scheduleSubjectObj.credits || 4}</Text>
                  </Text>
                  <Text style={styles.ttDetailPreviewMeta}>
                    Department: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{scheduleSubjectObj.department || 'Computer Science'}</Text>
                    {'    '}Type: <Text style={{ fontWeight: '700', color: '#1E293B' }}>Core</Text>
                  </Text>
                </View>
              )}

              {/* Teacher * */}
              <DropdownSelect
                label="Teacher *"
                value={scheduleTeacherObj ? `${scheduleTeacherObj.full_name} (${scheduleTeacherObj.teacher_code || 'T023'})` : 'Select Teacher...'}
                options={teachersList.length > 0 ? teachersList.map((t) => ({ label: `${t.full_name} (${t.teacher_code || 'T001'})`, value: t.id })) : [
                  { label: 'Prof. Sarah Jenkins (T023)', value: 't-1' },
                  { label: 'Prof. A. Kumar (T012)', value: 't-2' },
                  { label: 'Prof. R. Singh (T045)', value: 't-3' },
                  { label: 'Prof. M. Patel (T018)', value: 't-4' },
                  { label: 'Prof. K. Sharma (T029)', value: 't-5' },
                ]}
                onSelect={(val, label) => {
                  const teacherObj = teachersList.find((t) => t.id === val) || {
                    id: val,
                    full_name: label.split('(')[0].trim(),
                    teacher_code: label.includes('(') ? label.split('(')[1].replace(')', '').trim() : 'T023',
                    email: 'teacher@svist.edu',
                    department: 'CSE',
                    designation: 'Professor',
                  };
                  setScheduleTeacherId(val);
                  setScheduleTeacherObj(teacherObj);
                }}
              />

              {/* Teacher Details Preview Card */}
              {scheduleTeacherObj && (
                <View style={styles.ttDetailPreviewBox}>
                  <Text style={styles.ttDetailPreviewMeta}>
                    Email: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{scheduleTeacherObj.email || 'teacher@svist.edu'}</Text>
                  </Text>
                  <Text style={styles.ttDetailPreviewMeta}>
                    Department: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{scheduleTeacherObj.department || 'CSE'}</Text>
                    {'    '}Designation: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{scheduleTeacherObj.designation || 'Professor'}</Text>
                  </Text>
                </View>
              )}

              {/* Room / Classroom * & Day * (Side by Side) */}
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <DropdownSelect
                    label="Room / Classroom *"
                    value={scheduleRoom}
                    options={ROOM_OPTIONS}
                    onSelect={(val) => setScheduleRoom(val)}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <DropdownSelect
                    label="Day *"
                    value={scheduleDay}
                    options={DAY_OPTIONS}
                    onSelect={(val) => setScheduleDay(val)}
                  />
                </View>
              </View>

              {/* Class Timing *: Start Time & End Time */}
              <Text style={styles.inputLabel}>Class Timing *</Text>
              <View style={{ flexDirection: 'row', width: '100%', marginBottom: 8 }}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <DropdownSelect
                    label="Start Time"
                    value={scheduleStartTime}
                    options={TIME_SLOT_START_OPTIONS}
                    onSelect={(val) => setScheduleStartTime(val)}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <DropdownSelect
                    label="End Time"
                    value={scheduleEndTime}
                    options={TIME_SLOT_END_OPTIONS}
                    onSelect={(val) => setScheduleEndTime(val)}
                  />
                </View>
              </View>

              {/* Additional Notes (Optional) */}
              <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Any special instructions for this class..."
                placeholderTextColor="#94A3B8"
                multiline
                value={scheduleNotes}
                onChangeText={setScheduleNotes}
              />

              {/* Action Buttons: Cancel | Add to Timetable */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.ttAddSubmitBtn} onPress={handleSaveTimetable}>
                  <Text style={styles.ttAddSubmitBtnText}>
                    📅 {editingItem ? 'Update Timetable' : 'Add to Timetable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNavBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.navTabItem} onPress={() => setActiveTab('dashboard')}>
          <Text style={styles.navTabIcon}>🏠</Text>
          <Text style={[styles.navTabLabel, activeTab === 'dashboard' && styles.navTabLabelActive]}>
            Dashboard
          </Text>
          {activeTab === 'dashboard' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabItem} onPress={() => setActiveTab('students')}>
          <Text style={styles.navTabIcon}>👥</Text>
          <Text style={[styles.navTabLabel, activeTab === 'students' && styles.navTabLabelActive]}>
            Students
          </Text>
          {activeTab === 'students' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabItem} onPress={() => setActiveTab('teachers')}>
          <Text style={styles.navTabIcon}>👤</Text>
          <Text style={[styles.navTabLabel, activeTab === 'teachers' && styles.navTabLabelActive]}>
            Teachers
          </Text>
          {activeTab === 'teachers' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabItem} onPress={() => setActiveTab('subjects')}>
          <Text style={styles.navTabIcon}>📖</Text>
          <Text style={[styles.navTabLabel, activeTab === 'subjects' && styles.navTabLabelActive]}>
            Subjects
          </Text>
          {activeTab === 'subjects' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabItem} onPress={() => setActiveTab('timetable')}>
          <Text style={styles.navTabIcon}>📅</Text>
          <Text style={[styles.navTabLabel, activeTab === 'timetable' && styles.navTabLabelActive]}>
            Classes
          </Text>
          {activeTab === 'timetable' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuIconButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 22,
    color: '#334155',
  },
  appTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  headerAppTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#A855F7',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeCrown: {
    fontSize: 11,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E22CE',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 6,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#7E22CE',
    fontWeight: '600',
  },
  toastBanner: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  welcomeHeroCard: {
    backgroundColor: '#8B2FC9',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  welcomeLeftContent: {
    flex: 1,
  },
  welcomeHandText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  welcomeAdminTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  welcomeSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  welcomeRightContent: {
    alignItems: 'flex-end',
  },
  heroDateText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  heroTimeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stats2x2Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  statBoxCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statBoxEmoji: {
    fontSize: 13,
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  statBoxTrend: {
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeadingWrapper: {
    marginBottom: 10,
  },
  mainSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainSectionSubTitle: {
    fontSize: 11,
    color: '#64748B',
  },
  managementGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  mgmtCard2Col: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minHeight: 100,
  },
  mgmtCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mgmtIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mgmtIconText: {
    fontSize: 13,
  },
  mgmtTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },
  mgmtChevron: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  mgmtDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13,
  },
  bottomColumnsWrapper: {
    gap: 14,
  },
  activitiesColumnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  columnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E22CE',
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activityIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activityEmoji: {
    fontSize: 13,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityMainTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  activitySubTitle: {
    fontSize: 10,
    color: '#64748B',
  },
  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  quickActionsColumnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickActions2x2Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 10,
  },
  quickActionBox: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  wideQuickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
    gap: 6,
  },
  wideBtnIcon: {
    fontSize: 15,
  },
  wideBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabContentContainer: {
    paddingTop: 4,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tabHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  primaryAddBtn: {
    backgroundColor: '#7E22CE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  primaryAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  directoryListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  directoryItemFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  directoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  directoryAvatarText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 13,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  codeTag: {
    fontSize: 11,
    color: '#7E22CE',
    fontWeight: '700',
  },
  directoryMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  metaHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  attQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  attLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  attPresentBtn: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  attPresentText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 10,
  },
  attAbsentBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  attAbsentText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 10,
  },
  actionRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  directoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  directoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: {
    fontSize: 11,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: 20,
    fontSize: 12,
  },

  /* Collapsible Dropdown Component Styles */
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownSelectBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelectBoxActive: {
    borderColor: '#7E22CE',
    backgroundColor: '#FFFFFF',
  },
  dropdownSelectText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  dropdownChevron: {
    fontSize: 11,
    color: '#7E22CE',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dropdownMenuWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7E22CE',
    borderRadius: 10,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#7E22CE',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownMenuItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  dropdownMenuItemText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownMenuItemTextSelected: {
    color: '#7E22CE',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainerCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  submitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#7E22CE',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  navTabItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navTabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  navTabLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  navTabLabelActive: {
    color: '#7E22CE',
    fontWeight: '800',
  },
  activeTabIndicator: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7E22CE',
    marginTop: 2,
  },
  filterDropdownsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 10,
  },

  /* ================= TIMETABLE STYLES ================= */
  ttBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ttBannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ttBannerIcon: {
    fontSize: 22,
  },
  ttBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ttBannerSubtitle: {
    fontSize: 12,
    color: '#E9D5FF',
    marginTop: 2,
  },
  ttFiltersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    zIndex: 20,
  },
  ttStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  ttStatCard: {
    width: (width - 48) / 2,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  ttStatIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  ttStatValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  ttStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  ttViewTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  ttViewTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  ttViewTabBtnActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  ttViewTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  ttViewTabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ttDayControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  ttDayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  ttDayPillActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  ttDayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  ttDayPillTextActive: {
    color: '#FFFFFF',
  },
  ttAddClassPurpleBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 6,
  },
  ttAddClassPurpleBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  ttTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ttTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  ttTableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  ttTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    position: 'relative',
    paddingLeft: 10,
  },
  ttAccentBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 4,
    borderRadius: 2,
  },
  ttTimeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  ttSubjectTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  ttSubCodeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  ttTeacherName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  ttRoomBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  ttRoomBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  ttActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 55,
    gap: 4,
  },
  ttGroupHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  ttGroupRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ttDetailPreviewBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    marginTop: -4,
  },
  ttDetailPreviewMeta: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 1,
  },
  ttAddSubmitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ttAddSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
