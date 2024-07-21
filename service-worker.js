const cacheName = "static-v1"
const precachedAssets = ["/"]

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName)
      await cache.addAll(precachedAssets)
    })()
  )
})

self.addEventListener("activate", async (event) => {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(async (name) => {
      if (name !== cacheName) {
        await caches.delete(name)
      }
    })
  )
})

self.addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url)
  if (!precachedAssets.includes(url.pathname)) {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(event.request)
      const networkResponse = (async () => {
        const response = await fetch(event.request)
        await cache.put(event.request, response.clone())
        return response
      })()
      return cachedResponse || networkResponse
    })()
  )
})
