import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';

import {Layout} from '../components/index';
import Header from '../components/Header';
import {getPages, safePrefix} from '../utils';
import PostCard from '../components/PostCard';
import Footer from '../components/Footer';

export default class Series extends React.Component {
    render() {
        const series = _.get(this.props, 'pageContext.series');
        const lang = _.get(this.props, 'pageContext.lang');
        const postsRoot = lang === 'fr' ? '/fr/posts' : '/posts';
        const allPosts = getPages(this.props.pageContext.pages, postsRoot);
        const display_posts = _.orderBy(
            allPosts.filter(p => _.get(p, 'frontmatter.series') === series),
            'frontmatter.date', 'asc'
        );

        const fakePageContext = {
            ...this.props.pageContext,
            frontmatter: {
                title: series,
                lang,
            },
        };

        return (
            <Layout {...this.props} pageContext={fakePageContext}>
              <Header {...this.props} pageContext={fakePageContext} site={this.props.pageContext.site} page={fakePageContext} image={_.get(this.props, 'pageContext.site.siteMetadata.header.background_img')} />
              <div id="content" className="site-content">
                <main id="main" className="site-main inner">
                  <h1 className="page-title">{series}</h1>
                  <div className="post-feed">
                    {_.map(display_posts, (post, post_idx) => (
                      <PostCard key={post_idx} post={post} seriesIndex={post_idx + 1} />
                    ))}
                  </div>
                </main>
                <Footer {...this.props} pageContext={fakePageContext} site={this.props.pageContext.site} page={fakePageContext} />
              </div>
            </Layout>
        );
    }
}
