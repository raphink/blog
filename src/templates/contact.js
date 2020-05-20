import React from 'react';
import _ from 'lodash';

import {Layout} from '../components/index';
import Header from '../components/Header';
import {htmlToReact} from '../utils';
import FormField from '../components/FormField';
import Footer from '../components/Footer';

export default class Contact extends React.Component {
    render() {
        return (
            <Layout {...this.props}>
              <Header {...this.props} site={this.props.pageContext.site} page={this.props.pageContext} image={_.get(this.props, 'pageContext.frontmatter.img_path')} />
              <div id="content" className="site-content">
                <main id="main" className="site-main inner">
                  <article className="post page post-full">
                    <header className="post-header">
                      <h1 className="post-title">{_.get(this.props, 'pageContext.frontmatter.title')}</h1>
                    </header>
                    {_.get(this.props, 'pageContext.frontmatter.subtitle') && 
                    <div className="post-subtitle">
                      {htmlToReact(_.get(this.props, 'pageContext.frontmatter.subtitle'))}
                    </div>
                    }
                    <div className="post-content">
                      {htmlToReact(_.get(this.props, 'pageContext.html'))}
                      <form name={_.get(this.props, 'pageContext.frontmatter.form_id')} id={_.get(this.props, 'pageContext.frontmatter.form_id')} {...(_.get(this.props, 'pageContext.frontmatter.form_action') ? {action: _.get(this.props, 'pageContext.frontmatter.form_action')} : null)}method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
                        <div className="screen-reader-text">
                          <label>Don't fill this out if you're human: <input name="bot-field" /></label>
                        </div>
                        <input type="hidden" name="form-name" value={_.get(this.props, 'pageContext.frontmatter.form_id')} />
                        {_.map(_.get(this.props, 'pageContext.frontmatter.form_fields'), (field, field_idx) => (
                          <FormField key={field_idx} {...this.props} field={field} />
                        ))}
                        <div className="form-submit">
                          <button type="submit" className="button">{_.get(this.props, 'pageContext.frontmatter.submit_label')}</button>
                        </div>
                      </form>
                    </div>
                  </article>
                </main>
                <Footer {...this.props} site={this.props.pageContext.site} page={this.props.pageContext} image={_.get(this.props, 'pageContext.frontmatter.img_path')} />
              </div>
            </Layout>
        );
    }
}
