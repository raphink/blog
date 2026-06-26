import rss from '@astrojs/rss';
import { getAllPosts } from '../lib/posts.js';
import { site } from '../site.js';

export async function GET() {
    const posts = getAllPosts('en');
    return rss({
        title: site.title,
        description: site.description,
        site: site.siteUrl,
        items: posts.map(post => ({
            title: post.title,
            description: post.excerpt || '',
            pubDate: new Date(post.date),
            link: post.url,
        })),
    });
}
