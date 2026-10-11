import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getDynamicDateTime,
  getAllStudentsFromSupabase,
  getNoticesFromSupabase,
  markAttendanceInSupabase,
} from '../../../src/services/supabaseService';

const { width } = Dimensions.get('window');

/**
 * Reusable Dropdown Select Menu Component for Teacher Dashboard
 */
function DropdownSelect({ label, value, options, onSelect, placeholder = 'Select option...' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
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

const TEACHER_CLASS_OPTIONS = [
  'CSE-2A (Batch 2024) | Data Structures & Algorithms',
  'CSE-2B (Batch 2024) | Database Management Systems',
  'CSE-2C (Batch 2024) | Computer Networks',
  'ECE-1A (Batch 2025) | Digital Electronics',
];

const CAMPUS_SERVICE_OPTIONS = [
  '💳 Digital ID Pass - Gate & Library Access',
  '🚌 Shuttle Tracker - Bus #4 (3 mins away)',
  '🍱 Cafeteria Portal - Queue Light (5m)',
  '📚 Library Access - E-Resources & Books',
];

export default function TeacherDashboard({ onLogout }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('home');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown Selection States
  const [selectedClassOption, setSelectedClassOption] = useState('CSE-2A (Batch 2024) | Data Structures & Algorithms');
  const [selectedCampusService, setSelectedCampusService] = useState('💳 Digital ID Pass - Gate & Library Access');

  // Check-In State for Current Class
  const [isCheckedIn, setIsCheckedIn] = useState(true); // Default true as in design screenshot
  const [checkInTime, setCheckInTime] = useState('10:05 AM');

  // Modals state
  const [showRemainingClassesModal, setShowRemainingClassesModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);

  // Class & Student Data State
  const [studentsList, setStudentsList] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { studentId: 'Present' | 'Absent' }
  const [notices, setNotices] = useState([]);

  // Current Class Details derived from Dropdown selection
  const currentClass = {
    subject: selectedClassOption.split('|')[1]?.trim() || 'Data Structures & Algorithms',
    code: 'CS-301',
    room: 'Room 402',
    className: selectedClassOption.split('|')[0]?.trim() || 'CSE-2A (Batch 2024)',
    batchYear: selectedClassOption.includes('Batch') ? (selectedClassOption.match(/Batch \d{4}/)?.[0] || 'Batch 2024') : 'Batch 2024',
    totalStudents: 62,
    timeSlot: '10:00 - 11:30 AM',
  };

  // Today's Remaining Classes
  const remainingClasses = [
    {
      id: '1',
      time: '12:00 - 01:30 PM',
      room: 'Room 305',
      subject: 'Database Management Systems',
      classInfo: 'CSE-2B • Batch 2024 (58 students)',
      status: 'Upcoming',
      color: '#3B82F6',
    },
    {
      id: '2',
      time: '02:00 - 03:30 PM',
      room: 'Room 201',
      subject: 'Computer Networks',
      classInfo: 'CSE-2A • Batch 2024 (60 students)',
      status: 'Upcoming',
      color: '#F59E0B',
    },
    {
      id: '3',
      time: '04:00 - 05:00 PM',
      room: 'Room 105',
      subject: 'Mentor Meeting',
      classInfo: 'Batch 2024 (All Sections)',
      status: 'Upcoming',
      color: '#8B5CF6',
    },
  ];

  const { date: currentDate, time: currentTime } = getDynamicDateTime();

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setIsLoading(true);
    try {
      const [students, noticesData] = await Promise.all([
        getAllStudentsFromSupabase(),
        getNoticesFromSupabase(),
      ]);

      if (students && students.length > 0) {
        setStudentsList(students);
        // Initialize default attendance state to 'Present' for all students
        const initialAtt = {};
        students.forEach((s) => {
          initialAtt[s.id] = 'Present';
        });
        setAttendanceState(initialAtt);
      } else {
        // Fallback mockup list if database is initializing
        const mockList = [
          { id: 'S001', student_code: 'S001', full_name: 'Rohit Sharma', attendance_percentage: 88 },
          { id: 'S002', student_code: 'S002', full_name: 'Aarav Patel', attendance_percentage: 92 },
          { id: 'S003', student_code: 'S003', full_name: 'Priya Verma', attendance_percentage: 95 },
          { id: 'S004', student_code: 'S004', full_name: 'Aniket Roy', attendance_percentage: 78 },
          { id: 'S005', student_code: 'S005', full_name: 'Sneha Reddy', attendance_percentage: 91 },
        ];
        setStudentsList(mockList);
        const initialAtt = {};
        mockList.forEach((s) => {
          initialAtt[s.id] = 'Present';
        });
        setAttendanceState(initialAtt);
      }

      if (noticesData && noticesData.length > 0) {
        setNotices(noticesData);
      }
    } catch (e) {
      console.warn('Teacher load error:', e.message);
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

  // Check In / Check Out Handler
  const handleToggleCheckIn = () => {
    if (isCheckedIn) {
      Alert.alert(
        'End Class Session',
        'Are you sure you want to end your current class session?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Class',
            style: 'destructive',
            onPress: () => {
              setIsCheckedIn(false);
              showToast('⏹️ Class session ended.');
            },
          },
        ]
      );
    } else {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsCheckedIn(true);
      setCheckInTime(nowStr);
      showToast(`🟢 You have checked into ${currentClass.subject}!`);
    }
  };

  // Open Attendance Sheet with Check-In Validation
  const handleOpenAttendanceSheet = () => {
    if (!isCheckedIn) {
      Alert.alert(
        'Check-In Required',
        'You must first verify and check into the class before taking attendance.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Check In Now', onPress: handleToggleCheckIn },
        ]
      );
      return;
    }
    setShowAttendanceModal(true);
  };

  // Toggle student attendance (Present / Absent)
  const toggleStudentStatus = (studentId) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  // Submit Class Attendance to Database
  const handleSubmitAttendanceSheet = async () => {
    setIsLoading(true);
    let successCount = 0;

    for (const student of studentsList) {
      const status = attendanceState[student.id] || 'Present';
      const res = await markAttendanceInSupabase(student.id, 'CSUB1', status);
      if (res.success) successCount++;
    }

    setIsLoading(false);
    setShowAttendanceModal(false);
    showToast(`✅ Attendance recorded for ${studentsList.length} students of ${currentClass.className}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header App Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>SJ</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>Welcome back 👋 (Teacher)</Text>
              <Text style={styles.userName}>Prof. Sarah Jenkins</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Text style={styles.logoutBtnText}>Logout 🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Loading Bar */}
      {isLoading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#7E22CE" />
          <Text style={styles.loadingText}>Syncing class data with Supabase...</Text>
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
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'home' && (
          <>
            {/* Top 4 Stats Cards Row */}
            <View style={styles.statsGrid4Col}>
              {/* Stat 1: Classes Taken */}
              <View style={styles.statCardBox}>
                <Text style={styles.statEmojiIcon}>📊</Text>
                <Text style={[styles.statValueText, { color: '#10B981' }]}>98.5%</Text>
                <Text style={styles.statLabelText}>Classes Taken</Text>
              </View>

              {/* Stat 2: Assigned Courses */}
              <View style={styles.statCardBox}>
                <Text style={styles.statEmojiIcon}>🎓</Text>
                <Text style={[styles.statValueText, { color: '#7E22CE' }]}>4 Subjects</Text>
                <Text style={styles.statLabelText}>Assigned Courses</Text>
              </View>

              {/* Stat 3: Classes Today */}
              <View style={styles.statCardBox}>
                <Text style={styles.statEmojiIcon}>👥</Text>
                <Text style={[styles.statValueText, { color: '#2563EB' }]}>2 Classes</Text>
                <Text style={styles.statLabelText}>Today</Text>
              </View>

              {/* Stat 4: Remaining Classes */}
              <TouchableOpacity
                style={styles.statCardBox}
                onPress={() => setShowRemainingClassesModal(true)}
              >
                <Text style={styles.statEmojiIcon}>📅</Text>
                <Text style={[styles.statValueText, { color: '#D97706' }]}>3 Left</Text>
                <Text style={styles.statLabelText}>Classes Remaining</Text>
              </TouchableOpacity>
            </View>

            {/* Current Class Hero Banner Card ("Happening Now") */}
            <View style={styles.heroClassBannerCard}>
              {/* Dropdown Select Menu for Active Class & Subject */}
              <View style={{ marginBottom: 12 }}>
                <DropdownSelect
                  label="Select Active Class & Subject"
                  value={selectedClassOption}
                  options={TEACHER_CLASS_OPTIONS}
                  onSelect={(val) => setSelectedClassOption(val)}
                />
              </View>

              {/* Top Banner Row */}
              <View style={styles.bannerHeaderRow}>
                <View style={styles.liveHappeningBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveHappeningBadgeText}>HAPPENING NOW</Text>
                </View>

                {/* Option to View How Many More Classes Are Left Today */}
                <TouchableOpacity
                  style={styles.moreClassesPillBtn}
                  onPress={() => setShowRemainingClassesModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moreClassesPillText}>2 more classes today ›</Text>
                </TouchableOpacity>
              </View>

              {/* Class Title & Details */}
              <Text style={styles.heroClassTitle}>{currentClass.subject}</Text>
              <View style={styles.heroClassMetaRow}>
                <Text style={styles.heroClassMetaItem}>📍 {currentClass.room}</Text>
                <Text style={styles.heroClassMetaDot}>•</Text>
                <Text style={styles.heroClassMetaItem}>👥 {currentClass.className} ({currentClass.totalStudents} students)</Text>
                <Text style={styles.heroClassMetaDot}>•</Text>
                <Text style={styles.heroClassMetaItem}>⏰ {currentClass.timeSlot}</Text>
              </View>

              {/* Teacher In-Class Status & Check-In Box */}
              <View style={styles.teacherCheckInBox}>
                <View style={styles.checkInStatusRow}>
                  <View style={styles.greenCheckDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checkInStatusTitle}>
                      {isCheckedIn ? 'You are currently in this class' : 'Are you currently in this class?'}
                    </Text>
                    <Text style={styles.checkInStatusSub}>
                      {isCheckedIn ? `Class started at ${checkInTime}` : 'Tap button to check in & enable attendance'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.toggleCheckInBtn,
                      isCheckedIn ? styles.endClassBtnStyle : styles.startClassBtnStyle,
                    ]}
                    onPress={handleToggleCheckIn}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.toggleCheckInBtnText,
                        isCheckedIn ? styles.endClassBtnText : styles.startClassBtnText,
                      ]}
                    >
                      {isCheckedIn ? '🔴 End Class' : '🟢 Start Class'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.heroActionButtonsRow}>
                {/* Take Attendance Button */}
                <TouchableOpacity
                  style={[
                    styles.takeAttendanceMainBtn,
                    !isCheckedIn && styles.btnDisabledStyle,
                  ]}
                  onPress={handleOpenAttendanceSheet}
                  activeOpacity={0.85}
                >
                  <Text style={styles.takeAttendanceBtnText}>👥 Take Attendance</Text>
                </TouchableOpacity>

                {/* View Class Details Button */}
                <TouchableOpacity
                  style={styles.viewDetailsMainBtn}
                  onPress={() => setShowClassDetailsModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewDetailsBtnText}>📄 View Class Details</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Today's Class Schedule Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleText}>Today's Class Schedule</Text>
              <TouchableOpacity onPress={() => setActiveTab('schedule')}>
                <Text style={styles.viewScheduleLinkText}>View Full Schedule ›</Text>
              </TouchableOpacity>
            </View>

            {/* Today's Schedule Cards List */}
            <View style={styles.scheduleListContainer}>
              {/* Item 1: In Progress */}
              <View style={styles.scheduleItemCard}>
                <View style={[styles.statusStripIndicator, { backgroundColor: '#10B981' }]} />
                <View style={styles.scheduleItemBody}>
                  <View style={styles.scheduleTopRow}>
                    <Text style={styles.scheduleTimeText}>🟢 10:00 - 11:30 AM</Text>
                    <View style={styles.inProgressBadge}>
                      <Text style={styles.inProgressBadgeText}>In Progress</Text>
                    </View>
                  </View>
                  <Text style={styles.scheduleRoomText}>Room 402</Text>
                  <Text style={styles.scheduleSubjectTitle}>Data Structures & Algorithms</Text>
                  <Text style={styles.scheduleClassMeta}>CSE-2A (62 students)</Text>
                </View>
              </View>

              {/* Item 2: Upcoming */}
              {remainingClasses.map((item) => (
                <View key={item.id} style={styles.scheduleItemCard}>
                  <View style={[styles.statusStripIndicator, { backgroundColor: item.color }]} />
                  <View style={styles.scheduleItemBody}>
                    <View style={styles.scheduleTopRow}>
                      <Text style={styles.scheduleTimeText}>{item.time}</Text>
                      <View style={styles.upcomingBadge}>
                        <Text style={styles.upcomingBadgeText}>Upcoming</Text>
                      </View>
                    </View>
                    <Text style={styles.scheduleRoomText}>{item.room}</Text>
                    <Text style={styles.scheduleSubjectTitle}>{item.subject}</Text>
                    <Text style={styles.scheduleClassMeta}>{item.classInfo}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Campus Services Dropdown Select */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleText}>Campus Services</Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <DropdownSelect
                label="Select Campus Service Portal"
                value={selectedCampusService}
                options={CAMPUS_SERVICE_OPTIONS}
                onSelect={(val) => {
                  setSelectedCampusService(val);
                  if (val.includes('Digital ID')) setShowIdModal(true);
                  else showToast(`Opening ${val}...`);
                }}
              />
            </View>

            {/* Latest Announcements */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleText}>Latest Announcements</Text>
              <TouchableOpacity onPress={() => setActiveTab('notices')}>
                <Text style={styles.viewScheduleLinkText}>See All ›</Text>
              </TouchableOpacity>
            </View>
            {notices.slice(0, 2).map((item) => (
              <View key={item.id} style={styles.noticeCardItem}>
                <View style={styles.noticeTopMetaRow}>
                  <View style={styles.noticeCategoryPill}>
                    <Text style={styles.noticeCategoryText}>{item.category}</Text>
                  </View>
                  <Text style={styles.noticeDateText}>{item.date_label || '10 mins ago'}</Text>
                </View>
                <Text style={styles.noticeTitleText}>{item.title}</Text>
                <Text style={styles.noticeContentText}>{item.content}</Text>
              </View>
            ))}
          </>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <View style={styles.tabContainerSection}>
            <Text style={styles.sectionTitleText}>Master Class Schedule</Text>
            {remainingClasses.map((cls) => (
              <View key={cls.id} style={styles.scheduleItemCard}>
                <View style={[styles.statusStripIndicator, { backgroundColor: cls.color }]} />
                <View style={styles.scheduleItemBody}>
                  <Text style={styles.scheduleTimeText}>{cls.time}</Text>
                  <Text style={styles.scheduleSubjectTitle}>{cls.subject}</Text>
                  <Text style={styles.scheduleClassMeta}>{cls.room} • {cls.classInfo}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <View style={styles.tabContainerSection}>
            <Text style={styles.sectionTitleText}>Campus Announcements</Text>
            {notices.map((item) => (
              <View key={item.id} style={styles.noticeCardItem}>
                <View style={styles.noticeTopMetaRow}>
                  <View style={styles.noticeCategoryPill}>
                    <Text style={styles.noticeCategoryText}>{item.category}</Text>
                  </View>
                  <Text style={styles.noticeDateText}>{item.date_label || 'Today'}</Text>
                </View>
                <Text style={styles.noticeTitleText}>{item.title}</Text>
                <Text style={styles.noticeContentText}>{item.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View style={styles.tabContainerSection}>
            <View style={styles.profileBoxCard}>
              <View style={styles.largeProfileAvatar}>
                <Text style={styles.largeProfileAvatarText}>SJ</Text>
              </View>
              <Text style={styles.profileNameText}>Prof. Sarah Jenkins</Text>
              <Text style={styles.profileSubText}>Staff ID: T101 • Computer Science & Engineering</Text>
              <TouchableOpacity style={styles.showPassBtn} onPress={() => setShowIdModal(true)}>
                <Text style={styles.showPassBtnText}>Show Digital Campus Pass</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= MODALS ================= */}

      {/* Modal 1: Remaining Classes Today Modal */}
      <Modal visible={showRemainingClassesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>📅 Remaining Classes Today</Text>
              <TouchableOpacity onPress={() => setShowRemainingClassesModal(false)}>
                <Text style={styles.closeModalCross}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {remainingClasses.map((item) => (
                <View key={item.id} style={styles.remainingClassItem}>
                  <View style={[styles.timeBadgeBox, { backgroundColor: item.color }]}>
                    <Text style={styles.timeBadgeText}>{item.time.split('-')[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.remainingSubjectTitle}>{item.subject}</Text>
                    <Text style={styles.remainingMetaText}>📍 {item.room} • 👥 {item.classInfo}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeModalPillBtn} onPress={() => setShowRemainingClassesModal(false)}>
              <Text style={styles.closeModalPillText}>Close Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Student Attendance Sheet Modal (For Specific Class) */}
      <Modal visible={showAttendanceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCardFull}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitleText}>👥 Class Student Attendance Sheet</Text>
                <Text style={styles.modalSubText}>Class: {currentClass.className} • 🎓 {currentClass.batchYear} • {currentClass.subject}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <Text style={styles.closeModalCross}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Attendance List Header */}
            <View style={styles.attListHeaderRow}>
              <Text style={styles.attColName}>STUDENT NAME</Text>
              <Text style={styles.attColStatus}>STATUS (TAP TO TOGGLE)</Text>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {studentsList.map((st) => {
                const status = attendanceState[st.id] || 'Present';
                const isPresent = status === 'Present';
                return (
                  <View key={st.id} style={styles.studentAttRow}>
                    <View style={styles.studentAttAvatar}>
                      <Text style={styles.studentAttAvatarText}>
                        {st.full_name ? st.full_name.substring(0, 2).toUpperCase() : 'ST'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentAttName}>{st.full_name}</Text>
                      <Text style={styles.studentAttCode}>Roll: {st.student_code}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.statusTogglePill,
                        isPresent ? styles.presentPillStyle : styles.absentPillStyle,
                      ]}
                      onPress={() => toggleStudentStatus(st.id)}
                    >
                      <Text
                        style={[
                          styles.statusToggleText,
                          isPresent ? styles.presentTextStyle : styles.absentTextStyle,
                        ]}
                      >
                        {isPresent ? '✓ Present' : '✕ Absent'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.cancelAttBtn}
                onPress={() => setShowAttendanceModal(false)}
              >
                <Text style={styles.cancelAttBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitAttBtn}
                onPress={handleSubmitAttendanceSheet}
              >
                <Text style={styles.submitAttBtnText}>Submit Class Attendance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: View Class Details Modal */}
      <Modal visible={showClassDetailsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>📄 Class & Syllabus Details</Text>
              <TouchableOpacity onPress={() => setShowClassDetailsModal(false)}>
                <Text style={styles.closeModalCross}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailsBodyBox}>
              <Text style={styles.detailsSubjectText}>{currentClass.subject} ({currentClass.code})</Text>
              <Text style={styles.detailsItemText}>• Class: {currentClass.className}</Text>
              <Text style={styles.detailsItemText}>• Assigned Room: {currentClass.room}</Text>
              <Text style={styles.detailsItemText}>• Total Enrolled: {currentClass.totalStudents} Students</Text>
              <Text style={styles.detailsItemText}>• Scheduled Time: {currentClass.timeSlot}</Text>
              <Text style={styles.detailsItemText}>• Current Topic: Graphs & Tree Traversal Algorithms</Text>
            </View>
            <TouchableOpacity style={styles.closeModalPillBtn} onPress={() => setShowClassDetailsModal(false)}>
              <Text style={styles.closeModalPillText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Digital Pass Modal */}
      <Modal visible={showIdModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.idCardModal}>
            <View style={styles.idModalHeader}>
              <Text style={styles.idModalTitle}>SMART CAMPUS FACULTY PASS</Text>
              <TouchableOpacity onPress={() => setShowIdModal(false)}>
                <Text style={styles.closeModalCross}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.idCardContent}>
              <View style={styles.idPhotoBox}>
                <Text style={styles.idPhotoText}>SJ</Text>
              </View>
              <Text style={styles.idCardName}>Prof. Sarah Jenkins</Text>
              <Text style={styles.idCardDept}>Computer Science & Eng.</Text>
              <Text style={styles.idCardNum}>Staff ID: T101</Text>
              <View style={styles.validBox}>
                <Text style={styles.validText}>STATUS: ACTIVE FACULTY MEMBER</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('schedule')}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={[styles.navLabel, activeTab === 'schedule' && styles.navActive]}>Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setShowIdModal(true)}>
          <View style={styles.centerNavBtn}>
            <Text style={styles.centerNavIcon}>🪪</Text>
          </View>
          <Text style={styles.navLabel}>ID Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('notices')}>
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={[styles.navLabel, activeTab === 'notices' && styles.navActive]}>Notices</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navActive]}>Profile</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#7E22CE',
    fontWeight: 'bold',
    fontSize: 15,
  },
  greetingText: {
    fontSize: 11,
    color: '#64748B',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 6,
    gap: 6,
  },
  loadingText: {
    fontSize: 11,
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
  contentScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  statsGrid4Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
  },
  statCardBox: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  statEmojiIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValueText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabelText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  heroClassBannerCard: {
    backgroundColor: '#8B2FC9',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveHappeningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveHappeningBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moreClassesPillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  moreClassesPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroClassTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroClassMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  heroClassMetaItem: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  heroClassMetaDot: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  teacherCheckInBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  checkInStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenCheckDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  checkInStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkInStatusSub: {
    fontSize: 10,
    color: '#64748B',
  },
  toggleCheckInBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  startClassBtnStyle: {
    backgroundColor: '#DCFCE7',
  },
  endClassBtnStyle: {
    backgroundColor: '#FEE2E2',
  },
  toggleCheckInBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  startClassBtnText: {
    color: '#15803D',
  },
  endClassBtnText: {
    color: '#DC2626',
  },
  heroActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  takeAttendanceMainBtn: {
    flex: 1,
    backgroundColor: '#7E22CE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  takeAttendanceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  btnDisabledStyle: {
    opacity: 0.6,
  },
  viewDetailsMainBtn: {
    flex: 1,
    backgroundColor: '#F3E8FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDetailsBtnText: {
    color: '#7E22CE',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewScheduleLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E22CE',
  },
  scheduleListContainer: {
    gap: 10,
    marginBottom: 20,
  },
  scheduleItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  statusStripIndicator: {
    width: 5,
  },
  scheduleItemBody: {
    flex: 1,
    padding: 12,
  },
  scheduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  inProgressBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inProgressBadgeText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 10,
  },
  upcomingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  upcomingBadgeText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 10,
  },
  scheduleRoomText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  scheduleSubjectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  scheduleClassMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  servicesHorizontalScroll: {
    marginBottom: 20,
  },
  serviceBoxCard: {
    width: 125,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  serviceBoxIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  serviceBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  serviceBoxSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  noticeCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  noticeTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeCategoryPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noticeCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E22CE',
  },
  noticeDateText: {
    fontSize: 10,
    color: '#64748B',
  },
  noticeTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  noticeContentText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  tabContainerSection: {
    paddingTop: 4,
  },
  profileBoxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  largeProfileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7E22CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  largeProfileAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14,
  },
  showPassBtn: {
    backgroundColor: '#7E22CE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  showPassBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContentCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  modalContentCardFull: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeModalCross: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  remainingClassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  timeBadgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  remainingSubjectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  remainingMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  closeModalPillBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  closeModalPillText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
  },
  attListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  attColName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  attColStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  studentAttRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentAttAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  studentAttAvatarText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 12,
  },
  studentAttName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentAttCode: {
    fontSize: 10,
    color: '#64748B',
  },
  statusTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  presentPillStyle: {
    backgroundColor: '#DCFCE7',
  },
  absentPillStyle: {
    backgroundColor: '#FEE2E2',
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presentTextStyle: {
    color: '#15803D',
  },
  absentTextStyle: {
    color: '#DC2626',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  cancelAttBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelAttBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  submitAttBtn: {
    backgroundColor: '#7E22CE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitAttBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  detailsBodyBox: {
    gap: 8,
    marginVertical: 10,
  },
  detailsSubjectText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7E22CE',
  },
  detailsItemText: {
    fontSize: 12,
    color: '#334155',
  },
  idCardModal: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
  },
  idModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  idModalTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  idCardContent: {
    alignItems: 'center',
  },
  idPhotoBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7E22CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  idPhotoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  idCardName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  idCardDept: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  idCardNum: {
    color: '#C084FC',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  validBox: {
    backgroundColor: '#065F46',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  validText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  navActive: {
    color: '#7E22CE',
    fontWeight: '800',
  },
  centerNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7E22CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  centerNavIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dropdownContainer: {
    marginBottom: 10,
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  dropdownSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownSelectBoxActive: {
    borderColor: '#7E22CE',
    backgroundColor: '#FAF5FF',
  },
  dropdownSelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  dropdownChevron: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  dropdownMenuWrapper: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#7E22CE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
});
