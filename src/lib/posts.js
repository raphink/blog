import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const FR_POSTS_DIR = join(process.cwd(), 'src/content/fr/posts');

function parsePost(filePath, lang = 'en') {
    const content = readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    const filename = filePath.split('/').pop().replace(/\.md$/, '');
    const url = lang === 'fr' ? `/fr/posts/${filename}/` : `/posts/${filename}/`;
    return { ...data, body, url, filename, lang };
}

export function getAllPosts(lang = 'en') {
    const dir = lang === 'fr' ? FR_POSTS_DIR : POSTS_DIR;
    try {
        return readdirSync(dir)
            .filter(f => f.endsWith('.md'))
            .map(f => parsePost(join(dir, f), lang))
            .filter(p => p.template === 'post')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
        return [];
    }
}

export function getPostBySlug(slug, lang = 'en') {
    const dir = lang === 'fr' ? FR_POSTS_DIR : POSTS_DIR;
    const filePath = join(dir, `${slug}.md`);
    try {
        return parsePost(filePath, lang);
    } catch {
        return null;
    }
}

export function seriesSlug(series) {
    return series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
}
