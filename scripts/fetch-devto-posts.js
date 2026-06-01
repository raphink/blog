#!/usr/bin/env node
/*
 * Fetches all published articles for a dev.to user and writes them as
 * markdown files under src/pages/posts/ so Gatsby's gatsby-remark-page-creator
 * picks them up.
 *
 * Usage:
 *   DEVTO_USERNAME=raphink node scripts/fetch-devto-posts.js
 *
 * Env vars:
 *   DEVTO_USERNAME (required) - dev.to username to sync
 *   DEVTO_API_KEY  (optional) - dev.to API key, only needed to include
 *                               unpublished articles or to raise rate limits
 *   POSTS_DIR      (optional) - output dir (default: src/pages/posts)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const USERNAME = process.env.DEVTO_USERNAME;
const API_KEY = process.env.DEVTO_API_KEY || '';
const POSTS_DIR = path.resolve(
    __dirname,
    '..',
    process.env.POSTS_DIR || 'src/pages/posts'
);

if (!USERNAME) {
    console.error('ERROR: DEVTO_USERNAME environment variable is required.');
    process.exit(1);
}

const API_BASE = 'https://dev.to/api';
const PER_PAGE = 100;

function headers() {
    const h = { 'User-Agent': 'famous-zucchini-devto-sync' };
    if (API_KEY) h['api-key'] = API_KEY;
    return h;
}

async function fetchJson(url) {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
        throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    }
    return res.json();
}

async function listAllArticles(username) {
    const out = [];
    for (let page = 1; ; page++) {
        const url = `${API_BASE}/articles?username=${encodeURIComponent(username)}&per_page=${PER_PAGE}&page=${page}`;
        const batch = await fetchJson(url);
        if (!Array.isArray(batch) || batch.length === 0) break;
        out.push(...batch);
        if (batch.length < PER_PAGE) break;
    }
    return out;
}

function slugify(s) {
    return String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'post';
}

// Quote a string for safe inclusion as a YAML double-quoted scalar.
function yamlString(s) {
    if (s === null || s === undefined) return '""';
    const escaped = String(s)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, ' ')
        .trim();
    return `"${escaped}"`;
}

// dev.to body_markdown often starts with a Jekyll-style "---" frontmatter
// block. Strip it; the metadata we need is already in the API response.
function stripLeadingFrontmatter(body) {
    if (!body) return '';
    const m = body.match(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/);
    return m ? body.slice(m[0].length) : body;
}

function buildMarkdown(article) {
    const frontmatter = ['---', 'template: post'];
    frontmatter.push(`title: ${yamlString(article.title)}`);
    if (article.published_at) {
        frontmatter.push(`date: ${yamlString(article.published_at)}`);
    }
    if (article.description) {
        frontmatter.push(`excerpt: ${yamlString(article.description)}`);
    }
    if (article.cover_image) {
        frontmatter.push(`thumb_img_path: ${yamlString(article.cover_image)}`);
        frontmatter.push(`content_img_path: ${yamlString(article.cover_image)}`);
    }
    if (article.canonical_url) {
        frontmatter.push(`canonical_url: ${yamlString(article.canonical_url)}`);
    }
    if (article.url) {
        frontmatter.push(`devto_url: ${yamlString(article.url)}`);
    }
    if (Array.isArray(article.tag_list) && article.tag_list.length) {
        frontmatter.push(
            `tags: [${article.tag_list.map(yamlString).join(', ')}]`
        );
    }
    frontmatter.push('---', '');
    const body = stripLeadingFrontmatter(article.body_markdown || '');
    return frontmatter.join('\n') + body.replace(/\s*$/, '') + '\n';
}

function fileNameFor(article) {
    // Stable, date-prefixed filename keeps posts ordered on disk.
    const datePart = (article.published_at || article.created_at || '')
        .slice(0, 10)
        .replace(/-/g, '');
    const slug = slugify(article.slug || article.title);
    return [datePart, slug].filter(Boolean).join('-') + '.md';
}

async function main() {
    console.log(`Syncing dev.to articles for @${USERNAME} ...`);
    const summaries = await listAllArticles(USERNAME);
    console.log(`Found ${summaries.length} published article(s).`);

    fs.mkdirSync(POSTS_DIR, { recursive: true });

    const keep = new Set();
    let written = 0;
    let unchanged = 0;

    for (const summary of summaries) {
        // Need /articles/{id} for body_markdown.
        const article = await fetchJson(`${API_BASE}/articles/${summary.id}`);
        const fileName = fileNameFor(article);
        const filePath = path.join(POSTS_DIR, fileName);
        const content = buildMarkdown(article);
        keep.add(fileName);

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

    // Remove posts that were unpublished/deleted on dev.to.
    let removed = 0;
    for (const entry of fs.readdirSync(POSTS_DIR)) {
        if (!entry.endsWith('.md')) continue;
        if (keep.has(entry)) continue;
        fs.unlinkSync(path.join(POSTS_DIR, entry));
        removed++;
        console.log(`  removed ${path.join(POSTS_DIR, entry)}`);
    }

    console.log(
        `Done. ${written} written, ${unchanged} unchanged, ${removed} removed.`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
