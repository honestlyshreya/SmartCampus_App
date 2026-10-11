import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen({ role, userId, onLogout }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDay, setSelectedDay] = useState('Today');
  const [noticeFilter, setNoticeFilter] = useState('All');
  const [showIdModal, setShowIdModal] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);

  const isStudent = role === 'student';
  const userName = isStudent ? 'John Doe' : 'Prof. Sarah Jenkins';
  const userSub = isStudent ? `Student ID: ${userId}` : `Staff ID: ${userId} • Computer Science`;

  const upcomingClasses = [
    {
      id: '1',
      subject: 'Data Structures & Algorithms',
      code: 'CS-301',
      time: '10:00 AM - 11:30 AM',
      room: 'Lab 402, CS Block',
      professor: 'Dr. Sarah Jenkins',
      status: 'In Progress',
      color: '#6366F1',
    },
    {
      id: '2',
      subject: 'Database Management Systems',
      code: 'CS-304',
      time: '01:00 PM - 02:30 PM',
      room: 'Hall B, Science Complex',
      professor: 'Prof. Alan Turing',
      status: 'Upcoming',
      color: '#0EA5E9',
    },
    {
      id: '3',
      subject: 'Artificial Intelligence',
      code: 'CS-402',
      time: '03:00 PM - 04:30 PM',
      room: 'Auditorium 1',
      professor: 'Dr. Michael Chang',
      status: 'Upcoming',
      color: '#8B5CF6',
    },
  ];

  const notices = [
    {
      id: '1',
      title: 'Mid-Semester Examination Schedule Released',
      category: 'Academic',
      date: '10 mins ago',
      content: 'The mid-semester timetable for Fall 2026 is published on the portal.',
    },
    {
      id: '2',
      title: 'Annual Tech Fest "HackCampus 2026" Registrations Open',
      category: 'Events',
      date: '2 hours ago',
      content: 'Register your team before Friday for early bird passes.',
    },
    {
      id: '3',
      title: 'Library Extended Hours During Exam Week',
      category: 'Admin',
      date: '1 day ago',
      content: 'Central library will remain open 24/7 starting next Monday.',
    },
  ];

  const handleCheckIn = () => {
    setCheckInStatus('✅ Attendance Marked Successfully!');
    setTimeout(() => setCheckInStatus(null), 3500);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{isStudent ? 'JD' : 'SJ'}</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>
                Welcome back 👋 ({isStudent ? 'Student' : 'Teacher'})
              </Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Logout 🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Attendance Toast */}
      {checkInStatus && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{checkInStatus}</Text>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'home' && (
          <>
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {isStudent ? '94.2%' : '98.5%'}
                </Text>
                <Text style={styles.statLabel}>
                  {isStudent ? 'Attendance' : 'Classes Taken'}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎓</Text>
                <Text style={[styles.statValue, { color: '#6366F1' }]}>
                  {isStudent ? '3.88' : '4 Subjects'}
                </Text>
                <Text style={styles.statLabel}>
                  {isStudent ? 'CGPA' : 'Assigned Courses'}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📚</Text>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {isStudent ? '2 Books' : '12 Pending'}
                </Text>
                <Text style={styles.statLabel}>
                  {isStudent ? 'Library Due' : 'Grades Review'}
                </Text>
              </View>
            </View>

            {/* Current Class Banner */}
            <View style={styles.currentClassCard}>
              <View style={styles.currentClassBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.currentClassBadgeText}>HAPPENING NOW</Text>
              </View>
              <Text style={styles.currentClassTitle}>
                Data Structures & Algorithms
              </Text>
              <Text style={styles.currentClassSub}>
                Room 402 • Prof. Jenkins • 10:00 - 11:30 AM
              </Text>

              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={handleCheckIn}
                activeOpacity={0.85}
              >
                <Text style={styles.checkInBtnText}>
                  {isStudent ? '📍 Mark Attendance' : '📝 Take Attendance'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Campus Services */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Campus Services</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setShowIdModal(true)}
              >
                <Text style={styles.serviceIcon}>💳</Text>
                <Text style={styles.serviceTitle}>Digital ID Pass</Text>
                <Text style={styles.serviceSub}>Gate & Library</Text>
              </TouchableOpacity>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceIcon}>🚌</Text>
                <Text style={styles.serviceTitle}>Shuttle Tracker</Text>
                <Text style={[styles.serviceSub, { color: '#10B981' }]}>Bus #4: 3 mins away</Text>
              </View>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceIcon}>🍱</Text>
                <Text style={styles.serviceTitle}>Cafeteria Pass</Text>
                <Text style={styles.serviceSub}>Queue: Light (5m)</Text>
              </View>

              <View style={styles.serviceCard}>
                <Text style={styles.serviceIcon}>📶</Text>
                <Text style={styles.serviceTitle}>Campus Wi-Fi</Text>
                <Text style={[styles.serviceSub, { color: '#10B981' }]}>Connected (5G)</Text>
              </View>
            </ScrollView>

            {/* Recent Announcements */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Announcements</Text>
              <TouchableOpacity onPress={() => setActiveTab('notices')}>
                <Text style={styles.seeAllText}>See All →</Text>
              </TouchableOpacity>
            </View>
            {notices.slice(0, 2).map((item) => (
              <View key={item.id} style={styles.noticeItemCard}>
                <View style={styles.noticeHeaderRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                  <Text style={styles.noticeDate}>{item.date}</Text>
                </View>
                <Text style={styles.noticeItemTitle}>{item.title}</Text>
                <Text style={styles.noticeItemDesc}>{item.content}</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === 'schedule' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Class Timetable</Text>
            <View style={styles.dayRow}>
              {['Mon', 'Today', 'Wed', 'Thu', 'Fri'].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    selectedDay === day && styles.dayChipActive,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      selectedDay === day && styles.dayChipTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {upcomingClasses.map((cls) => (
              <View key={cls.id} style={styles.classCard}>
                <View style={[styles.classColorStrip, { backgroundColor: cls.color }]} />
                <View style={styles.classCardBody}>
                  <View style={styles.classCardTop}>
                    <Text style={[styles.classCode, { color: cls.color }]}>{cls.code}</Text>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusTagText}>{cls.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.classSubject}>{cls.subject}</Text>
                  <Text style={styles.classMeta}>⏰ {cls.time}</Text>
                  <Text style={styles.classMeta}>📍 {cls.room}</Text>
                  <Text style={styles.classMeta}>👨‍🏫 {cls.professor}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'notices' && (
          <View style={styles.tabSection}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <View style={styles.dayRow}>
              {['All', 'Academic', 'Events', 'Admin'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.dayChip,
                    noticeFilter === cat && styles.dayChipActive,
                  ]}
                  onPress={() => setNoticeFilter(cat)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      noticeFilter === cat && styles.dayChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {notices
              .filter((n) => noticeFilter === 'All' || n.category === noticeFilter)
              .map((item) => (
                <View key={item.id} style={styles.noticeItemCard}>
                  <View style={styles.noticeHeaderRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category}</Text>
                    </View>
                    <Text style={styles.noticeDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.noticeItemTitle}>{item.title}</Text>
                  <Text style={styles.noticeItemDesc}>{item.content}</Text>
                </View>
              ))}
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.tabSection}>
            <View style={styles.profileCard}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>{isStudent ? 'JD' : 'SJ'}</Text>
              </View>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileSub}>{userSub}</Text>

              <TouchableOpacity
                style={styles.showIdBtn}
                onPress={() => setShowIdModal(true)}
              >
                <Text style={styles.showIdBtnText}>Show Digital Student Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Digital ID Pass Modal */}
      <Modal visible={showIdModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.idCardModal}>
            <View style={styles.idModalHeader}>
              <Text style={styles.idModalTitle}>SMART CAMPUS PASS</Text>
              <TouchableOpacity onPress={() => setShowIdModal(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.idCardContent}>
              <View style={styles.idPhotoBox}>
                <Text style={styles.idPhotoText}>{isStudent ? 'JD' : 'SJ'}</Text>
              </View>
              <Text style={styles.idCardName}>{userName}</Text>
              <Text style={styles.idCardDept}>Computer Science & Eng.</Text>
              <Text style={styles.idCardNum}>{userSub}</Text>

              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrIcon}>📱 [QR CODE]</Text>
                <Text style={styles.qrHelper}>Scan at Campus Entry Gates & Library</Text>
              </View>

              <View style={styles.validBox}>
                <Text style={styles.validText}>STATUS: ACTIVE MEMBER</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greetingText: {
    fontSize: 12,
    color: '#64748B',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toastContainer: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 56) / 3,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  currentClassCard: {
    backgroundColor: '#7C3AED',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  currentClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  currentClassBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentClassTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  currentClassSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginBottom: 16,
  },
  checkInBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  checkInBtnText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  servicesScroll: {
    marginBottom: 24,
  },
  serviceCard: {
    width: 130,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  serviceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceSub: {
    fontSize: 11,
    color: '#64748B',
  },
  noticeItemCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  noticeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  noticeDate: {
    fontSize: 11,
    color: '#64748B',
  },
  noticeItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  noticeItemDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  tabSection: {
    paddingTop: 8,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  dayChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  classColorStrip: {
    width: 6,
  },
  classCardBody: {
    flex: 1,
    padding: 16,
  },
  classCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  classCode: {
    fontWeight: '700',
    fontSize: 12,
  },
  statusTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  classSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  classMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  largeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  profileSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  showIdBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  showIdBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  idCardModal: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
  },
  idModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  idModalTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  idCardContent: {
    alignItems: 'center',
  },
  idPhotoBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  idPhotoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  idCardName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  idCardDept: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 2,
  },
  idCardNum: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
  },
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  qrIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  qrHelper: {
    fontSize: 11,
    color: '#64748B',
  },
  validBox: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  validText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  centerNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  centerNavIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  navActive: {
    color: '#7C3AED',
  },
});
