import './style.css'
import { mergeTargets, targetPhrase, type Target } from './core'

type Scan = { savedAt: string; targets: Target[]; crop: { x: number; y: number; width: number; height: number } }

const app = document.querySelector<HTMLDivElement>('#app')!
const isLegal = location.pathname === '/privacy' || location.pathname === '/terms'

function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy'
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Screen Bridge`
  app.innerHTML = `<header class="topbar"><a class="brand" href="/" aria-label="Screen Bridge home"><span aria-hidden="true">◫</span> SCREEN BRIDGE</a></header><main id="main" class="legal"><p class="eyebrow">LOCAL-FIRST UTILITY</p><h1>${privacy ? 'Privacy that stays on your screen' : 'Plain-language terms'}</h1>${privacy ? `<p>Screen Bridge processes captures in this browser. It does not upload screen images, OCR results, or license tokens to us.</p><h2>What is stored</h2><p>Your theme and optional saved scan summaries live in your browser. Screenshots are never saved by the app. Exported JSON is created only when you ask for it. You can delete saved scans from the workspace or clear site data in your browser.</p><h2>Paid licenses</h2><p>If you choose to restore or buy a paid unlock, the token is stored locally and is checked with Sociobot’s licensing service at most once daily. Sociobot/Dodo is the merchant of record.</p>` : `<p>Screen Bridge is an assistive aid, not a replacement for a screen reader, a remote-desktop controller, or professional advice. It labels visual regions locally and can be wrong.</p><h2>Your responsibility</h2><p>Confirm important actions yourself. Do not rely on Screen Bridge for safety-critical navigation, medical decisions, or emergency situations.</p><h2>Paid unlock</h2><p>The optional Studio unlock is a one-time purchase through Sociobot. Refunds are handled by the merchant of record; revoked licenses stop unlocking Studio features.</p>`}<p><a href="/">Return to Screen Bridge</a></p></main>`
}

if (isLegal) legalPage(location.pathname === '/privacy' ? 'privacy' : 'terms')
else startApp()

function startApp() {
  const returnedLicense = new URLSearchParams(location.search).get('license')
  if (returnedLicense) {
    localStorage.setItem('sb_license:screen-bridge', returnedLicense)
    const url = new URL(location.href); url.searchParams.delete('license'); history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }
  let sourceCanvas: HTMLCanvasElement | null = null
  let cropCanvas: HTMLCanvasElement | null = null
  let targets: Target[] = []
  let selected = 0
  let currentCrop = { x: 0, y: 0, width: 0, height: 0 }
  let stream: MediaStream | null = null
  const saved = new Map<string, Scan>()

  app.innerHTML = `
    <header class="topbar"><a class="brand" href="/" aria-label="Screen Bridge home"><span aria-hidden="true">◫</span> SCREEN BRIDGE</a><div class="top-actions"><button class="quiet" id="theme" type="button" aria-pressed="false">Day mode</button><a class="quiet" href="#how">How it works</a></div></header>
    <main id="main">
      <section class="intro" aria-labelledby="title"><div><p class="eyebrow">PRIVATE PIXEL ACCESSIBILITY</p><h1 id="title">Make one visual region reachable.</h1><p class="lede">Capture a remote desktop or visual-only dialog, crop the part you need, and turn its local text and visual boundaries into numbered keyboard targets.</p><div class="actions"><button id="capture" class="primary" type="button">Capture screen <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>S</kbd></button><button id="sample" class="secondary" type="button">Try a safe sample</button></div><p class="privacy-note"><span aria-hidden="true">▣</span> Captures are processed on this device. Nothing is streamed or uploaded.</p></div><figure class="signal"><img src="/signal-desk.webp" width="960" height="640" fetchpriority="high" decoding="async" alt="Abstract pixel illustration: a screen region resolves into linked mint and amber signal nodes."><figcaption>Original AI-generated signal-desk illustration.</figcaption></figure></section>
      <section class="workspace" aria-label="Screen analysis workspace">
        <div class="stage-head"><div><p class="eyebrow">01 / CAPTURE AND CROP</p><h2>Screen region</h2></div><p id="state" class="state" role="status">Ready. Capture a screen or try the sample.</p></div>
        <div class="capture-area" id="capture-area"><div class="empty" id="empty"><span aria-hidden="true">▧</span><strong>No image in the bridge</strong><p>Choose a screen, window, or tab. Then set the crop values below.</p></div><canvas id="preview" hidden aria-label="Captured screen preview"></canvas><div id="overlay" class="target-overlay" aria-hidden="true"></div></div>
        <div class="crop-controls" id="crop-controls" hidden><label>Left <input id="crop-x" type="number" min="0" value="0" inputmode="numeric"></label><label>Top <input id="crop-y" type="number" min="0" value="0" inputmode="numeric"></label><label>Width <input id="crop-w" type="number" min="1" value="0" inputmode="numeric"></label><label>Height <input id="crop-h" type="number" min="1" value="0" inputmode="numeric"></label><button id="analyze" class="primary" type="button">Analyze this crop</button></div>
        <div class="result-head"><div><p class="eyebrow">02 / KEYBOARD TARGETS</p><h2>Detected controls</h2></div><p class="key-help">Press <kbd>1</kbd>–<kbd>9</kbd>, then <kbd>Enter</kbd> to hear a target.</p></div>
        <div id="results" class="results" aria-live="polite"><div class="empty small"><span aria-hidden="true">⌁</span><strong>Awaiting a crop</strong><p>Targets will appear in reading order. Low-confidence items are clearly marked.</p></div></div>
        <div class="save-row" id="save-row" hidden><button id="save" class="secondary" type="button">Save target list locally</button><button id="export" class="quiet" type="button">Export JSON</button><label class="import-label">Import JSON<input id="import" type="file" accept="application/json"></label></div>
      </section>
      <section id="how" class="how"><p class="eyebrow">A NARROW BRIDGE, NOT A REPLACEMENT SCREEN READER</p><ol><li><span>1</span> You choose the screen and the region.</li><li><span>2</span> OCR and boundary finding run locally.</li><li><span>3</span> Number keys confirm labels aloud; use that information with your existing tools.</li></ol><p>Free local core includes capture, OCR, target lists, and export. <a href="https://api.sociobot.in/api/v1/products/screen-bridge/checkout">Studio unlock — one-time purchase</a> adds future desktop-capture integrations and support.</p><details><summary>Restore a Studio license</summary><form id="license-form"><label for="license">License token</label><input id="license" autocomplete="off"><button class="secondary" type="submit">Restore license</button><p id="license-status" role="status"></p></form></details></section>
    </main><footer><span>Screen Bridge processes locally by default.</span><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer><div id="toast" class="toast" hidden role="status"><span>Update ready.</span><button id="reload" type="button">Refresh</button></div><div id="announcer" class="sr-only" aria-live="assertive"></div>`

  const $ = <T extends HTMLElement>(selector: string) => app.querySelector<T>(selector)!
  const state = $('#state'), preview = $('#preview') as HTMLCanvasElement, results = $('#results'), overlay = $('#overlay'), cropControls = $('#crop-controls'), saveRow = $('#save-row'), announcer = $('#announcer')
  const setState = (message: string) => { state.textContent = message; announcer.textContent = message }
  const say = (message: string) => { announcer.textContent = message; if ('speechSynthesis' in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(message)) } }

  function drawResults() {
    overlay.replaceChildren()
    if (!targets.length) { results.innerHTML = `<div class="empty small"><span aria-hidden="true">⌁</span><strong>No confident target found</strong><p>Try tightening the crop around one dialog or use a clearer image.</p></div>`; saveRow.hidden = true; return }
    results.innerHTML = targets.map(target => `<button class="target ${target.confidence < 60 ? 'uncertain' : ''}" type="button" data-id="${target.id}" aria-label="${targetPhrase(target)}"><b>${target.id}</b><span><strong>${escapeHtml(target.label)}</strong><small>${target.kind === 'visual' ? 'Visual boundary' : 'OCR text'} · ${target.confidence}% confidence${target.confidence < 60 ? ' · uncertain' : ''}</small></span><span aria-hidden="true">↗</span></button>`).join('')
    for (const target of targets) {
      const marker = document.createElement('span'); marker.className = `marker ${target.confidence < 60 ? 'uncertain' : ''}`; marker.textContent = String(target.id); marker.style.left = `${(target.x / currentCrop.width) * 100}%`; marker.style.top = `${(target.y / currentCrop.height) * 100}%`; overlay.append(marker)
    }
    saveRow.hidden = false
  }

  function selectTarget(id: number) { const target = targets.find(item => item.id === id); if (!target) return; selected = id; results.querySelectorAll('.target').forEach(item => item.classList.toggle('selected', Number((item as HTMLElement).dataset.id) === id)); say(targetPhrase(target)); setState(`Selected target ${id}. Press Enter to repeat it.`) }

  function cropFromInputs() {
    if (!sourceCanvas) return null
    const x = Math.max(0, Number(($('#crop-x') as HTMLInputElement).value) || 0), y = Math.max(0, Number(($('#crop-y') as HTMLInputElement).value) || 0)
    const width = Math.min(sourceCanvas.width - x, Math.max(1, Number(($('#crop-w') as HTMLInputElement).value) || sourceCanvas.width))
    const height = Math.min(sourceCanvas.height - y, Math.max(1, Number(($('#crop-h') as HTMLInputElement).value) || sourceCanvas.height))
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; canvas.getContext('2d', { willReadFrequently: true })!.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height); currentCrop = { x, y, width, height }; cropCanvas = canvas; return canvas
  }

  async function analyze() {
    const canvas = cropFromInputs(); if (!canvas) return
    setState('Reading the crop locally. This can take a few seconds the first time.'); results.innerHTML = `<div class="empty small"><span class="spinner" aria-hidden="true">⌁</span><strong>Reading locally…</strong><p>English recognition data is stored with this app for offline use.</p></div>`
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, { workerPath: '/tesseract/worker.min.js', corePath: '/tesseract', langPath: '/tessdata', logger: message => { if (message.status === 'recognizing text') setState(`Reading locally… ${Math.round((message.progress || 0) * 100)}%`) } })
      const { data } = await worker.recognize(canvas)
      await worker.terminate()
      targets = mergeTargets(data.words as never, canvas.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, canvas.width, canvas.height))
      drawResults(); setState(targets.length ? `${targets.length} targets found. Use a number, then Enter, to hear one.` : 'No clear target found. Tighten the crop and try again.')
    } catch (error) { console.error(error); results.innerHTML = `<div class="error"><strong>Could not read this crop locally.</strong><p>Check that Screen Bridge has been opened while online once, then retry. Your image was not uploaded.</p></div>`; setState('Local recognition failed. Try again after opening the app online.') }
  }

  async function capture() {
    if (!navigator.mediaDevices?.getDisplayMedia) { setState('This browser does not offer screen capture. Try a current desktop browser or use the sample.'); return }
    try { stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser' }, audio: false }); const video = document.createElement('video'); video.srcObject = stream; await video.play(); sourceCanvas = document.createElement('canvas'); sourceCanvas.width = video.videoWidth; sourceCanvas.height = video.videoHeight; sourceCanvas.getContext('2d')!.drawImage(video, 0, 0); stream.getTracks().forEach(track => track.stop()); stream = null; loadCapture(sourceCanvas, 'Capture ready. Set a crop around one dialog, then analyze it.') } catch (error) { console.info('Capture was not started', error); setState('Capture was cancelled or unavailable. Nothing was retained.') }
  }

  function loadCapture(canvas: HTMLCanvasElement, message: string) { sourceCanvas = canvas; preview.width = canvas.width; preview.height = canvas.height; preview.getContext('2d')!.drawImage(canvas, 0, 0); preview.hidden = false; $('#empty').hidden = true; cropControls.hidden = false; (['crop-x', 'crop-y'] as const).forEach(id => (app.querySelector<HTMLInputElement>(`#${id}`)!.value = '0')); $('#crop-w').setAttribute('max', String(canvas.width)); $('#crop-h').setAttribute('max', String(canvas.height)); $('#crop-w').setAttribute('value', String(canvas.width)); $('#crop-h').setAttribute('value', String(canvas.height)); ($('#crop-w') as HTMLInputElement).value = String(canvas.width); ($('#crop-h') as HTMLInputElement).value = String(canvas.height); setState(message) }

  function sample() { const canvas = document.createElement('canvas'); canvas.width = 920; canvas.height = 520; const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#f5f3ea'; ctx.fillRect(0, 0, 920, 520); ctx.fillStyle = '#192633'; ctx.fillRect(110, 80, 700, 350); ctx.fillStyle = '#f5f3ea'; ctx.font = '700 34px system-ui'; ctx.fillText('Connection settings', 150, 145); ctx.font = '24px system-ui'; ctx.fillText('Server address', 150, 210); ctx.strokeStyle = '#9ff5c5'; ctx.lineWidth = 4; ctx.strokeRect(150, 232, 580, 52); ctx.fillText('Save connection', 500, 365); ctx.fillText('Cancel', 665, 365); ctx.strokeStyle = '#f4d166'; ctx.strokeRect(470, 320, 180, 72); ctx.strokeRect(660, 320, 100, 72); loadCapture(canvas, 'Safe sample ready. Analyze it to test the full local workflow.') }

  function saveScan() { if (!targets.length) return; const scan: Scan = { savedAt: new Date().toISOString(), targets, crop: currentCrop }; saved.set(scan.savedAt, scan); const request = indexedDB.open('screen-bridge', 1); request.onupgradeneeded = () => request.result.createObjectStore('scans', { keyPath: 'savedAt' }); request.onsuccess = () => { const tx = request.result.transaction('scans', 'readwrite'); tx.objectStore('scans').put(scan); tx.oncomplete = () => { setState('Target list saved locally. No screenshot was saved.'); request.result.close() } } }
  function exportScan() { const body = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), targets, crop: currentCrop }, null, 2); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'application/json' })); a.download = 'screen-bridge-targets.json'; a.click(); URL.revokeObjectURL(a.href); setState('Target list exported as JSON.') }
  function importScan(file: File) { const reader = new FileReader(); reader.onload = () => { try { const value = JSON.parse(String(reader.result)); if (!Array.isArray(value.targets)) throw Error('missing targets'); targets = value.targets; currentCrop = value.crop || currentCrop; drawResults(); setState(`${targets.length} imported targets ready.`) } catch { setState('That file is not a Screen Bridge target export.') } }; reader.readAsText(file) }
  function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]!)) }

  $('#capture').addEventListener('click', capture); $('#sample').addEventListener('click', sample); $('#analyze').addEventListener('click', analyze); $('#save').addEventListener('click', saveScan); $('#export').addEventListener('click', exportScan); $('#import').addEventListener('change', event => { const file = (event.target as HTMLInputElement).files?.[0]; if (file) importScan(file) }); results.addEventListener('click', event => { const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-id]'); if (button) selectTarget(Number(button.dataset.id)) });
  $('#theme').addEventListener('click', () => { const day = document.documentElement.classList.toggle('day'); ($('#theme') as HTMLButtonElement).textContent = day ? 'Night mode' : 'Day mode'; ($('#theme') as HTMLButtonElement).setAttribute('aria-pressed', String(day)); localStorage.setItem('sb_theme', day ? 'day' : 'night') }); if (localStorage.getItem('sb_theme') === 'day') ($('#theme') as HTMLButtonElement).click()
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') { event.preventDefault(); capture(); return } if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return; if (/^[1-9]$/.test(event.key)) selectTarget(Number(event.key)); if (event.key === 'Enter' && selected) { const target = targets.find(item => item.id === selected); if (target) say(targetPhrase(target)) } });
  async function verifyLicense(token: string, status?: HTMLElement) { try { const response = await fetch(`https://api.sociobot.in/api/v1/products/screen-bridge/verify?license=${encodeURIComponent(token)}`); const data = await response.json() as { valid: boolean; reason?: string; expires_at?: string }; const verdict = { ...data, checkedAt: Date.now() }; localStorage.setItem('sb_license_verdict:screen-bridge', JSON.stringify(verdict)); if (status) status.textContent = data.valid ? 'Studio license active.' : 'License no longer active. You can still use the free local core.'; return data.valid } catch { if (status) status.textContent = 'Saved locally. Verification will retry when connected.'; return null } }
  $('#license-form').addEventListener('submit', async event => { event.preventDefault(); const token = ($('#license') as HTMLInputElement).value.trim(); if (!token) return; localStorage.setItem('sb_license:screen-bridge', token); const status = $('#license-status'); status.textContent = 'License saved locally; checking quietly…'; await verifyLicense(token, status) });
  const storedLicense = localStorage.getItem('sb_license:screen-bridge'); const storedVerdict = JSON.parse(localStorage.getItem('sb_license_verdict:screen-bridge') || 'null') as { valid?: boolean; checkedAt?: number } | null
  if (storedLicense && (!storedVerdict?.checkedAt || Date.now() - storedVerdict.checkedAt > 86_400_000)) void verifyLicense(storedLicense)
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(registration => { registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) $('#toast').hidden = false }) }) }); $('#reload').addEventListener('click', () => location.reload())
}
