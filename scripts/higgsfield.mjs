#!/usr/bin/env node
// Génération vidéo Higgsfield (Seedance) pour les visuels du site — outil hors site.
//
// Aucune dépendance : fetch natif de Node, protocole relevé dans le SDK officiel
// (github.com/higgsfield-ai/higgsfield-js) et docs.higgsfield.ai. Le site n'appelle
// JAMAIS l'API : les vidéos produites deviennent des fichiers statiques.
//
// Identifiants lus dans .env.local (ignoré par git), jamais affichés :
//   HF_CREDENTIALS=key-id:key-secret
//
// Usage :
//   node --env-file=.env.local scripts/higgsfield.mjs check
//       Vérifie la clé via l'estimation de coût (gratuit, aucune génération).
//   node --env-file=.env.local scripts/higgsfield.mjs generate <photo.jpg> [options]
//       --prompt "…"        mouvement demandé (défaut : dolly lent, décor figé)
//       --duration 5        4 à 15 s
//       --resolution 1080p  480p | 720p | 1080p | 4k
//       --loop              même image en premier et dernier frame (boucle)
//       --yes               lance réellement la génération (FACTURÉE) ; sans ce
//                           drapeau, le script s'arrête après l'estimation.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const API = 'https://api.higgsfield.ai';
const I2V = 'bytedance/seedance-2.0/image-to-video';
const OUT_DIR = '.higgsfield';
const TERMINAL_FAILURES = new Set(['failed', 'nsfw', 'canceled']);

const DEFAULT_PROMPT =
  'Photoreal documentary footage of this indoor padel court. Very slow, steady camera push-in. ' +
  'Warm indoor light, unchanged. The walls, nets, fences, signage and court lines stay perfectly still. No cuts.';

