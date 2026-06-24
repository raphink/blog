import React from 'react';

export default class Giscus extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount() {
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'raphink/blog');
        script.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkyNjU1MjAwMTQ=');
        script.setAttribute('data-category', 'Announcements');
        script.setAttribute('data-category-id', 'DIC_kwDOD9ODjs4C_z6L');
        script.setAttribute('data-mapping', 'og:title');
        script.setAttribute('data-strict', '1');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', 'preferred_color_scheme');
        script.setAttribute('data-lang', this.props.lang === 'fr' ? 'fr' : 'en');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;
        this.ref.current.appendChild(script);
    }

    render() {
        return <div className="giscus-comments" ref={this.ref} />;
    }
}
