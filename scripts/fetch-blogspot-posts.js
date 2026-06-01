#!/usr/bin/env node
/*
 * One-shot import of all posts from a Blogger / Blogspot blog into
 * src/pages/posts/ as markdown files, so Gatsby's gatsby-remark-page-creator
 * picks them up alongside the dev.to-synced posts.
 *
 * Usage:
 *   BLOGSPOT_HOST=raphink.blogspot.com node scripts/fetch-blogspot-posts.js
 *
 * Env vars:
 *   BLOGSPOT_HOST  (required) - hostname of the Blogger blog
 *   POSTS_DIR      (optional) - output dir (default: src/pages/posts)
 *   PER_PAGE       (optional) - feed page size (default: 50, Blogger max ~150)
 *
 * Notes:
 *   - The Blogger Atom feed is converted to JSON via ?alt=json.
 *   - Post HTML is converted to markdown with turndown.
 *   - Filenames are prefixed with YYYYMMDD so they sort with dev.to posts.
 *   - Filename slugs are prefixed with "blogspot-" to avoid collisions with
 *     dev.to slugs.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const TurndownService = require('turndown');

const HOST = process.env.BLOGSPOT_HOST;
const PER_PAGE = parseInt(process.env.PER_PAGE || '50', 10);
const POSTS_DIR = path.resolve(
    __dirname,
    '..',
    process.env.POSTS_DIR || 'src/pages/posts'
);

if (!HOST) {
    console.error('ERROR: BLOGSPOT_HOST environment variable is required.');
    process.exit(1);
}

const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
});

// Blogger wraps code in <pre> blocks; keep them as fenced code without
// re-encoding entities a second time.
turndown.addRule('preserveBr', {
    filter: 'br',
    replacement: () => '  \n',
});

async function fetchJson(url) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'famous-zucchini-blogspot-import' },
    });
    if (!res.ok) {
        throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    }
    return res.json();
}

async function listAllEntries(host) {
    const out = [];
    for (let start = 1; ; start += PER_PAGE) {
        const url =
            `https://${host}/feeds/posts/default` +
            `?alt=json&max-results=${PER_PAGE}&start-index=${start}`;
        const data = await fetchJson(url);
        const entries =
            (data && data.feed && data.feed.entry) || [];
        if (entries.length === 0) break;
        out.push(...entries);
        if (entries.length < PER_PAGE) break;
    }
    return out;
}

function alternateUrl(entry) {
    const links = Array.isArray(entry.link) ? entry.link : [];
    const alt = links.find((l) => l.rel === 'alternate');
    return alt ? alt.href : null;
}

function slugify(s) {
    return String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'post';
}

function slugFromUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        const last = u.pathname.split('/').filter(Boolean).pop() || '';
        return last.replace(/\.html?$/i, '') || null;
    } catch (_) {
        return null;
    }
}

function yamlString(s) {
    if (s === null || s === undefined) return '""';
    const escaped = String(s)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, ' ')
        .trim();
    return `"${escaped}"`;
}

function buildMarkdown(entry) {
    const title = (entry.title && entry.title.$t) || '(untitled)';
    const published = entry.published && entry.published.$t;
    const html = (entry.content && entry.content.$t) || '';
    const canonical = alternateUrl(entry);
    const tags = (Array.isArray(entry.category) ? entry.category : [])
        .map((c) => c.term)
        .filter(Boolean);

    const frontmatter = ['---', 'template: post'];
    frontmatter.push(`title: ${yamlString(title)}`);
    if (published) frontmatter.push(`date: ${yamlString(published)}`);
    if (canonical) {
        frontmatter.push(`canonical_url: ${yamlString(canonical)}`);
        frontmatter.push(`blogspot_url: ${yamlString(canonical)}`);
    }
    if (tags.length) {
        frontmatter.push(`tags: [${tags.map(yamlString).join(', ')}]`);
    }
    frontmatter.push('---', '');

    const body = turndown.turndown(html).replace(/\s*$/, '');
    return frontmatter.join('\n') + body + '\n';
}

function fileNameFor(entry) {
    const datePart = ((entry.published && entry.published.$t) || '')
        .slice(0, 10)
        .replace(/-/g, '');
    const urlSlug = slugFromUrl(alternateUrl(entry));
    const titleSlug = slugify((entry.title && entry.title.$t) || 'post');
    const slug = `blogspot-${slugify(urlSlug || titleSlug)}`;
    return [datePart, slug].filter(Boolean).join('-') + '.md';
}

async function main() {
    console.log(`Importing posts from ${HOST} ...`);
    const entries = await listAllEntries(HOST);
    console.log(`Found ${entries.length} entries.`);

    fs.mkdirSync(POSTS_DIR, { recursive: true });

    let written = 0;
    let unchanged = 0;
    const seen = new Set();

    for (const entry of entries) {
        const fileName = fileNameFor(entry);
        if (seen.has(fileName)) {
            console.warn(`  duplicate filename, skipping: ${fileName}`);
            continue;
        }
        seen.add(fileName);

        const filePath = path.join(POSTS_DIR, fileName);
        const content = buildMarkdown(entry);
        const existing = fs.existsSync(filePath)
            ? fs.readFileSync(filePath, 'utf8')
            : null;
        if (existing === content) {
            unchanged++;
            continue;
        }
        fs.writeFileSync(filePath, content);
        written++;
        console.log(`  wrote ${path.relative(process.cwd(), filePath)}`);
    }

    console.log(`Done. ${written} written, ${unchanged} unchanged.`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
