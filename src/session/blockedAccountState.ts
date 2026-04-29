import { useEffect, useState } from 'react';

export type BlockedAccountCode = 'ACCOUNT_BANNED' | 'ACCOUNT_DELETED';
export type BlockedAccountStatus = 'BANNED' | 'DELETED';

export type BlockedAccountState = {
  code: BlockedAccountCode;
  status: BlockedAccountStatus;
  reason?: string | null;
  message?: string;
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

export const getBlockedAccountFromError = (
  error: any,
): BlockedAccountState | null => {
  if (!isBlockedAccountError(error)) {
    return null;
  }

  const code = error?.response?.data?.code as BlockedAccountCode;

  return {
    code,
    status: code === 'ACCOUNT_BANNED' ? 'BANNED' : 'DELETED',
    reason:
      error?.response?.data?.reason ??
      error?.response?.data?.banReason ??
      error?.response?.data?.deleteReason ??
      null,
    message:
      typeof error?.response?.data?.message === 'string'
        ? error.response.data.message
        : undefined,
  };
};
