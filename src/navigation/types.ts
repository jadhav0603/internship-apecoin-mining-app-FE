import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Reward: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  AuthLoading: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  Mining: { time: number };
  Leaderboard: {
    username?: string;
    email?: string;
    avatarUri?: string;
  } | undefined;
  ReferAndEarn: {
    email?: string;
    username?: string;
  } | undefined;
};
