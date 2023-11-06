self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("my-cache").then((cache) => {
      return cache.addAll([
        "/login",
        "/",
        "/assets/js/plugin/webfont/webfont.min.js",
        "/assets/css/bootstrap.min.css",
        "/assets/css/atlantis.css",
        "/assets/css/demo.css",
        "/assets/images/logo/150x150.png",
        "/assets/images/logo/192x192.png",
        "/assets/images/logo/512x512.png",
        "/assets/images/logo/1000x1000.png",
        "/assets/js/core/jquery.3.2.1.min.js",
        "/assets/js/core/popper.min.js",
        "/assets/js/core/bootstrap.min.js",
        "/assets/js/plugin/jquery-ui-1.12.1.custom/jquery-ui.min.js",
        "/assets/js/plugin/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js",
        "/assets/js/plugin/bootstrap-toggle/bootstrap-toggle.min.js",
        "/assets/js/plugin/jquery-scrollbar/jquery.scrollbar.min.js",
        "/assets/js/atlantis.min.js",
        "/assets/js/setting-demo2.js",
        "/assets/js/plugin/bootstrap-notify/bootstrap-notify.min.js",
        "/assets/js/alert.js",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
