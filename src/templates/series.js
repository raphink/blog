import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';

import {Layout} from '../components/index';
import Header from '../components/Header';
import {getPages, Link, safePrefix} from '../utils';
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
                    <article key={post_idx} className="post">
                      <header className="post-header">
                        <span className="series-index">{post_idx + 1}</span>
                        <h2 className="post-title"><Link to={safePrefix(_.get(post, 'url'))} rel="bookmark">{_.get(post, 'frontmatter.title')}</Link></h2>
                        <div className="post-meta">
                          <time className="published"
                            dateTime={moment(_.get(post, 'frontmatter.date')).strftime('%Y-%m-%d')}>{moment(_.get(post, 'frontmatter.date')).strftime('%B %d, %Y')}</time>
                        </div>
                      </header>
                      <div className="post-content">
                        <p>{_.get(post, 'frontmatter.excerpt')}</p>
                      </div>
                      <p className="read-more">
                        <Link className="read-more-link" to={safePrefix(_.get(post, 'url'))}>Keep reading <span className="icon-arrow-right" aria-hidden="true" /></Link>
                      </p>
                    </article>
                    ))}
                  </div>
                </main>
                <Footer {...this.props} pageContext={fakePageContext} site={this.props.pageContext.site} page={fakePageContext} />
              </div>
            </Layout>
        );
    }
}
