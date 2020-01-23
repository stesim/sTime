if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then((registration) => {
  }).catch((error) => {
    console.error('FAILED to register service worker', error);
  });
}
