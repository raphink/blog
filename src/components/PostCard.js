import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';
import {Link, safePrefix} from '../utils';

export default function PostCard({ post, seriesIndex }) {
    const url = _.get(post, 'url');
    const title = _.get(post, 'frontmatter.title');
    const date = _.get(post, 'frontmatter.date');
    const excerpt = _.get(post, 'frontmatter.excerpt');
    const thumb = _.get(post, 'frontmatter.thumb_img_path');

    return (
        <article className="post post-card">
          {thumb &&
          <Link className="post-card-banner" to={safePrefix(url)}>
            <img src={thumb} alt={title} />
          </Link>
          }
          <div className="post-card-body">
            <header className="post-header">
              <h2 className="post-title">
                {seriesIndex && <span className="series-index">{seriesIndex}</span>}
                <Link to={safePrefix(url)} rel="bookmark">{title}</Link>
              </h2>
              <div className="post-meta">
                <time className="published"
                  dateTime={moment(date).strftime('%Y-%m-%d')}>{moment(date).strftime('%B %d, %Y')}</time>
              </div>
            </header>
            <div className="post-content">
              <p>{excerpt}</p>
            </div>
            <p className="read-more">
              <Link className="read-more-link" to={safePrefix(url)}>Keep reading <span className="icon-arrow-right" aria-hidden="true" /></Link>
            </p>
          </div>
        </article>
    );
}