function authHeader() {
  const raw = process.env.HF_CREDENTIALS?.trim()
    || (process.env.HF_API_KEY_ID && process.env.HF_API_KEY_SECRET
      ? `${process.env.HF_API_KEY_ID}:${process.env.HF_API_KEY_SECRET}`
      : '');
  if (!raw || !raw.includes(':')) {
    fail('HF_CREDENTIALS absent ou mal formé dans .env.local (attendu : key-id:key-secret).');
  }
  return `Key ${raw}`;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

// Le réseau vers api.higgsfield.ai coupe parfois à la connexion (ETIMEDOUT).
// On réessaie les appels sans effet (estimation, envoi, suivi) — JAMAIS la
// demande de génération : si elle est partie, la rejouer la facturerait deux fois.
async function api(path, { method = 'POST', body, retry = true } = {}) {
  const url = path.startsWith('http') ? path : `${API}/${path.replace(/^\//, '')}`;
  let res;
  for (let attempt = 1; ; attempt++) {
    try {
      res = await fetch(url, {
        method,
        headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30_000),
      });
      break;
    } catch (err) {
      if (!retry || attempt >= 4) fail(`Réseau : ${method} ${path} impossible (${err.cause?.code || err.name}).${retry ? '' : ' Vérifier sur console.higgsfield.ai si la demande est partie avant de relancer.'}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text.slice(0, 300) }; }
  if (res.status === 401) fail('Clé refusée (401). Vérifier HF_CREDENTIALS dans .env.local.');
  if (!res.ok) fail(`${method} ${path} → HTTP ${res.status} : ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function estimate(endpoint, input) {
  return api(`estimate/${endpoint}`, { body: input });
}

// L'estimation renvoie soit un montant ({ usd, credits }), soit une grille
// tarifaire en texte ({ pricing_description }) selon le modèle.
function describe(cost) {
  if (cost.usd != null) return `${cost.usd} $ (${cost.credits ?? '?'} crédits)`;
  return cost.pricing_description || JSON.stringify(cost).slice(0, 400);
}

async function upload(file) {
  const ext = extname(file).toLowerCase();
  const contentType = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext];
  if (!contentType) fail(`Format non pris en charge : ${ext}`);
  const slot = await api('files/generate-upload-url', { body: { content_type: contentType } });
  // Les identifiants Higgsfield ne partent JAMAIS vers l'URL de stockage présignée.
  const put = await fetch(slot.upload_url, { method: 'PUT', headers: slot.upload_headers, body: await readFile(file) });
  if (!put.ok) fail(`Envoi de la photo refusé (HTTP ${put.status}).`);
  return slot.public_url;
}

async function waitFor(request) {
  const statusUrl = request.status_url || `${API}/requests/${request.request_id}/status`;
  const started = Date.now();
  let delay = 3000;
  for (;;) {
    const s = await api(statusUrl, { method: 'GET' });
    if (s.status === 'completed') return s;
    if (TERMINAL_FAILURES.has(s.status)) {
      fail(`Génération terminée sans vidéo : statut « ${s.status} »${s.error ? ` — ${JSON.stringify(s.error)}` : ''}. Rien n'est facturé pour un échec.`);
    }
    if (Date.now() - started > 15 * 60_000) fail(`Délai dépassé. request_id à garder : ${request.request_id}`);
    process.stdout.write(`… ${s.status}\r`);
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, 15000);
  }
}

function parseArgs(argv) {
  const opts = { duration: 5, resolution: '1080p', loop: false, yes: false, prompt: DEFAULT_PROMPT };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--loop') opts.loop = true;
    else if (a === '--yes') opts.yes = true;
    else if (a === '--duration') opts.duration = Number(argv[++i]);
    else if (a === '--resolution') opts.resolution = argv[++i];
    else if (a === '--prompt') opts.prompt = argv[++i];
    else rest.push(a);
  }
  return { opts, rest };
}

async function check() {
  // Estimation seule : prouve que la clé est acceptée, sans rien générer.
  const cost = await estimate('bytedance/seedance-2.5/text-to-video', {
    prompt: 'A cinematic scene at sunset', duration: 5, resolution: '720p', aspect_ratio: '16:9',
  });
  console.log(`✔ Clé acceptée. Exemple (5 s Seedance 2.5, 720p) : ${describe(cost)}`);
}

async function generate(file, opts) {
  if (!file) fail('Chemin de la photo manquant.');
  console.log(`→ Envoi de ${file}`);
  const imageUrl = await upload(file);
  const input = {
    image_url: imageUrl,
    prompt: opts.prompt,
    duration: opts.duration,
    resolution: opts.resolution,
    generate_audio: false,
    ...(opts.loop ? { end_image_url: imageUrl } : {}),
  };
  const cost = await estimate(I2V, input);
  console.log(`→ Coût (${opts.duration} s, ${opts.resolution}${opts.loop ? ', boucle' : ''}) : ${describe(cost)}`);
  if (!opts.yes) {
    console.log('Arrêt avant génération. Relancer avec --yes pour générer (facturé).');
    return;
  }
  const request = await api(I2V, { body: input, retry: false });
  console.log(`→ Demande acceptée : ${request.request_id}`);
  const done = await waitFor(request);
  const url = done.video?.url;
  if (!url) fail(`Statut « completed » mais aucune URL vidéo : ${JSON.stringify(done).slice(0, 300)}`);
  await mkdir(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, `${basename(file, extname(file))}-${Date.now()}.mp4`);
  const video = await fetch(url);
  if (!video.ok) fail(`Téléchargement impossible (HTTP ${video.status}). URL (valable ~7 j) : ${url}`);
  await writeFile(out, Buffer.from(await video.arrayBuffer()));
  await writeFile(`${out}.json`, JSON.stringify({ request_id: request.request_id, input: { ...input, image_url: '[upload]', end_image_url: opts.loop ? '[upload]' : undefined }, cost }, null, 2));
  console.log(`✔ Vidéo enregistrée : ${out}`);
}

const [command, ...argv] = process.argv.slice(2);
const { opts, rest } = parseArgs(argv);
if (command === 'check') await check();
else if (command === 'generate') await generate(rest[0], opts);
else fail('Commande attendue : check | generate <photo.jpg> [--loop] [--duration 5] [--resolution 1080p] [--prompt "…"] [--yes]');
