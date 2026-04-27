import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import CustomAlert, {
  type CustomAlertButton,
  type CustomAlertPresentationOptions,
} from '../components/CustomAlert';
import { EVENT_NAMES, globalEvents } from '../utils/GlobalEventEmitter';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

type AlertCallbacks = {
  onConfirm?: () => void;
  onCancel?: () => void;
};

export type AlertPresentationOptions = CustomAlertPresentationOptions & {
  dedupeKey?: string;
  allowDuplicate?: boolean;
};

export type StandardAlertOptions = AlertPresentationOptions & {
  title?: string;
};

export type ConfirmAlertOptions = AlertPresentationOptions & {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type QueuedAlert = {
  id: string;
  visible: boolean;
  type: AlertType;
  message: string;
  title: string;
  callbacks: AlertCallbacks;
  confirmText?: string;
  cancelText?: string;
  presentation: CustomAlertPresentationOptions;
  dedupeKey?: string;
};

type AlertState = QueuedAlert;

type AlertContextValue = AlertState & {
  hideAlert: () => void;
  showSuccess: (
    message: string,
    title?: string,
    options?: StandardAlertOptions,
  ) => void;
  showError: (
    message: string,
    title?: string,
    options?: StandardAlertOptions,
  ) => void;
  showWarning: (
    message: string,
    title?: string,
    options?: StandardAlertOptions,
  ) => void;
  showInfo: (
    message: string,
    title?: string,
    options?: StandardAlertOptions,
  ) => void;
  showConfirm: (options: ConfirmAlertOptions) => void;
};

const DEFAULT_PRESENTATION: CustomAlertPresentationOptions = {
  blurBackground: false,
  blurAmount: 12,
  dismissOnBackdropPress: true,
  theme: 'dark',
};

const DEFAULT_ALERT_STATE: AlertState = {
  id: '',
  visible: false,
  type: 'info',
  message: '',
  title: '',
  callbacks: {},
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  presentation: DEFAULT_PRESENTATION,
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

const ALERT_TITLES: Record<Exclude<AlertType, 'confirm'>, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

const createAlertId = () =>
  `alert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getAlertSignature = (
  alert: Pick<
    QueuedAlert,
    'type' | 'title' | 'message' | 'confirmText' | 'cancelText' | 'dedupeKey'
  >,
) =>
  [
    alert.dedupeKey ?? '',
    alert.type,
    alert.title,
    alert.message,
    alert.confirmText ?? '',
    alert.cancelText ?? '',
  ].join('::');

const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>(DEFAULT_ALERT_STATE);
  const queueRef = useRef<QueuedAlert[]>([]);

  const flushNextAlert = useCallback(() => {
    const nextAlert = queueRef.current.shift();

    if (nextAlert) {
      setAlertState({ ...nextAlert, visible: true });
      return;
    }

    setAlertState(DEFAULT_ALERT_STATE);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(current =>
      current.visible ? { ...current, visible: false } : current,
    );
  }, []);

  const enqueueAlert = useCallback(
    (nextAlert: QueuedAlert, allowDuplicate = false) => {
      const nextSignature = getAlertSignature(nextAlert);
      const hasActiveDuplicate =
        alertState.id !== '' && getAlertSignature(alertState) === nextSignature;
      const hasQueuedDuplicate = queueRef.current.some(
        queued => getAlertSignature(queued) === nextSignature,
      );

      if (!allowDuplicate && (hasActiveDuplicate || hasQueuedDuplicate)) {
        return;
      }

      if (!alertState.visible && alertState.id === '') {
        setAlertState({ ...nextAlert, visible: true });
        return;
      }

      queueRef.current.push({ ...nextAlert, visible: true });
    },
    [alertState],
  );

  const showAlert = useCallback(
    (
      type: Exclude<AlertType, 'confirm'>,
      message: string,
      title?: string,
      options?: StandardAlertOptions,
    ) => {
      enqueueAlert(
        {
          id: createAlertId(),
          visible: true,
          type,
          message,
          title: title ?? options?.title ?? ALERT_TITLES[type],
          callbacks: {},
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          dedupeKey: options?.dedupeKey,
          presentation: {
            ...DEFAULT_PRESENTATION,
            ...options,
          },
        },
        options?.allowDuplicate,
      );
    },
    [enqueueAlert],
  );

  const showSuccess = useCallback(
    (message: string, title?: string, options?: StandardAlertOptions) =>
      showAlert('success', message, title, options),
    [showAlert],
  );

  const showError = useCallback(
    (message: string, title?: string, options?: StandardAlertOptions) =>
      showAlert('error', message, title, options),
    [showAlert],
  );

  const showWarning = useCallback(
    (message: string, title?: string, options?: StandardAlertOptions) =>
      showAlert('warning', message, title, options),
    [showAlert],
  );

  const showInfo = useCallback(
    (message: string, title?: string, options?: StandardAlertOptions) =>
      showAlert('info', message, title, options),
    [showAlert],
  );

  const showConfirm = useCallback(
    (options: ConfirmAlertOptions) => {
      enqueueAlert(
        {
          id: createAlertId(),
          visible: true,
          type: 'confirm',
          title: options.title,
          message: options.message,
          callbacks: {
            onConfirm: options.onConfirm,
            onCancel: options.onCancel,
          },
          confirmText: options.confirmText ?? 'Confirm',
          cancelText: options.cancelText ?? 'Cancel',
          dedupeKey: options.dedupeKey,
          presentation: {
            ...DEFAULT_PRESENTATION,
            ...options,
          },
        },
        options.allowDuplicate,
      );
    },
    [enqueueAlert],
  );

  useEffect(() => {
    const unsubAlert = globalEvents.on(EVENT_NAMES.SHOW_ALERT, (args: any) => {
      const { type, message, title, options } = args;
      showAlert(type, message, title, options);
    });

    const unsubConfirm = globalEvents.on(EVENT_NAMES.SHOW_CONFIRM, (args: any) => {
      showConfirm(args);
    });

    return () => {
      unsubAlert();
      unsubConfirm();
    };
  }, [showAlert, showConfirm]);

  const handleConfirm = useCallback(() => {
    const onConfirm = alertState.callbacks.onConfirm;
    hideAlert();
    onConfirm?.();
  }, [alertState.callbacks.onConfirm, hideAlert]);

  const handleCancel = useCallback(() => {
    const onCancel = alertState.callbacks.onCancel;
    hideAlert();
    onCancel?.();
  }, [alertState.callbacks.onCancel, hideAlert]);

  const value = useMemo(
    () => ({
      ...alertState,
      hideAlert,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
    }),
    [
      alertState,
      hideAlert,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
    ],
  );

  const isConfirm = alertState.type === 'confirm';
  const buttons: CustomAlertButton[] = isConfirm
    ? [
        {
          label: alertState.cancelText ?? 'Cancel',
          onPress: handleCancel,
          variant: 'secondary',
        },
        {
          label: alertState.confirmText ?? 'Confirm',
          onPress: handleConfirm,
        },
      ]
    : [
        {
          label: 'OK',
          onPress: hideAlert,
        },
      ];

  return (
    <AlertContext.Provider value={value}>
      {children}

      <CustomAlert
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        buttons={buttons}
        presentation={alertState.presentation}
        onRequestClose={
          alertState.presentation.dismissOnBackdropPress === false
            ? undefined
            : isConfirm
            ? handleCancel
            : hideAlert
        }
        onHidden={flushNextAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }

  return context;
};

export { AlertProvider };
