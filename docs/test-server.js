// this file starts a development server that rebuilds the docs site as you edit it

// pass roosevelt's `--build` flag to write the site out without serving it, which is what `npm run build` and `npm run build-dev` do; in development mode roosevelt rebuilds the pages you edit and reloads the browser itself
;(async () => {
  // `--no-frontend-reload` turns off the injected live reload script and its websocket. the tests pass it because a browser resetting that websocket while navigating crashes the server, and they have no use for live reload anyway
  const params = process.argv.includes('--no-frontend-reload') ? { frontendReload: { enable: false } } : {}
  await require('roosevelt')(params).startServer()
})()
