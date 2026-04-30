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
import {Colors} from '../../theme/colors';

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
  passwordLabel: {
    marginTop: 14,
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
  // ── Loading Overlay ──
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#1A1A1A',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.2)',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
