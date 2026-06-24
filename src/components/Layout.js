import React from 'react';
import {Helmet} from 'react-helmet';
import _ from 'lodash';

import {safePrefix} from '../utils';

export default class Body extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Helmet>
                    <title>{_.get(this.props, 'pageContext.frontmatter.title') && _.get(this.props, 'pageContext.frontmatter.title') + ' - '}{_.get(this.props, 'pageContext.site.siteMetadata.title')}</title>
                    <meta charSet="utf-8"/>
                    <meta name="viewport" content="width=device-width, initialScale=1.0" />
                    <meta name="description" content={_.get(this.props, 'pageContext.frontmatter.excerpt') || _.get(this.props, 'pageContext.site.siteMetadata.description')}/>
                    <meta property="og:title" content={_.get(this.props, 'pageContext.frontmatter.title') || _.get(this.props, 'pageContext.site.siteMetadata.title')}/>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-F1DK6MCNH6"></script>
                    <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-F1DK6MCNH6');`}</script>
                    <link href="https://fonts.googleapis.com/css?family=PT+Serif:400,400i,700,700i&display=swap" rel="stylesheet"/>
                    <link rel="stylesheet" href={safePrefix('assets/css/main.css')}/>
                    {(_.get(this.props, 'pageContext.frontmatter.template') === 'post') && 
                    _.get(this.props, 'pageContext.frontmatter.canonical_url') && 
                    <link rel="canonical" href={_.get(this.props, 'pageContext.frontmatter.canonical_url')}/>
                    }
                </Helmet>
                <div id="page" className={'site palette-' + _.get(this.props, 'pageContext.site.siteMetadata.palette')}>
                  {this.props.children}
                </div>
            </React.Fragment>
        );
    }
}
