if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then((registration) => {
    navigator.serviceWorker.addEventListener('message', (evt) => {
      switch (evt.data) {
        case 'reload':
          window.location.reload();
      }
    });
  }).catch((error) => {
    alert('Failed to register service worker');
  });
}
