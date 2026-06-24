import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';

import {Layout} from '../components/index';
import HeaderAlt from '../components/HeaderAlt';
import Header from '../components/Header';
import {htmlToReact, Link, safePrefix} from '../utils';
import Footer from '../components/Footer';

function seriesSlug(series) {
    return series.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
}

export default class Post extends React.Component {
    render() {
        const lang = _.get(this.props, 'pageContext.frontmatter.lang');
        const tags = _.get(this.props, 'pageContext.frontmatter.tags') || [];
        const series = _.get(this.props, 'pageContext.frontmatter.series');
        const translation = _.get(this.props, 'pageContext.frontmatter.translation');
        const tagsBase = lang === 'fr' ? '/fr/tags' : '/tags';
        const seriesBase = lang === 'fr' ? '/fr/series' : '/series';

        return (
            <Layout {...this.props}>
              {(_.get(this.props, 'pageContext.frontmatter.hide_header') === true) ?
                <HeaderAlt {...this.props} />
               :
                <Header {...this.props} site={this.props.pageContext.site} page={this.props.pageContext} image={_.get(this.props, 'pageContext.frontmatter.content_img_path')} />
              }
              <div id="content" className="site-content">
                <main id="main" className="site-main inner">
                  <article className="post post-full">
                    <header className="post-header">
                      <h1 className="post-title">{_.get(this.props, 'pageContext.frontmatter.title')}</h1>
                      <div className="post-meta">
                        <time className="published"
                          dateTime={moment(_.get(this.props, 'pageContext.frontmatter.date')).strftime('%Y-%m-%d %H:%M')}>{moment(_.get(this.props, 'pageContext.frontmatter.date')).strftime('%B %d, %Y')}</time>
                        {series && <span className="post-meta-sep"> · </span>}
                        {series && <span className="post-series">{lang === 'fr' ? 'Série : ' : 'Series: '}<Link to={safePrefix(`${seriesBase}/${seriesSlug(series)}/`)}>{series}</Link></span>}
                      </div>
                      {tags.length > 0 &&
                      <div className="post-tags">
                        {tags.map((tag, i) => (
                          <Link key={i} className="post-tag" to={safePrefix(`${tagsBase}/${tag}/`)}>#{tag}</Link>
                        ))}
                      </div>
                      }
                    </header>
                    {translation &&
                    <div className="post-translation">
                      <Link to={safePrefix(translation)}>
                        {lang === 'fr' ? '🇬🇧 Read in English' : '🇫🇷 Lire en français'}
                      </Link>
                    </div>
                    }
                    {_.get(this.props, 'pageContext.frontmatter.subtitle') &&
                    <div className="post-subtitle">
                      {htmlToReact(_.get(this.props, 'pageContext.frontmatter.subtitle'))}
                    </div>
                    }
                    <div className="post-content">
                      {htmlToReact(_.get(this.props, 'pageContext.html'))}
                    </div>
                    {_.get(this.props, 'pageContext.frontmatter.devto_url') &&
                    <footer className="post-meta post-source">
                      Originally published on <a href={_.get(this.props, 'pageContext.frontmatter.devto_url')} target="_blank" rel="noopener noreferrer">DEV</a>.
                    </footer>
                    }
                    {_.get(this.props, 'pageContext.frontmatter.blogspot_url') &&
                    <footer className="post-meta post-source">
                      Originally published on <a href={_.get(this.props, 'pageContext.frontmatter.blogspot_url')} target="_blank" rel="noopener noreferrer">Blogspot</a>.
                    </footer>
                    }
                    <div className="giscus-comments">
                      <script src="https://giscus.app/client.js"
                        data-repo="raphink/blog"
                        data-repo-id="MDEwOlJlcG9zaXRvcnkyNjU1MjAwMTQ="
                        data-category="Announcements"
                        data-category-id="DIC_kwDOD9ODjs4C_z6L"
                        data-mapping="og:title"
                        data-strict="1"
                        data-reactions-enabled="1"
                        data-emit-metadata="0"
                        data-input-position="bottom"
                        data-theme="preferred_color_scheme"
                        data-lang={lang === 'fr' ? 'fr' : 'en'}
                        crossOrigin="anonymous"
                        async>
                      </script>
                    </div>
                  </article>
                </main>
                <Footer {...this.props} site={this.props.pageContext.site} page={this.props.pageContext} image={_.get(this.props, 'pageContext.frontmatter.content_img_path')} />
              </div>
            </Layout>
        );
    }
}
