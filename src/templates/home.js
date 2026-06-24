import React from 'react';
import _ from 'lodash';

import {Layout} from '../components/index';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import {getPages, safePrefix} from '../utils';
import Footer from '../components/Footer';

export default class Home extends React.Component {
    render() {
        let posts_path = _.get(this.props, 'pageContext.frontmatter.posts_path') || '/posts';
        let display_posts = _.orderBy(getPages(this.props.pageContext.pages, posts_path), 'frontmatter.date', 'desc');
        return (
            <Layout {...this.props}>
              <Header {...this.props} site={this.props.pageContext.site} page={this.props.pageContext} image={_.get(this.props, 'pageContext.site.siteMetadata.header.background_img')} />
              <div id="content" className="site-content">
                <main id="main" className="site-main inner">
                  <div className="post-feed">
                    {_.map(display_posts, (post, post_idx) => (
                      <PostCard key={post_idx} post={post} />
                    ))}
                  </div>
                </main>
                <Footer {...this.props} site={this.props.pageContext.site} page={this.props.pageContext} image={_.get(this.props, 'pageContext.site.siteMetadata.header.background_img')} />
              </div>
            </Layout>
        );
    }
}
