import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, Route } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { CacheThisURL } from "./CacheThisURL.js";

// Do precaching
precacheAndRoute(self.__WB_MANIFEST);

function isCacheable(url) {
  const theUrl = url.endsWith("/") ? url : `${url}/`;
  return CacheThisURL.find((cursor) => {
    if (theUrl.startsWith(cursor.host)) {
      const result = cursor.path.find((path) => {
        if (theUrl.startsWith(cursor.host + path)) {
          return true;
        }
        return false;
      });
      return result;
    }
    return false;
  });
}

const backendAPI = new Route(
  ({ url }) => isCacheable(url.href),
  new StaleWhileRevalidate({
    cacheName: process.env.HOST || `${window.location.protocol}//${window.location.hostname}`,
  }),
);

registerRoute(backendAPI);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("push", (event) => {
  const notificationData = {
    title: "Push Notification",
    options: {
      body: "This is a push notification",
      icon: "/favicon.webp",
      image: "/icon-512x512/icon-512x512.webp",
    },
  };

  const showNotification = self.registration.showNotification(
    notificationData.title,
    notificationData.options,
  );

  event.waitUntil(showNotification);
});
