if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then((registration) => {
    navigator.serviceWorker.addEventListener('message', (evt) => {
      console.log('ServiceWorker message', evt);
    });
  }).catch((error) => {
    console.error('FAILED to register service worker', error);
  });
}
