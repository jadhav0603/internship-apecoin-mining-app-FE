// import React from 'react';
// import { View, Text, Pressable } from 'react-native';
// import { useMining } from '../../context/MiningContext';
// import { useNavigation } from '@react-navigation/native';
// import { useRoute } from '@react-navigation/native';

// const MiningLiveBar = () => {
//   const { isMining, secondsLeft, earned } = useMining();
//   const navigation = useNavigation<any>();

//   const route = useRoute();

// if (route.name === 'Mining') return null;

//   if (!isMining) return null;

//   return (
//  <View
//       style={{
//         position: 'absolute',
//         bottom: 120, // 👈 above tab bar
//         left: 16,
//         right: 16,
//         backgroundColor: '#111',
//         padding: 12,
//         borderRadius: 16,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         zIndex: 999,
//       }}
//     >
//       <Text style={{ color: 'white' }}>
//         ⏱ {secondsLeft}s | 💰 {earned.toFixed(4)}
//       </Text>

//       <Pressable onPress={() => navigation.navigate('Mining')}>
//         <Text style={{ color: 'lime' }}>VIEW</Text>
//       </Pressable>
//     </View>
//   );
// };

// export default MiningLiveBar;

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useMining } from '../../context/MiningContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const MiningLiveBar = () => {
  const { isMining, secondsLeft, earned } = useMining();
  const navigation = useNavigation<any>();
  const route = useRoute();

  if (route.name === 'Mining') return null;
  if (!isMining) return null;

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 120,
        left: 16,
        right: 16,
        backgroundColor: '#1A1A1A',
        padding: 14,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        // shadow / elevation
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      {/* LEFT CONTENT */}
      <View>
        <Text style={{ color: '#aaa', fontSize: 12 }}>Mining in progress</Text>

        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            marginTop: 2,
          }}
        >
          ⏱ {formatTime(secondsLeft)} • 💰 {earned.toFixed(11)}
        </Text>
      </View>

      {/* BUTTON */}
      <Pressable
        onPress={() => navigation.navigate('Mining')}
        style={({ pressed }) => ({
          backgroundColor: '#40a920ff',
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 20,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <Text
          style={{
            color: '#000',
            fontWeight: '700',
            fontSize: 13,
          }}
        >
          VIEW
        </Text>
      </Pressable>
    </View>
  );
};

export default MiningLiveBar;
