import {
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
import { Colors } from '../../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2B1A',
  },
  flex: { flex: 1 },

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
    shadowOffset: { width: 0, height: 6 },
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

export default styles;
