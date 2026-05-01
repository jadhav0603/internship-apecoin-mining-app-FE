import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Loading from '../../components/constant/Loading';
import {authService} from '../../services/authService';
import {Colors} from '../../theme/colors';
import {RootStackParamList} from '../../navigation/types';
import {isBlockedAccountError} from '../../session/blockedAccountState';
import styles from './SignIn.style';

// Monkey avatar from assets
const MONKEY_IMG = require('../../assets/images/auth_bg.webp');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

const getReadableErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const SignIn: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validate = () => {
    let valid = true;
    let newErrors: {email?: string; password?: string} = {};

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (error: any) {
      if (isBlockedAccountError(error)) {
        return;
      }

      const message =
        typeof error?.code === 'string' && error.code.startsWith('auth/')
          ? 'Invalid email or password.'
          : getReadableErrorMessage(error, 'Sign in failed. Please try again.');
      setErrors({email: message});
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await authService.googleSignIn();
    } catch (error: any) {
      if (isBlockedAccountError(error)) {
        return;
      }

      setErrors({
        email: getReadableErrorMessage(error, 'Google sign-in failed. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: Math.max(insets.bottom, 20)}]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2B1A" />

      {/* ✅ Full-screen blocking overlay during Google/Auth loading */}
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Loading size="medium" text="Signing you in..." />
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>

          {/* ── Monkey Avatar ── */}
          <View style={styles.avatarWrapper}>
            <Image source={MONKEY_IMG} style={styles.avatar} resizeMode="cover" />
            {/* Fade bottom edge to match background */}
            <LinearGradient
              colors={['transparent', '#1A2B1A']}
              style={styles.avatarFade}
            />
          </View>

          {/* ── Heading ── */}
          <Text style={styles.heading}>Welcome Back!</Text>
          <Text style={styles.subheading}>
            Sign in to access smart, personalised travel{'\n'}plans made for you.
          </Text>

          {/* ── Email Field ── */}
          <Text style={styles.label}>Email address*</Text>
          <View
            style={[
              styles.inputContainer,
              errors.email ? styles.inputError : null,
            ]}>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor="rgba(255,255,255,0.30)"
              value={email}
              onChangeText={t => {
                setEmail(t);
                if (errors.email) setErrors(e => ({...e, email: undefined}));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {!!errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* ── Password Field ── */}
          <Text style={[styles.label, styles.passwordLabel]}>Password*</Text>
          <View
            style={[
              styles.inputContainer,
              errors.password ? styles.inputError : null,
            ]}>
            <TextInput
              style={styles.input}
              placeholder="@enl23hsn#"
              placeholderTextColor="rgba(255,255,255,0.30)"
              value={password}
              onChangeText={t => {
                setPassword(t);
                if (errors.password) setErrors(e => ({...e, password: undefined}));
              }}
              secureTextEntry={securePassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setSecurePassword(prev => !prev)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.eyeIcon}>{securePassword ? '🙈' : '🙉'}</Text>
            </TouchableOpacity>
          </View>
          {!!errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* ── Remember Me + Forgot Password ── */}
          {/* <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(prev => !prev)}
              activeOpacity={0.75}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View> */}

          {/* ── Sign In Button ── */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}>
            {/* <Text style={styles.signInIcon}>✦</Text> */}
            <Text style={styles.signInLabel}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Google Button ── */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            activeOpacity={0.8}
            disabled={loading}>
            {/* Google 'G' colored letters */}
            <View style={styles.gLetterRow}>
              <Text style={[styles.gLetter, styles.gBlue]}>G</Text>
              <Text style={[styles.gLetter, styles.gRed]}>o</Text>
              <Text style={[styles.gLetter, styles.gYellow]}>o</Text>
              <Text style={[styles.gLetter, styles.gBlue]}>g</Text>
              <Text style={[styles.gLetter, styles.gGreen]}>l</Text>
              <Text style={[styles.gLetter, styles.gRed]}>e</Text>
            </View>
          </TouchableOpacity>

          {/* ── Sign Up Link ── */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.bottomLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────── Styles ───────────────────────────

export default SignIn;
