if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('service worker registered', registration);
  }).catch((error) => {
    console.log('FAILED to register service worker', error);
  });
}
