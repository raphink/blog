import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://raphink.info',
    srcDir: './src',
    outDir: './dist',
    integrations: [react(), sitemap()],
    markdown: {
        shikiConfig: {
            theme: 'github-light',
        },
    },
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                },
            },
        },
    },
});
