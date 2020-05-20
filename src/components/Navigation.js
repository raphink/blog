import React from 'react';
import _ from 'lodash';

import {classNames, Link, safePrefix} from '../utils';

export default class Navigation extends React.Component {
    render() {
        return (
            (_.get(this.props, 'pageContext.site.siteMetadata.header.has_nav') || _.get(this.props, 'pageContext.site.siteMetadata.header.has_social')) && <React.Fragment>
            <nav id="main-navigation" className="site-navigation" aria-label="Main Navigation">
              <div className="site-nav-wrap">
                <div className="site-nav-inside">
                  {_.get(this.props, 'pageContext.site.siteMetadata.header.has_nav') && 
                  <ul className="menu">
                    {_.map(_.get(this.props, 'pageContext.site.siteMetadata.header.nav_links'), (action, action_idx) => (
                    <li key={action_idx} className={classNames('menu-item', {'current-menu-item': _.get(this.props, 'pageContext.url') === _.get(action, 'url')})}>
                      <Link to={safePrefix(_.get(action, 'url'))}{...(_.get(action, 'new_window') ? {target: '_blank', rel: 'noopener'} : null)}>{_.get(action, 'label')}</Link>
                    </li>
                    ))}
                  </ul>
                  }
                  {_.get(this.props, 'pageContext.site.siteMetadata.header.has_social') && 
                  <div className="social-links">
                    {_.map(_.get(this.props, 'pageContext.site.siteMetadata.header.social_links'), (action, action_idx) => (
                    action && 
                    <Link key={action_idx} className={classNames({'button-circle': _.get(action, 'type') === 'icon'})} to={safePrefix(_.get(action, 'url'))}{...(_.get(action, 'new_window') ? {target: '_blank', rel: 'noopener'} : null)}>
                      {((_.get(action, 'type') === 'icon') && _.get(action, 'icon_class')) ? <React.Fragment>
                      <span className={'fab ' + _.get(action, 'icon_class')} aria-hidden="true"/><span className="screen-reader-text">{_.get(action, 'label')}</span>
                      </React.Fragment> : 
                      _.get(action, 'label')
                      }
                    </Link>
                    ))}
                  </div>
                  }
                </div>
              </div>
            </nav>
            <button id="menu-toggle" className="menu-toggle"><span className="screen-reader-text">Menu</span><span className="icon-menu" aria-hidden="true" /></button>
            </React.Fragment>
        );
    }
}
