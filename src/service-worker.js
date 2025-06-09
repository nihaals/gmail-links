const cacheName = "static-v1"
const precachedAssets = ["/"]

/** @param {Response} response */
const updateOfflineStatus = async (response) => {
  const responseText = await response.text()
  // DOMParser is not available in service workers
  const newResponseText = responseText.replace(
    '<span id="offline-status">Online-only</span>',
    '<span id="offline-status">Offline-first</span>',
  )
  return new Response(newResponseText, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  })
}

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName)
      await cache.addAll(precachedAssets)
      const response = await cache.match("/")
      if (response) {
        const modifiedResponse = await updateOfflineStatus(response)
        await cache.put("/", modifiedResponse)
      }
    })(),
  )
})

self.addEventListener("activate", async (event) => {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(async (name) => {
      if (name !== cacheName) {
        await caches.delete(name)
      }
    }),
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
        const modifiedResponse = await updateOfflineStatus(response)
        await cache.put(event.request, modifiedResponse.clone())
        return modifiedResponse
      })()
      return cachedResponse || networkResponse
    })(),
  )
})
