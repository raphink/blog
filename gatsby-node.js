const path = require('path');

exports.createSchemaCustomization = ({ actions }) => {
    actions.createTypes(`
        type MarkdownRemarkFrontmatter {
            series: String
            lang: String
            translation: String
            tags: [String]
        }
    `);
};

exports.createPages = async ({ actions, graphql }) => {
    const { createPage } = actions;

    const result = await graphql(`
        {
            allMarkdownRemark {
                nodes {
                    frontmatter {
                        tags
                        series
                        lang
                    }
                }
            }
        }
    `);

    const nodes = result.data.allMarkdownRemark.nodes;

    // Collect unique tags and series, split by language
    const tagSet = new Set();
    const frTagSet = new Set();
    const seriesSet = new Set();
    const frSeriesSet = new Set();

    for (const node of nodes) {
        const { tags, series, lang } = node.frontmatter;
        const isFr = lang === 'fr';

        if (Array.isArray(tags)) {
            tags.forEach(t => (isFr ? frTagSet : tagSet).add(t));
        }
        if (series) {
            (isFr ? frSeriesSet : seriesSet).add(series);
        }
    }

    tagSet.forEach(tag => {
        createPage({
            path: `/tags/${tag}/`,
            component: path.resolve('src/templates/tag.js'),
            context: { tag, lang: null },
        });
    });

    frTagSet.forEach(tag => {
        createPage({
            path: `/fr/tags/${tag}/`,
            component: path.resolve('src/templates/tag.js'),
            context: { tag, lang: 'fr' },
        });
    });

    seriesSet.forEach(series => {
        const slug = series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
        createPage({
            path: `/series/${slug}/`,
            component: path.resolve('src/templates/series.js'),
            context: { series, lang: null },
        });
    });

    frSeriesSet.forEach(series => {
        const slug = series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
        createPage({
            path: `/fr/series/${slug}/`,
            component: path.resolve('src/templates/series.js'),
            context: { series, lang: 'fr' },
        });
    });
};
