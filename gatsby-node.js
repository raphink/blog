const path = require('path');
const _ = require('lodash');

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

exports.createPages = async ({ actions, graphql, getNode, getNodesByType }) => {
    const { createPage } = actions;

    const result = await graphql(`
        {
            allMarkdownRemark {
                nodes {
                    id
                    html
                    frontmatter {
                        tags
                        series
                        lang
                        template
                        title
                        date
                        excerpt
                    }
                }
            }
        }
    `);

    const siteNode = getNode('Site');
    const siteDataNode = getNode('SiteData');
    const site = {
        siteMetadata: siteNode.siteMetadata,
        pathPrefix: siteNode.pathPrefix,
        data: _.get(siteDataNode, 'data', null)
    };

    // Build the same pages array that gatsby-remark-page-creator builds
    const pages = result.data.allMarkdownRemark.nodes.map(graphQLNode => {
        const node = getNode(graphQLNode.id);
        return {
            url: node.fields.url,
            relativePath: node.fields.relativePath,
            relativeDir: node.fields.relativeDir,
            base: node.fields.base,
            name: node.fields.name,
            frontmatter: node.frontmatter,
            html: graphQLNode.html
        };
    });

    const tagSet = new Set();
    const frTagSet = new Set();
    const seriesSet = new Set();
    const frSeriesSet = new Set();

    for (const node of result.data.allMarkdownRemark.nodes) {
        const { tags, series, lang } = node.frontmatter;
        const isFr = lang === 'fr';

        if (Array.isArray(tags)) {
            tags.forEach(t => (isFr ? frTagSet : tagSet).add(t));
        }
        if (series) {
            (isFr ? frSeriesSet : seriesSet).add(series);
        }
    }

    const sharedContext = { site, pages };

    tagSet.forEach(tag => {
        createPage({
            path: `/tags/${tag}/`,
            component: path.resolve('src/templates/tag.js'),
            context: { ...sharedContext, tag, lang: null },
        });
    });

    frTagSet.forEach(tag => {
        createPage({
            path: `/fr/tags/${tag}/`,
            component: path.resolve('src/templates/tag.js'),
            context: { ...sharedContext, tag, lang: 'fr' },
        });
    });

    seriesSet.forEach(series => {
        const slug = series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
        createPage({
            path: `/series/${slug}/`,
            component: path.resolve('src/templates/series.js'),
            context: { ...sharedContext, series, lang: null },
        });
    });

    frSeriesSet.forEach(series => {
        const slug = series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
        createPage({
            path: `/fr/series/${slug}/`,
            component: path.resolve('src/templates/series.js'),
            context: { ...sharedContext, series, lang: 'fr' },
        });
    });
};
