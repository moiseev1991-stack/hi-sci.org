// Cloudflare Worker entry-point for the static site.
// Handles 301 redirects from the legacy /blog/<slug>/ structure
// to the new flat /<slug>/ paths, then defers to the static assets binding.

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    const cfVisitor = request.headers.get('CF-Visitor')
    let scheme = url.protocol.replace(':', '')
    if (cfVisitor) {
      try { scheme = JSON.parse(cfVisitor).scheme || scheme } catch {}
    }
    const xfProto = request.headers.get('X-Forwarded-Proto')
    if (xfProto) scheme = xfProto

    if (scheme === 'http') {
      url.protocol = 'https:'
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          'Cache-Control': 'no-store',
        },
      })
    }

    if (url.pathname === '/blog' || url.pathname === '/blog/') {
      return Response.redirect(url.origin + '/' + url.search, 301)
    }

    if (url.pathname.startsWith('/blog/')) {
      const stripped = url.pathname.slice('/blog'.length) || '/'
      return Response.redirect(url.origin + stripped + url.search, 301)
    }

    return env.ASSETS.fetch(request)
  },
}
