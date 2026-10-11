import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthScreen from './android/app/pages/auth';
import StudentDashboard from './android/app/Screens/StudentDashboard';
import AdminDashboard from './android/app/Screens/AdminDashboard';
import TeacherDashboard from './android/app/Screens/TeacherDashboard';
import HomeScreen from './android/app/pages/home';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('teacher');
  const [userId, setUserId] = useState('T101');

  const handleLogin = (role, id) => {
    setUserRole(role);
    setUserId(id || (role === 'student' ? 'S001' : role === 'teacher' ? 'T101' : 'ADMIN01'));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isLoggedIn ? 'dark-content' : 'light-content'}
        backgroundColor={isLoggedIn ? '#FFFFFF' : '#8B2FC9'}
      />
      <View style={styles.container}>
        {!isLoggedIn ? (
          <AuthScreen onLogin={handleLogin} />
        ) : userRole === 'admin' ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : userRole === 'student' ? (
          <StudentDashboard
            userName="Rohit Sharma"
            userRoleText="CSE-C Student"
            onLogout={handleLogout}
          />
        ) : (
          <TeacherDashboard
            onLogout={handleLogout}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
