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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {authService} from '../../services/authService';
import {Colors} from '../../theme/colors';
import {RootStackParamList} from '../../navigation/types';

// Monkey avatar from assets
const MONKEY_IMG = require('../../assets/images/auth_bg.png');

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
  const [rememberMe, setRememberMe] = useState(false);
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
      navigation.replace('Demo');
    } catch (error: any) {
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
      navigation.replace('Demo');
    } catch (error: any) {
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
          <Text style={[styles.label, {marginTop: 14}]}>Password*</Text>
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
            activeOpacity={0.8}>
            {/* Google 'G' colored letters */}
            <View style={styles.gLetterRow}>
              <Text style={[styles.gLetter, {color: '#4285F4'}]}>G</Text>
              <Text style={[styles.gLetter, {color: '#EA4335'}]}>o</Text>
              <Text style={[styles.gLetter, {color: '#FBBC05'}]}>o</Text>
              <Text style={[styles.gLetter, {color: '#4285F4'}]}>g</Text>
              <Text style={[styles.gLetter, {color: '#34A853'}]}>l</Text>
              <Text style={[styles.gLetter, {color: '#EA4335'}]}>e</Text>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2B1A',
  },
  flex: {flex: 1},

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // ── Avatar ──
  avatarWrapper: {
    alignSelf: 'center',
    width: 140,
    height: 180,
    marginBottom: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  // ── Heading ──
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 30,
  },

  // ── Labels ──
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  // ── Input ──
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    height: 54,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  eyeIcon: {
    fontSize: 17,
    paddingLeft: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    marginBottom: 2,
  },

  // ── Options row ──
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: Colors.neonGreen,
    borderColor: Colors.neonGreen,
  },
  checkmark: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  rememberText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
  },

  // ── Sign In Button ──
  signInBtn: {
    marginTop:35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: 30,
    height: 56,
    marginBottom: 24,
    shadowColor: Colors.neonGreen,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  signInIcon: {
    fontSize: 16,
    color: '#0A0A0A',
    marginRight: 8,
  },
  signInLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 0.4,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 13,
    marginHorizontal: 12,
    letterSpacing: 0.3,
  },

  // ── Google Button ──
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    height: 56,
    marginBottom: 28,
  },
  gLetterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gLetter: {
    fontSize: 18,
    fontWeight: '800',
  },

  // ── Bottom link ──
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 14,
  },
  bottomLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SignIn;
