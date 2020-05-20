import React from 'react';
import _ from 'lodash';

import {htmlToReact, Link, safePrefix} from '../utils';

export default class Footer extends React.Component {
    render() {
        return (
            <footer id="colophon" className="site-footer inner">
              {(_.get(this.props, 'pageContext.site.siteMetadata.footer.content') || _.get(this.props, 'pageContext.site.siteMetadata.footer.links')) && 
              <div className="site-footer-inside">
                {_.get(this.props, 'pageContext.site.siteMetadata.footer.content') && 
                <span className="copyright">{htmlToReact(_.get(this.props, 'pageContext.site.siteMetadata.footer.content'))}</span>
                }
                {_.map(_.get(this.props, 'pageContext.site.siteMetadata.footer.links'), (link, link_idx) => (
                  <Link key={link_idx} to={safePrefix(_.get(link, 'url'))} {...(_.get(link, 'new_window') ? {target: '_blank', rel: 'noopener'} : null)}>{_.get(link, 'label')}</Link>
                ))}
              </div>
              }
              <Link id="to-top" className="to-top" to="#page">To top <span className="icon-arrow-up" aria-hidden="true" /></Link>
            </footer>
        );
    }
}
