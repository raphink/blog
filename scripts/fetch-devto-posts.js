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

// dev.to's "Liquid tags" (e.g. `{% youtube ID %}`) are not rendered by
// gatsby-transformer-remark. Convert the ones we use into plain HTML/markdown
// so the post stays readable on the static site.
function convertLiquidTags(body) {
    if (!body) return '';
    let out = body;

    // {% youtube VIDEOID [start=...] %}
    out = out.replace(
        /\{%\s*youtube\s+([A-Za-z0-9_-]+)(?:\s+[^%]*)?\s*%\}/g,
        (_m, id) =>
            `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" ` +
            `title="YouTube video" frameborder="0" ` +
            `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
            `allowfullscreen></iframe>`
    );

    // {% github user/repo [no-readme] %}
    out = out.replace(
        /\{%\s*github\s+([^\s%]+)(?:\s+[^%]*)?\s*%\}/g,
        (_m, repo) =>
            `[GitHub — ${repo}](https://github.com/${repo})`
    );

    // {% embed URL %} -> markdown link
    out = out.replace(
        /\{%\s*embed\s+(\S+?)\s*%\}/g,
        (_m, url) => `[${url}](${url})`
    );

    // {% link path-or-slug %} -> link to dev.to (relative slugs become absolute)
    out = out.replace(
        /\{%\s*link\s+(\S+?)\s*%\}/g,
        (_m, target) => {
            const url = /^https?:\/\//i.test(target)
                ? target
                : `https://dev.to/${target.replace(/^\/+/, '')}`;
            return `[${url}](${url})`;
        }
    );

    // {% twitter STATUSID %}
    out = out.replace(
        /\{%\s*twitter\s+(\d+)\s*%\}/g,
        (_m, id) =>
            `[Tweet](https://twitter.com/i/web/status/${id})`
    );

    // {% gist URL [file=NAME] %}
    out = out.replace(
        /\{%\s*gist\s+(\S+?)(?:\s+file=(\S+?))?\s*%\}/g,
        (_m, url, file) =>
            file ? `[Gist — ${file}](${url})` : `[Gist](${url})`
    );

    // {% asciinema ID %}
    out = out.replace(
        /\{%\s*asciinema\s+(\w+)\s*%\}/g,
        (_m, id) =>
            `[asciinema cast ${id}](https://asciinema.org/a/${id})`
    );

    // {% speakerdeck ID %}
    out = out.replace(
        /\{%\s*speakerdeck\s+(\w+)\s*%\}/g,
        (_m, id) =>
            `[Speaker Deck](https://speakerdeck.com/oembed.json?id=${id})`
    );

    // {% slideshare ID %}
    out = out.replace(
        /\{%\s*slideshare\s+(\w+)\s*%\}/g,
        (_m, id) =>
            `[SlideShare](https://www.slideshare.net/slideshow/embed_code/${id})`
    );

    // {% slides ... %} / {% endslides %} wrappers: drop them.
    out = out.replace(/\{%\s*slides\b[^%]*%\}/g, '');
    out = out.replace(/\{%\s*endslides\s*%\}/g, '');

    // {% slide image="URL" alt="..." %} -> markdown image
    out = out.replace(
        /\{%\s*slide\s+([^%]*?)\s*%\}/g,
        (_m, attrs) => {
            const img = /image\s*=\s*"([^"]+)"/.exec(attrs);
            const alt = /alt\s*=\s*"([^"]+)"/.exec(attrs);
            if (!img) return '';
            return `![${alt ? alt[1] : ''}](${img[1]})`;
        }
    );

    // Anything else we don't know about: warn but keep the literal text so
    // it's easy to spot during review.
    const leftover = out.match(/\{%[^%]+%\}/g);
    if (leftover) {
        for (const tag of leftover) {
            console.warn(`  warn: unhandled liquid tag: ${tag}`);
        }
    }

    return out;
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
    const body = convertLiquidTags(
        stripLeadingFrontmatter(article.body_markdown || '')
    );
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

    // Remove posts that were unpublished/deleted on dev.to. Only consider
    // files this script owns — detected by the presence of a `devto_url:`
    // line in the frontmatter — so we don't clobber posts imported from
    // other sources (e.g. blogspot).
    let removed = 0;
    for (const entry of fs.readdirSync(POSTS_DIR)) {
        if (!entry.endsWith('.md')) continue;
        if (keep.has(entry)) continue;
        const fullPath = path.join(POSTS_DIR, entry);
        const head = fs.readFileSync(fullPath, 'utf8').slice(0, 2048);
        if (!/^devto_url:\s/m.test(head)) continue;
        fs.unlinkSync(fullPath);
        removed++;
        console.log(`  removed ${fullPath}`);
    }

    console.log(
        `Done. ${written} written, ${unchanged} unchanged, ${removed} removed.`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
