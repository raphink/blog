import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { site } from '../../site.js';

const font = readFileSync('src/fonts/pt-serif-400.ttf');
const fontBold = readFileSync('src/fonts/pt-serif-700.ttf');

function getPosts() {
    const dir = 'src/content/posts';
    return readdirSync(dir)
        .filter(f => f.endsWith('.md'))
        .map(f => {
            const { data } = matter(readFileSync(join(dir, f), 'utf-8'));
            return { slug: f.replace(/\.md$/, ''), title: data.title as string, tags: data.tags as string[] | undefined };
        });
}

export function getStaticPaths() {
    return [
        { params: { slug: 'home' } },
        ...getPosts().map(({ slug }) => ({ params: { slug } })),
    ];
}

export const GET: APIRoute = async ({ params }) => {
    const posts = getPosts();
    const post = posts.find(p => p.slug === params.slug);
    const title = post?.title ?? site.title;
    const tags = post?.tags?.slice(0, 3) ?? [];

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '1200px',
                    height: '630px',
                    background: '#1a1a2e',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px 72px',
                    fontFamily: 'PT Serif',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', alignItems: 'center', gap: '12px' },
                            children: [{
                                type: 'span',
                                props: {
                                    style: { color: '#ffd300', fontSize: '18px', fontWeight: 700, letterSpacing: '0.08em' },
                                    children: site.title.toUpperCase(),
                                },
                            }],
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', flexDirection: 'column', gap: '24px' },
                            children: [
                                {
                                    type: 'p',
                                    props: {
                                        style: { color: '#ffffff', fontSize: title.length > 60 ? '40px' : '52px', fontWeight: 700, lineHeight: 1.2, margin: 0 },
                                        children: title,
                                    },
                                },
                                tags.length > 0 ? {
                                    type: 'div',
                                    props: {
                                        style: { display: 'flex', gap: '12px' },
                                        children: tags.map(tag => ({
                                            type: 'span',
                                            props: {
                                                style: { background: 'rgba(255,211,0,0.15)', color: '#ffd300', fontSize: '18px', padding: '4px 16px', borderRadius: '20px' },
                                                children: `#${tag}`,
                                            },
                                        })),
                                    },
                                } : { type: 'span', props: { children: '' } },
                            ],
                        },
                    },
                    {
                        type: 'p',
                        props: {
                            style: { color: 'rgba(255,255,255,0.35)', fontSize: '16px', margin: 0 },
                            children: `blog.raphink.info · ${site.author}`,
                        },
                    },
                ],
            },
        },
        {
            width: 1200,
            height: 630,
            fonts: [
                { name: 'PT Serif', data: font, weight: 400, style: 'normal' },
                { name: 'PT Serif', data: fontBold, weight: 700, style: 'normal' },
            ],
        }
    );

    const png = new Resvg(svg).render().asPng();
    return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
