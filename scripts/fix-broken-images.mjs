#!/usr/bin/env node
// Finds broken images in posts and tries to replace them with archive.org snapshots.
// Handles dev.to proxy URLs by extracting and checking the underlying original URL.
// Uses the CDX API (more reliable than the availability API) to find snapshots.
// Dry-run by default; pass --fix to apply changes.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const FIX = process.argv.includes('--fix');
const DIRS = ['src/content/posts', 'src/content/fr/posts'];
const IMG_RE = /https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)(?:\S*)?/gi;

// Extract the original URL from a dev.to image proxy URL
function extractDevtoOriginal(url) {
    const m = url.match(/media\d*\.dev\.to\/dynamic\/image\/[^/]+\/(.+)$/);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch { return null; }
}

async function isOk(url) {
    try {
        const method = url.includes('dev.to') ? 'GET' : 'HEAD';
        const r = await fetch(url, { method, signal: AbortSignal.timeout(6000) });
        if (!r.ok) return false;
        if (url.includes('dev.to')) {
            const ct = r.headers.get('content-type') || '';
            if (!ct.startsWith('image/')) return false;
        }
        return true;
    } catch { return false; }
}

// CDX API: more reliable than /wayback/available
async function cdxSnapshot(url) {
    try {
        const q = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1&fl=timestamp,original&filter=statuscode:200&collapse=digest`;
        const r = await fetch(q, { signal: AbortSignal.timeout(10000) });
        const j = await r.json();
        if (!Array.isArray(j) || j.length < 2) return null;
        const [ts, orig] = j[1];
        return `https://web.archive.org/web/${ts}if_/${orig}`;
    } catch { return null; }
}

// Returns: { ok: true } | { ok: false, snap: string|null }
async function check(url) {
    if (url.includes('web.archive.org')) return { ok: true };
    const original = extractDevtoOriginal(url);
    const checkUrl = original || url;
    if (!original && await isOk(url)) return { ok: true };
    if (original && await isOk(url)) return { ok: true };
    return { ok: false, snap: await cdxSnapshot(checkUrl) };
}

const CONCURRENCY = 10;

async function processFile(dir, file) {
    const path = join(dir, file);
    let content = readFileSync(path, 'utf-8');
    const urls = [...new Set(content.match(IMG_RE) || [])];
    const results = await Promise.all(urls.map(url => check(url).then(r => ({ url, ...r }))));
    let changed = false;
    for (const { url, ok, snap } of results) {
        if (ok) continue;
        console.log(`❌ ${file}\n   ${url}`);
        if (snap) {
            console.log(`   ✅ ${snap}`);
            if (FIX) { content = content.replaceAll(url, snap); changed = true; }
        } else {
            console.log(`   ❓ not found in archive.org`);
        }
    }
    if (FIX && changed) writeFileSync(path, content);
}

const files = DIRS.flatMap(dir => readdirSync(dir).filter(f => f.endsWith('.md')).map(f => [dir, f]));
for (let i = 0; i < files.length; i += CONCURRENCY) {
    await Promise.all(files.slice(i, i + CONCURRENCY).map(([dir, f]) => processFile(dir, f)));
}
