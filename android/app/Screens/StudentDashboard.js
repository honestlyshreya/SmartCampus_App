import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getDynamicDateTime,
  getStudentByCode,
  getClassSubjectsFromSupabase,
  getNoticesFromSupabase,
  getAcademicEventsFromSupabase,
  markAttendanceInSupabase,
} from '../../../src/services/supabaseService';

const { width } = Dimensions.get('window');

/**
 * Reusable Dropdown Select Menu Component for Student Dashboard
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

const STUDENT_SEM_OPTIONS = [
  '1st Year | 1st Semester',
  '1st Year | 2nd Semester',
  '2nd Year | 3rd Semester',
  '2nd Year | 4th Semester',
  '3rd Year | 5th Semester',
  '3rd Year | 6th Semester',
  '4th Year | 7th Semester',
  '4th Year | 8th Semester',
];

export default function StudentDashboard({ userCode = 'S001', initialUserData, onLogout }) {
  const insets = useSafeAreaInsets();
  const [activeBottomNav, setActiveBottomNav] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedSectionModal, setSelectedSectionModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemOption, setSelectedSemOption] = useState('1st Year | 2nd Semester');

  // Dynamic States
  const [userData, setUserData] = useState(initialUserData || null);
  const [dateTime, setDateTime] = useState(getDynamicDateTime());
  const [noticesList, setNoticesList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  // Dynamic Date/Time Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getDynamicDateTime());
    }, 30000); // refresh time every 30s
    return () => clearInterval(timer);
  }, []);

  // Fetch Supabase Database Records
  useEffect(() => {
    let isMounted = true;
    async function loadDatabaseData() {
      setLoading(true);

      // Fetch Student Profile
      const profile = await getStudentByCode(userCode);
      if (isMounted && profile) {
        setUserData(profile);
      } else if (isMounted && !userData) {
        setUserData({
          student_code: userCode,
          full_name: 'Rohit Sharma',
          class_name: 'CSE-C',
          batch_year: 'Batch 2024',
          year_semester: '1st Year | 2nd Semester',
          attendance_percentage: 88.0,
          library_books_due: 2,
        });
      }

      // Fetch Notices
      const notices = await getNoticesFromSupabase();
      if (isMounted && notices && notices.length > 0) {
        setNoticesList(notices);
      }

      // Fetch Classes / Timetable
      const classId = profile ? profile.class_id : 'C3';
      const classes = await getClassSubjectsFromSupabase(classId);
      if (isMounted && classes && classes.length > 0) {
        setClassesList(classes);
      }

      // Fetch Academic Events
      const events = await getAcademicEventsFromSupabase();
      if (isMounted && events && events.length > 0) {
        setEventsList(events);
      }

      if (isMounted) setLoading(false);
    }

    loadDatabaseData();
    return () => { isMounted = false; };
  }, [userCode]);

  // Fallback defaults if database tables are initialising
  const currentProfile = userData || {
    full_name: 'Student User',
    class_section: 'CSE-C',
    batch_year: 'Batch 2024',
    year_semester: '1st Year | 2nd Semester',
    attendance_percentage: 88.0,
  };

  const displayNotices = noticesList.length > 0 ? noticesList : [
    {
      id: '1',
      title: 'Mid-Semester Examination Schedule Released',
      category: 'Academic',
      date_label: '10 mins ago',
      content: 'The mid-semester timetable for Fall 2026 is published on the portal.',
    },
    {
      id: '2',
      title: 'Annual Tech Fest "HackCampus 2026" Registrations Open',
      category: 'Events',
      date_label: '2 hours ago',
      content: 'Register your team before Friday for early bird passes.',
    },
  ];

  const displayEvents = eventsList.length > 0 ? eventsList : [
    {
      id: '1',
      title: 'Even Semester Examination',
      department: 'All departments',
      event_date: 'May 2 - May 15, 2026',
      icon: '📅',
      icon_bg: '#F3E8FF',
    },
    {
      id: '2',
      title: 'Campus Recruitment Drive',
      department: 'Placement Cell',
      event_date: 'May 5, 2026',
      icon: '📢',
      icon_bg: '#FFE4E6',
    },
    {
      id: '3',
      title: 'Summer Internship Program',
      department: 'Computer Science Department',
      event_date: 'May 25, 2026',
      icon: '👥',
      icon_bg: '#DBEAFE',
    },
  ];

  const dashboardGridItems = [
    {
      id: 'assignments',
      title: 'Assignments',
      subtext: 'View and submit your assignments',
      highlight: '2 assignments due this week',
      highlightColor: '#EF4444',
      icon: '📖',
      iconBg: '#DBEAFE',
    },
    {
      id: 'notices',
      title: 'Notices',
      subtext: 'Campus announcements and updates',
      highlight: `${displayNotices.length} new notices today`,
      highlightColor: '#64748B',
      icon: '🔔',
      iconBg: '#FFEDD5',
    },
    {
      id: 'timetable',
      title: 'Class Timetable',
      subtext: 'View class schedules and teachers',
      highlight: `${currentProfile.class_name || currentProfile.class_section || 'CSE-C'} - ${currentProfile.batch_year || '1st Year'}`,
      highlightColor: '#64748B',
      icon: '🕒',
      iconBg: '#F3E8FF',
    },
    {
      id: 'map',
      title: 'Campus Map',
      subtext: 'Navigate around campus',
      highlight: 'Interactive map with building locations',
      highlightColor: '#64748B',
      icon: '📍',
      iconBg: '#DCFCE7',
    },
    {
      id: 'attendance',
      title: 'Attendance',
      subtext: 'Track your attendance records',
      highlight: `Current attendance: ${currentProfile.attendance_percentage || 88}%`,
      highlightColor: '#64748B',
      icon: '👤',
      iconBg: '#FCE7F3',
    },
    {
      id: 'schedule',
      title: 'Class Schedule',
      subtext: 'View your weekly class schedule',
      highlight: `${classesList.length || 3} classes today`,
      highlightColor: '#64748B',
      icon: '📅',
      iconBg: '#FFE4E6',
    },
  ];

  const handleAttendanceClick = async () => {
    Alert.alert('Mark Attendance', 'Marking your attendance in Supabase database...');
    const res = await markAttendanceInSupabase(userCode, 'CS-301');
    if (res.success) {
      Alert.alert('Success ✅', 'Attendance recorded in Supabase!');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP NAVIGATION HEADER */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top + 6, 12) }]}>
        <TouchableOpacity style={styles.menuButton} onPress={() => Alert.alert('Menu', 'Campus Drawer Menu Opened')}>
          <Text style={styles.menuIconText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerLogoRow}>
          <View style={styles.sparkleLogoBadge}>
            <Text style={styles.sparkleLogoIcon}>✨</Text>
          </View>
          <Text style={styles.headerTitle}>Smart Campus Assistant</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setShowProfileMenu(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarLetter}>
            {currentProfile.full_name ? currentProfile.full_name.charAt(0).toUpperCase() : 'S'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. DYNAMIC WELCOME BANNER CARD */}
        <View style={styles.welcomeBanner}>
          <View style={styles.bannerDecorBg} />
          
          <View style={styles.bannerHeaderRow}>
            <View>
              <Text style={styles.welcomePrefix}>👋 Welcome,</Text>
              <Text style={styles.userNameText}>{currentProfile.full_name}</Text>
              <Text style={styles.userRoleSub}>
                {(currentProfile.class_name || currentProfile.class_section) ? `${currentProfile.class_name || currentProfile.class_section} Student` : 'Student'} • 🎓 {currentProfile.batch_year || 'Batch 2024'}
              </Text>
            </View>

            <View style={styles.bannerTimeCol}>
              <Text style={styles.dateText}>{dateTime.date}</Text>
              <Text style={styles.timeText}>{dateTime.time}</Text>
            </View>
          </View>

          {/* Academic Year & Semester View Dropdown */}
          <View style={{ marginTop: 12, marginBottom: 4 }}>
            <DropdownSelect
              label="Select Current Academic Term"
              value={selectedSemOption}
              options={STUDENT_SEM_OPTIONS}
              onSelect={(val) => setSelectedSemOption(val)}
            />
          </View>

          {/* 4 Glass Action Pills */}
          <View style={styles.pillsGrid}>
            <TouchableOpacity style={styles.glassPill} onPress={() => setSelectedSectionModal('Academic Calendar')}>
              <Text style={styles.pillIcon}>📅</Text>
              <Text style={styles.pillLabel}>Academic{'\n'}Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassPill} onPress={() => setSelectedSectionModal('Campus Events')}>
              <Text style={styles.pillIcon}>🏆</Text>
              <Text style={styles.pillLabel}>Campus{'\n'}Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassPill} onPress={() => setSelectedSectionModal('Student Resources')}>
              <Text style={styles.pillIcon}>👥</Text>
              <Text style={styles.pillLabel}>Student{'\n'}Resources</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassPill} onPress={() => setSelectedSectionModal('Campus Map')}>
              <Text style={styles.pillIcon}>📍</Text>
              <Text style={styles.pillLabel}>Campus{'\n'}Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. CURRENT CLASS STATUS CARD */}
        <View style={styles.currentClassCard}>
          <View style={styles.classCardLeftInfo}>
            <View style={styles.clockCircle}>
              <Text style={styles.clockCircleIcon}>🕒</Text>
            </View>
            <View style={styles.classTextGroup}>
              <Text style={styles.noClassTitle}>No Current Class</Text>
              <Text style={styles.noClassSub}>
                You don't have any class right now.{'\n'}Check your schedule for upcoming classes.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewSchedulePillBtn}
            onPress={() => setSelectedSectionModal('Class Schedule')}
            activeOpacity={0.85}
          >
            <Text style={styles.viewSchedulePillText}>View Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* 4. DASHBOARD SECTION HEADER */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.dashboardSectionTitle}>Dashboard</Text>
          <TouchableOpacity
            style={styles.viewFullScheduleBtn}
            onPress={() => setSelectedSectionModal('Full Schedule')}
          >
            <Text style={styles.calendarSmallIcon}>📅</Text>
            <Text style={styles.viewFullScheduleText}>View Full Schedule</Text>
            <Text style={styles.purpleChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 5. 2x3 DYNAMIC DASHBOARD CARDS GRID */}
        <View style={styles.dashboardGrid}>
          {dashboardGridItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCard}
              onPress={() => setSelectedSectionModal(item.title)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.gridIconBox, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.gridIconEmoji}>{item.icon}</Text>
                </View>
                <Text style={styles.gridChevron}>›</Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtext}>{item.subtext}</Text>

              {item.highlight ? (
                <Text style={[styles.cardHighlight, { color: item.highlightColor }]}>
                  {item.highlight}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. DYNAMIC ACADEMIC EVENTS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.dashboardSectionTitle}>Upcoming Academic Events</Text>
          <TouchableOpacity onPress={() => setSelectedSectionModal('Upcoming Academic Events')}>
            <Text style={styles.seeAllPurpleText}>See All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsList}>
          {displayEvents.map((evt) => (
            <TouchableOpacity
              key={evt.id}
              style={styles.eventCard}
              onPress={() => setSelectedSectionModal(evt.title)}
              activeOpacity={0.8}
            >
              <View style={styles.eventLeftInfo}>
                <View style={[styles.eventIconBox, { backgroundColor: evt.icon_bg || evt.iconBg || '#F3E8FF' }]}>
                  <Text style={styles.eventIconEmoji}>{evt.icon || '📅'}</Text>
                </View>
                <View style={styles.eventTextCol}>
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Text style={styles.eventDept}>{evt.department || evt.dept}</Text>
                </View>
              </View>

              <View style={styles.eventRightRow}>
                <Text style={styles.eventDateText}>{evt.event_date || evt.date}</Text>
                <Text style={styles.eventChevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 7. BOTTOM NAVIGATION BAR */}
      <View style={[styles.bottomNavBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          style={styles.navTabItem}
          onPress={() => setActiveBottomNav('home')}
        >
          {activeBottomNav === 'home' && <View style={styles.activeTabTopIndicator} />}
          <Text style={[styles.navTabIcon, activeBottomNav === 'home' && styles.navTabIconActive]}>🏠</Text>
          <Text style={[styles.navTabLabel, activeBottomNav === 'home' && styles.navTabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTabItem}
          onPress={() => {
            setActiveBottomNav('assignments');
            setSelectedSectionModal('Assignments');
          }}
        >
          {activeBottomNav === 'assignments' && <View style={styles.activeTabTopIndicator} />}
          <Text style={[styles.navTabIcon, activeBottomNav === 'assignments' && styles.navTabIconActive]}>📖</Text>
          <Text style={[styles.navTabLabel, activeBottomNav === 'assignments' && styles.navTabLabelActive]}>
            Assignments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTabItem}
          onPress={() => {
            setActiveBottomNav('notices');
            setSelectedSectionModal('Notices');
          }}
        >
          {activeBottomNav === 'notices' && <View style={styles.activeTabTopIndicator} />}
          <Text style={[styles.navTabIcon, activeBottomNav === 'notices' && styles.navTabIconActive]}>🔔</Text>
          <Text style={[styles.navTabLabel, activeBottomNav === 'notices' && styles.navTabLabelActive]}>
            Notices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTabItem}
          onPress={() => {
            setActiveBottomNav('map');
            setSelectedSectionModal('Campus Map');
          }}
        >
          {activeBottomNav === 'map' && <View style={styles.activeTabTopIndicator} />}
          <Text style={[styles.navTabIcon, activeBottomNav === 'map' && styles.navTabIconActive]}>📍</Text>
          <Text style={[styles.navTabLabel, activeBottomNav === 'map' && styles.navTabLabelActive]}>
            Campus Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTabItem}
          onPress={() => {
            setActiveBottomNav('more');
            setShowProfileMenu(true);
          }}
        >
          {activeBottomNav === 'more' && <View style={styles.activeTabTopIndicator} />}
          <Text style={[styles.navTabIcon, activeBottomNav === 'more' && styles.navTabIconActive]}>⊞</Text>
          <Text style={[styles.navTabLabel, activeBottomNav === 'more' && styles.navTabLabelActive]}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* DETAIL MODAL FOR SECTIONS */}
      <Modal visible={!!selectedSectionModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>{selectedSectionModal}</Text>
              <TouchableOpacity onPress={() => setSelectedSectionModal(null)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBodyDesc}>
              Viewing dynamic Supabase content for {selectedSectionModal}.
            </Text>

            {selectedSectionModal === 'Attendance' && (
              <TouchableOpacity style={styles.actionBtnModal} onPress={handleAttendanceClick}>
                <Text style={styles.actionBtnModalText}>📍 Mark Present in Supabase</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedSectionModal(null)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* USER PROFILE & LOGOUT MODAL */}
      <Modal visible={showProfileMenu} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenuCard}>
            <View style={styles.profileMenuAvatar}>
              <Text style={styles.profileMenuAvatarText}>
                {currentProfile.full_name ? currentProfile.full_name.charAt(0).toUpperCase() : 'S'}
              </Text>
            </View>
            <Text style={styles.profileMenuName}>{currentProfile.full_name}</Text>
            <Text style={styles.profileMenuRole}>{currentProfile.class_section || currentProfile.class_name || 'CSE-C'} • 🎓 {currentProfile.batch_year || 'Batch 2024'}</Text>
            <Text style={styles.profileMenuId}>ID: {userCode} • SVIST</Text>

            <TouchableOpacity
              style={styles.logoutActionBtn}
              onPress={() => {
                setShowProfileMenu(false);
                if (onLogout) onLogout();
              }}
            >
              <Text style={styles.logoutActionText}>Logout of Campus App 🚪</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuButton: {
    padding: 6,
  },
  menuIconText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleLogoIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9333EA',
    letterSpacing: -0.2,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  welcomeBanner: {
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerDecorBg: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#EC4899',
    opacity: 0.45,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomePrefix: {
    color: '#F3E8FF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userRoleSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  bannerTimeCol: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  pillsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  glassPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  pillLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
  },
  currentClassCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  classCardLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  clockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clockCircleIcon: {
    fontSize: 20,
    color: '#2563EB',
  },
  classTextGroup: {
    flex: 1,
  },
  noClassTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  noClassSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  viewSchedulePillBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewSchedulePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewFullScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarSmallIcon: {
    fontSize: 14,
  },
  viewFullScheduleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  purpleChevron: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  seeAllPurpleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconEmoji: {
    fontSize: 20,
  },
  gridChevron: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 8,
  },
  cardHighlight: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventsList: {
    gap: 10,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIconEmoji: {
    fontSize: 18,
  },
  eventTextCol: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventDept: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  eventRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  eventChevron: {
    fontSize: 16,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  activeTabTopIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 2,
    color: '#94A3B8',
  },
  navTabIconActive: {
    color: '#8B5CF6',
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  navTabLabelActive: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseX: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalBodyDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtnModal: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnModalText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalCloseBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  profileMenuCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  profileMenuAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileMenuAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileMenuName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileMenuRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileMenuId: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 20,
  },
  logoutActionBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  logoutActionText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  dropdownContainer: {
    marginBottom: 8,
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  dropdownSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownSelectBoxActive: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dropdownSelectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  dropdownChevron: {
    fontSize: 12,
    color: '#FFFFFF',
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
