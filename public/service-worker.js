const cacheName = "v1";
const preCacheResources = [
  // 添加需要预缓存的资源列表
  "/.next/static",
  "/public",
  "/",
  "/index.html",
  "/styles/main.css",
  "/scripts/main.js",
  // 更多资源...
];
// 安装事件：预缓存关键资源
self.addEventListener("install", (e) => {
  console.log("Service Worker: Installed");
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
        cache.addAll(preCacheResources);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件：清理旧缓存
self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activated");
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
// 尝试从网络获取资源，并将响应克隆到缓存
const cacheClone = async (e) => {
  const res = await fetch(e.request);
  const resClone = res.clone();
  const cache = await caches.open(cacheName);
  await cache.put(e.request, resClone);
  return res;
};

// Fetch 事件：网络优先，然后缓存
self.addEventListener("fetch", (e) => {
  e.respondWith(
    cacheClone(e)
      .catch(() => caches.match(e.request))
      .then((res) => res || fetch(e.request))
  );
});
