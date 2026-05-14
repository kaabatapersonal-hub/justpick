import { useRegisterSW } from 'virtual:pwa-register/react';

export function useAppUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
  });

  return {
    needRefresh,
    updateNow: () => updateServiceWorker(true),
  };
}
