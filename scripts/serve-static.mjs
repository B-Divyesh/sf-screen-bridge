import { createReadStream, promises as fs } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = resolve('dist')
const port = Number(process.env.PORT || 4173)
const config = JSON.parse(await fs.readFile(resolve(root, 'staticwebapp.config.json'), 'utf8'))
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
}

function routeHeaders(pathname) {
  const route = config.routes?.find((item) => item.route === pathname || (item.route.endsWith('/*') && pathname.startsWith(item.route.slice(0, -1))))
  return { ...(config.globalHeaders || {}), ...(route?.headers || {}) }
}

async function fileFor(pathname) {
  const route = config.routes?.find((item) => item.route === pathname)
  const requested = (route?.rewrite || pathname).replace(/^\/+/, '') || 'index.html'
  const file = resolve(root, requested)
  if (file !== root && !file.startsWith(`${root}${sep}`)) return undefined
  try {
    return (await fs.stat(file)).isFile() ? file : undefined
  } catch {
    return undefined
  }
}

createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', `http://${request.headers.host}`).pathname
  let file = await fileFor(pathname)
  let status = 200
  if (!file) {
    file = await fileFor(config.responseOverrides?.['404']?.rewrite || '/offline.html')
    status = 404
  }
  if (!file) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(status, { ...routeHeaders(pathname), 'Content-Type': contentTypes[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1')
