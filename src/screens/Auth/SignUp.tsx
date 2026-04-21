import React, {useState} from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {authService} from '../../services/authService';
import {referralService} from '../../services/referralService';
import {Colors} from '../../theme/colors';
import {RootStackParamList} from '../../navigation/types';

const MONKEY_IMG = require('../../assets/images/auth_bg.webp');
const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const getReadableErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const SignUp: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    let valid = true;
    let newErrors: {firstName?: string; email?: string; password?: string} = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }
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

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signUp(email, password);

      if (referral.trim()) {
        try {
          await referralService.applyReferral({
            email,
            referralEmail: referral.trim(),
            source: 'signup',
          });
        } catch (referralError: any) {
          Alert.alert(
            'Referral',
            referralError?.response?.data?.message ||
              'Account created, but the referral email could not be applied.'
          );
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({email: 'That email address is already in use!'});
      } else {
        setErrors({
          email: getReadableErrorMessage(error, 'Registration failed. Please try again.'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await authService.googleSignIn();
    } catch (error: any) {
      setErrors({
        email: getReadableErrorMessage(error, 'Google sign-in failed. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {paddingBottom: Math.max(insets.bottom, 12)},
      ]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2B1A" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.inner}>

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
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>
            Join ApeCoin and start your journey today.
          </Text>

          {/* ── First Name ── */}
          <Text style={styles.label}>First name*</Text>
          <View style={[styles.inputContainer, errors.firstName ? styles.inputError : null]}>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor="rgba(255,255,255,0.30)"
              value={firstName}
              onChangeText={t => {
                setFirstName(t);
                if (errors.firstName) setErrors(e => ({...e, firstName: undefined}));
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {!!errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}

          {/* ── Email ── */}
          <Text style={[styles.label, styles.labelSpacing]}>Email address*</Text>
          <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
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

          {/* ── Password ── */}
          <Text style={[styles.label, styles.labelSpacing]}>Password*</Text>
          <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
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

          {/* ── Referral Code (optional) ── */}
          <Text style={[styles.label, styles.labelSpacing]}>
            Referral email{' '}
            <Text style={styles.optionalTag}>(optional)</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter referral email"
              placeholderTextColor="rgba(255,255,255,0.30)"
              value={referral}
              onChangeText={setReferral}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* ── Sign Up Button ── */}
          <TouchableOpacity
            style={styles.signUpBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={loading}>
            {/* <Text style={styles.signUpIcon}>✦</Text> */}
            <Text style={styles.signUpLabel}>
              {loading ? 'Creating account…' : 'Sign up'}
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
            <View style={styles.gLetterRow}>
              <Text style={[styles.gLetter, styles.gBlue]}>G</Text>
              <Text style={[styles.gLetter, styles.gRed]}>o</Text>
              <Text style={[styles.gLetter, styles.gYellow]}>o</Text>
              <Text style={[styles.gLetter, styles.gBlue]}>g</Text>
              <Text style={[styles.gLetter, styles.gGreen]}>l</Text>
              <Text style={[styles.gLetter, styles.gRed]}>e</Text>
            </View>
          </TouchableOpacity>

          {/* ── Login Link ── */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.bottomLink}>Login</Text>
            </TouchableOpacity>
          </View>

        </View>
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

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: SCREEN_HEIGHT < 700 ? 10 : 18,
    paddingBottom: 8,
    justifyContent: 'center',
  },

  // ── Avatar ──
  avatarWrapper: {
    alignSelf: 'center',
    width: 110,
    height: 140,
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
    height: 55,
  },

  // ── Heading ──
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.48)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },

  // ── Labels ──
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  labelSpacing: {
    marginTop: 10,
  },
  optionalTag: {
    fontWeight: '400',
    color: 'rgba(255,255,255,0.40)',
    fontSize: 11,
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
    height: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  eyeIcon: {
    fontSize: 16,
    paddingLeft: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 11,
    marginTop: 3,
    marginLeft: 4,
  },

  // ── Sign Up Button ──
  signUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    borderRadius: 30,
    height: 52,
    marginTop: 18,
    marginBottom: 16,
    shadowColor: Colors.neonGreen,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  signUpIcon: {
    fontSize: 15,
    color: '#0A0A0A',
    marginRight: 8,
  },
  signUpLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 0.4,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 12,
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
    height: 50,
    marginBottom: 16,
  },
  gLetterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gLetter: {
    fontSize: 17,
    fontWeight: '800',
  },
  gBlue: {
    color: '#4285F4',
  },
  gRed: {
    color: '#EA4335',
  },
  gYellow: {
    color: '#FBBC05',
  },
  gGreen: {
    color: '#34A853',
  },

  // ── Bottom link ──
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 13,
  },
  bottomLink: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default SignUp;
