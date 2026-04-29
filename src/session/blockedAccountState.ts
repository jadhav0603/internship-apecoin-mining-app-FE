import { useEffect, useState } from 'react';

export type BlockedAccountCode = 'ACCOUNT_BANNED' | 'ACCOUNT_DELETED';
export type BlockedAccountType = 'banned' | 'deleted';
export type BlockedAccountSource = 'delete' | 'login';

export type BlockedAccountState = {
  code: BlockedAccountCode;
  type: BlockedAccountType;
  source: BlockedAccountSource;
  reason?: string | null;
  message?: string;
  sessionToken?: string | null;
};

type BlockedAccountListener = (state: BlockedAccountState | null) => void;

let currentBlockedAccount: BlockedAccountState | null = null;
const listeners = new Set<BlockedAccountListener>();

const emit = () => {
  listeners.forEach(listener => listener(currentBlockedAccount));
};

export const getBlockedAccount = () => currentBlockedAccount;

export const setBlockedAccount = (state: BlockedAccountState) => {
  currentBlockedAccount = state;
  emit();
};

export const clearBlockedAccount = () => {
  if (!currentBlockedAccount) {
    return;
  }

  currentBlockedAccount = null;
  emit();
};

export const subscribeBlockedAccount = (listener: BlockedAccountListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const useBlockedAccount = () => {
  const [blockedAccount, setBlockedAccountState] = useState<BlockedAccountState | null>(
    getBlockedAccount(),
  );

  useEffect(() => subscribeBlockedAccount(setBlockedAccountState), []);

  return blockedAccount;
};

export const isBlockedAccountError = (error: any): boolean =>
  error?.response?.status === 403 &&
  (error?.response?.data?.code === 'ACCOUNT_BANNED' ||
    error?.response?.data?.code === 'ACCOUNT_DELETED');

export const getBlockedAccountFromStatus = (
  status?: string | null,
  options?: {
    source?: BlockedAccountSource;
    reason?: string | null;
    message?: string;
  },
): BlockedAccountState | null => {
  if (status !== 'banned' && status !== 'deleted') {
    return null;
  }

  return {
    code: status === 'banned' ? 'ACCOUNT_BANNED' : 'ACCOUNT_DELETED',
    type: status,
    source: options?.source ?? 'login',
    reason: options?.reason ?? null,
    sessionToken: null,
    message:
      options?.message ??
      (status === 'banned'
        ? 'Your account has been banned.'
        : 'Your account has been deleted.'),
  };
};

export const getBlockedAccountFromError = (
  error: any,
  source: BlockedAccountSource = 'login',
): BlockedAccountState | null => {
  if (!isBlockedAccountError(error)) {
    return null;
  }

  const code = error?.response?.data?.code as BlockedAccountCode;
  const type = code === 'ACCOUNT_BANNED' ? 'banned' : 'deleted';

  return {
    code,
    type,
    source,
    sessionToken: null,
    reason:
      error?.response?.data?.reason ??
      error?.response?.data?.banReason ??
      null,
    message:
      typeof error?.response?.data?.message === 'string'
        ? error.response.data.message
        : type === 'banned'
          ? 'Your account has been banned.'
          : 'Your account has been deleted.',
  };
};
