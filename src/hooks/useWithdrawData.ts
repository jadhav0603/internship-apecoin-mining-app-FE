import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  withdrawService,
  type WithdrawRecord,
} from '../services/withdrawService';

const normalizeStatus = (status: string | undefined) => status?.toLowerCase().trim();

export const useWithdrawData = () => {
  const [records, setRecords] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawRecords = useCallback(async () => {
    try {
      setLoading(true);
      const nextRecords = await withdrawService.getWithdrawRecords();
      setRecords(nextRecords);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to load withdraw records.';
      setError(message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawRecords().catch(() => undefined);
  }, [fetchWithdrawRecords]);

  const pendingRecords = useMemo(
    () => records.filter(item => normalizeStatus(item.status) === 'pending'),
    [records],
  );

  const paidRecords = useMemo(
    () => records.filter(item => normalizeStatus(item.status) === 'paid'),
    [records],
  );

  const isEmpty = !loading && !error && records.length === 0;

  return {
    records,
    pendingRecords,
    paidRecords,
    loading,
    error,
    isEmpty,
    refreshWithdrawRecords: fetchWithdrawRecords,
  };
};

export default useWithdrawData;
