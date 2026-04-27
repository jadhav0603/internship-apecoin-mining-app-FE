type EventCallback = (...args: any[]) => void;

class GlobalEventEmitter {
  private listeners: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }
}

export const globalEvents = new GlobalEventEmitter();

export const EVENT_NAMES = {
  SHOW_ALERT: 'SHOW_ALERT',
  SHOW_CONFIRM: 'SHOW_CONFIRM',
};
