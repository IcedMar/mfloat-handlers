self.addEventListener("install", async (event) => {
  event.waitUntil(
      fetch("/firebase-config")
          .then(response => response.json())
          .then(firebaseConfig => {
              importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
              importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js");

              firebase.initializeApp(firebaseConfig);
              const messaging = firebase.messaging();

              messaging.onBackgroundMessage(function(payload) {
                  console.log("[firebase-messaging-sw.js] Received background message", payload);
                  const notificationTitle = payload.notification.title || "New Support Request";
                  const notificationOptions = {
                      body: payload.notification.body || "You have a new support request.",
                      icon: "/favicon.ico"
                  };
                  self.registration.showNotification(notificationTitle, notificationOptions);
              });
          })
          .catch(error => console.error("Failed to fetch Firebase config", error))
  );
});