module.exports = {
    pathPrefix: '/',
    siteMetadata: require('./site-metadata.json'),
    plugins: [
        `gatsby-plugin-react-helmet`,
        `gatsby-source-data`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `pages`,
                path: `${__dirname}/src/pages`,
            },
        },
        {
            resolve: `gatsby-plugin-static-sass`,
            options: {
                inputFile: `${__dirname}/src/sass/main.scss`,
                outputFile: `${__dirname}/public/assets/css/main.css`
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                  {
                    resolve: `gatsby-remark-highlight-code`,
                  }
                ]
            }
        },
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                output: `/sitemap.xml`,
            }
        },
        {
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
                    {
                        site {
                            siteMetadata {
                                title
                                description
                                url
                            }
                        }
                    }
                `,
                feeds: [
                    {
                        serialize: ({ query: { site, allMarkdownRemark } }) =>
                            allMarkdownRemark.edges.map(({ node }) => ({
                                title: node.frontmatter.title,
                                description: node.frontmatter.excerpt,
                                date: node.frontmatter.date,
                                url: site.siteMetadata.url + node.fields.url,
                                guid: site.siteMetadata.url + node.fields.url,
                            })),
                        query: `
                            {
                                allMarkdownRemark(
                                    filter: { frontmatter: { template: { eq: "post" }, lang: { ne: "fr" } } }
                                    sort: { fields: [frontmatter___date], order: DESC }
                                ) {
                                    edges {
                                        node {
                                            fields { url }
                                            frontmatter {
                                                title
                                                date
                                                excerpt
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        output: `/rss.xml`,
                        title: `Survivor Bias`,
                    },
                    {
                        serialize: ({ query: { site, allMarkdownRemark } }) =>
                            allMarkdownRemark.edges.map(({ node }) => ({
                                title: node.frontmatter.title,
                                description: node.frontmatter.excerpt,
                                date: node.frontmatter.date,
                                url: site.siteMetadata.url + node.fields.url,
                                guid: site.siteMetadata.url + node.fields.url,
                            })),
                        query: `
                            {
                                allMarkdownRemark(
                                    filter: { frontmatter: { template: { eq: "post" }, lang: { eq: "fr" } } }
                                    sort: { fields: [frontmatter___date], order: DESC }
                                ) {
                                    edges {
                                        node {
                                            fields { url }
                                            frontmatter {
                                                title
                                                date
                                                excerpt
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        output: `/fr/rss.xml`,
                        title: `Survivor Bias (français)`,
                    },
                ],
            },
        },
        {
            resolve: `gatsby-remark-page-creator`,
            options: {
                
            }
        }
    ]
};
