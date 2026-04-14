import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Reward: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  Mining: undefined;
};
