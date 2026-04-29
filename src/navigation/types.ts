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
  AccountBlocked: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  Mining: { time: number };
  TransactionHistory:
    | {
        refreshKey?: number;
      }
    | undefined;
  ReportIssue: undefined;
  TicketList: undefined;
  TicketDetail: {
    ticketId: string;
  };
  Leaderboard: {
    username?: string;
    email?: string;
    avatarUri?: string;
  } | undefined;
  ReferAndEarn: {
    email?: string;
    username?: string;
  } | undefined;
  MyProgress: undefined;
  ProfileDetails: undefined;
  AboutUs: undefined;
};
