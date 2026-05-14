// Automated scheduling requires OneSignal Growth plan
// For free tier: send manual campaigns from dashboard
// Users are tagged for targeting regardless of plan

export function useNotifications() {

  const isSupported = () => {
    return typeof window !== 'undefined' &&
           'OneSignal' in window ||
           window.OneSignalDeferred !== undefined;
  };

  const getOneSignal = () => {
    return new Promise((resolve) => {
      if (window.OneSignal) {
        resolve(window.OneSignal);
        return;
      }
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push((OneSignal) => {
        resolve(OneSignal);
      });
    });
  };

  const requestPermission = async () => {
    try {
      const OneSignal = await getOneSignal();
      await OneSignal.Notifications.requestPermission();
      const permission = OneSignal.Notifications.permission;
      if (permission) {
        localStorage.setItem('notificationsEnabled', 'true');
        await OneSignal.User.addTags({
          lunch_reminder: 'true',
          dinner_reminder: 'true',
          app_version: '1.0',
          platform: 'pwa',
        });
      }
      return permission;
    } catch (err) {
      console.error('Notification permission error:', err);
      return false;
    }
  };

  const isEnabled = () => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  };

  const disable = async () => {
    try {
      const OneSignal = await getOneSignal();
      await OneSignal.User.PushSubscription.optOut();
      localStorage.setItem('notificationsEnabled', 'false');
    } catch (err) {
      console.error('Disable notifications error:', err);
    }
  };

  const enable = async () => {
    return await requestPermission();
  };

  const hasPromptBeenShown = () => {
    return localStorage.getItem('notificationPromptShown') === 'true';
  };

  const markPromptShown = () => {
    localStorage.setItem('notificationPromptShown', 'true');
  };

  return {
    isSupported,
    requestPermission,
    isEnabled,
    disable,
    enable,
    hasPromptBeenShown,
    markPromptShown,
  };
}
