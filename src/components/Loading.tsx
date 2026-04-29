import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

type MonkeyLoaderProps = {
  text?: string;
};

const MonkeyLoader = ({ text = 'Loading...' }: MonkeyLoaderProps) => {
  return (
     <View style={styles.container}>
      <View style={styles.content}>
        <LottieView
          // source={require('../assets/animations/monkey1.json')}
            // source={require('../assets/animations/Walking monkey.json')}
          // source={require('../assets/animations/gorilla.json')}
          source={require('../assets/animations/chimpanzee.json')}

          autoPlay
          loop
          renderMode="HARDWARE"
          style={styles.lottie}
          speed={0.9} // 🔥 smooth natural speed
        />

        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

export default MonkeyLoader;

const styles = StyleSheet.create({
 container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent', 
},
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 180,
    height: 180,
  },
  text: {
    marginTop: 16,
    color: '#B7FF31',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
