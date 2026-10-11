import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginWithSupabase } from '../../../src/services/supabaseService';

/**
 * Reusable Dropdown Select Menu Component for Auth Screen
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

const ROLE_DROPDOWN_OPTIONS = [
  { label: '🎓 Student Portal Login', value: 'student' },
  { label: '👩‍🏫 Teacher / Faculty Login', value: 'teacher' },
  { label: '👑 Principal / Admin Login', value: 'admin' },
];

export default function AuthScreen({ onLogin }) {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState('student');
  const [idInput, setIdInput] = useState('S001');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMessage('');
    if (newRole === 'student') {
      setIdInput('S001');
    } else if (newRole === 'teacher') {
      setIdInput('T101');
    } else {
      setIdInput('ADMIN01');
    }
  };

  const handleLoginSubmit = async () => {
    if (!idInput.trim()) {
      setErrorMessage(
        role === 'student'
          ? 'Please enter your Student ID / Roll Number'
          : role === 'teacher'
          ? 'Please enter your Teacher ID / Staff Code'
          : 'Please enter Admin Code'
      );
      return;
    }
    setErrorMessage('');

    if (role === 'admin') {
      if (onLogin) onLogin('admin', idInput);
      return;
    }

    const res = await loginWithSupabase(role, idInput, password);
    if (res.success) {
      if (onLogin) {
        onLogin(role, idInput);
      }
    } else {
      setErrorMessage(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset instructions have been sent to your registered campus email or contact the Principal office.',
      [{ text: 'OK' }]
    );
  };

  const getRoleLabel = (r) => {
    if (r === 'student') return '🎓 Student Portal Login';
    if (r === 'teacher') return '👩‍🏫 Teacher / Faculty Login';
    return '👑 Principal / Admin Login';
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient Decorative Circles */}
      <View style={styles.bgCircleTopLeft} />
      <View style={styles.bgCircleBottomRight} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 20, 40),
              paddingBottom: Math.max(insets.bottom + 20, 30),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title Section */}
          <View style={styles.headerContainer}>
            {/* Glowing Icon Emblem */}
            <View style={styles.glowingIconWrapper}>
              <View style={styles.glowingIconInner}>
                <Text style={styles.sparkleIcon}>✨</Text>
              </View>
            </View>

            <Text style={styles.appTitle}>Smart Campus</Text>
            <Text style={styles.appSubTitle}>Assistant</Text>
            <Text style={styles.loginSubtitle}>
              Login to access your campus dashboard
            </Text>
          </View>

          {/* Main White Login Card */}
          <View style={styles.card}>
            {/* Role Dropdown Selector Menu */}
            <DropdownSelect
              label="Select Login Portal Role"
              value={getRoleLabel(role)}
              options={ROLE_DROPDOWN_OPTIONS}
              onSelect={(val) => handleRoleChange(val)}
            />

            {/* Role Switcher Tabs */}
            <View style={styles.roleTabContainer}>
              <TouchableOpacity
                style={[
                  styles.roleTab,
                  role === 'student' && styles.roleTabActive,
                ]}
                onPress={() => handleRoleChange('student')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleTabIcon}>🎓</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    role === 'student' && styles.roleTabTextActive,
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleTab,
                  role === 'teacher' && styles.roleTabActive,
                ]}
                onPress={() => handleRoleChange('teacher')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleTabIcon}>👩‍🏫</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    role === 'teacher' && styles.roleTabTextActive,
                  ]}
                >
                  Teacher
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleTab,
                  role === 'admin' && styles.roleTabActive,
                ]}
                onPress={() => handleRoleChange('admin')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleTabIcon}>👑</Text>
                <Text
                  style={[
                    styles.roleTabText,
                    role === 'admin' && styles.roleTabTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            {/* Input 1: Student ID / Roll Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {role === 'student' ? 'Student ID / Roll Number' : role === 'teacher' ? 'Teacher ID / Staff Code' : 'Admin Access Code'}
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={role === 'student' ? 'e.g. S001' : role === 'teacher' ? 'e.g. T101' : 'e.g. ADMIN01'}
                  placeholderTextColor="#94A3B8"
                  value={idInput}
                  onChangeText={setIdInput}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Input 2: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>
                Login as {role === 'student' ? 'Student' : 'Teacher'} →
              </Text>
            </TouchableOpacity>

            {/* Principal Info Card Notice */}
            <View style={styles.principalCard}>
              <View style={styles.principalHeader}>
                <View style={styles.principalAvatar}>
                  <Text style={styles.avatarEmoji}>👩‍💼</Text>
                </View>
                <View>
                  <Text style={styles.principalName}>Mrs. Sonali</Text>
                  <Text style={styles.principalRole}>Principal, SVIST</Text>
                </View>
              </View>
              <Text style={styles.principalNote}>
                The Principal has the authority to create new student IDs for login access. New students should contact the Principal's office for ID creation and system access.
              </Text>
            </View>

            {/* Terms and Privacy Policy Footer */}
            <View style={styles.footerNotice}>
              <Text style={styles.footerText}>By logging in, you agree to our</Text>
              <View style={styles.termsRow}>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Terms of Service',
                      'SVIST Smart Campus Terms of Service.'
                    )
                  }
                >
                  <Text style={styles.linkText}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}> and </Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Privacy Policy',
                      'SVIST Smart Campus Privacy Policy.'
                    )
                  }
                >
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B2FC9', // Primary magenta/purple background
  },
  bgCircleTopLeft: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#A855F7',
    opacity: 0.35,
  },
  bgCircleBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#D946EF',
    opacity: 0.25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  glowingIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  glowingIconInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F0ABFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  sparkleIcon: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  appSubTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  loginSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roleTabIcon: {
    fontSize: 15,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#64748B',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  eyeIcon: {
    fontSize: 16,
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13,
    color: '#64748B',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  loginButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  principalCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  principalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  principalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  principalName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  principalRole: {
    fontSize: 11,
    color: '#64748B',
  },
  principalNote: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  footerNotice: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  dropdownContainer: {
    marginBottom: 16,
    width: '100%',
  },
  dropdownSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownSelectBoxActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  dropdownSelectText: {
    fontSize: 14,
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
    borderColor: '#7C3AED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownMenuItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  dropdownMenuItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownMenuItemTextSelected: {
    color: '#7E22CE',
    fontWeight: '700',
  },
});
