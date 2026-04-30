import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../constants/COLORS';
import Loading from '../components/constant/Loading';

type StartAdOptions = {
  onAdShown?: () => void;
};

type UseAdLoadingGateParams = {
  isLoaded: boolean;
  load: () => void;
  show: () => void;
};

type GateStatus = 'idle' | 'loading' | 'failed';

export const useAdLoadingGate = ({
  isLoaded,
  load,
  show,
}: UseAdLoadingGateParams) => {
  const [status, setStatus] = useState<GateStatus>('idle');
  const callbacksRef = useRef<StartAdOptions>({});
  const hasShownRef = useRef(false);

  const resetGate = useCallback(() => {
    setStatus('idle');
    hasShownRef.current = false;
  }, []);

  const showLoadedAd = useCallback(() => {
    if (hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;
    setStatus('idle');

    try {
      show();
      callbacksRef.current.onAdShown?.();
    } catch (error) {
      console.warn('[ads] failed to show loaded ad:', error);
      setStatus('failed');
    }
  }, [show]);

  const startAd = useCallback(
    (options: StartAdOptions = {}) => {
      callbacksRef.current = options;
      hasShownRef.current = false;
      setStatus('loading');

      if (isLoaded) {
        requestAnimationFrame(showLoadedAd);
        return;
      }

      try {
        load();
      } catch (error) {
        console.warn('[ads] failed to start ad load:', error);
        setStatus('failed');
      }
    },
    [isLoaded, load, showLoadedAd],
  );

  useEffect(() => {
    if (status === 'loading' && isLoaded) {
      showLoadedAd();
    }
  }, [isLoaded, showLoadedAd, status]);

  const retry = useCallback(() => {
    startAd(callbacksRef.current);
  }, [startAd]);

  const adLoadingModal = (
    <Modal
      visible={status !== 'idle'}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={status === 'failed' ? resetGate : undefined}
    >
      <View style={styles.overlay}>
        {status === 'loading' ? (
          <Loading size="medium" text="Loading ad..." />
        ) : (
          <View style={styles.card}>
            <>
              <Text style={styles.title}>Failed to load ad. Please try again.</Text>
              <View style={styles.actions}>
                <Pressable style={styles.retryButton} onPress={retry}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
                <Pressable style={styles.closeButton} onPress={resetGate}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>
            </>
          </View>
        )}
      </View>
    </Modal>
  );

  return {
    startAd,
    adLoadingModal,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(141, 255, 89, 0.28)',
    backgroundColor: '#101B0E',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  retryButton: {
    minWidth: 104,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: COLORS.textDark,
    fontWeight: '800',
  },
  closeButton: {
    minWidth: 104,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
