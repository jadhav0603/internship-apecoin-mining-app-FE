import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2B1A',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  avatarContainer: {
  width: 60,
  height: 60,
  borderRadius: 30,
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: '#39FF14',
  marginRight: 12,
},

avatar: {
  width: '100%',
  height: '100%',
},

avatarFallback: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

avatarText: {
  color: '#fff',
  fontSize: 22,
  fontWeight: 'bold',
},

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // avatar: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 25,
  //   marginRight: 12,
  //   borderWidth: 2,
  //   borderColor: '#A6FF00',
  // },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  plan: {
    backgroundColor: '#A6FF00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  planText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },

  email: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  loadingText: {
    color: '#FFFFFF',
  },

  menuBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  menuIcon: {
    color: '#fff',
    fontSize: 18,
  },
});

export default styles;
