import React, { useEffect, useRef } from 'react';

export default function Giscus({ lang }) {
    const ref = useRef(null);

    useEffect(() => {
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
        script.setAttribute('data-lang', lang === 'fr' ? 'fr' : 'en');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;
        ref.current.appendChild(script);
    }, []);

    return <div className="giscus-comments" ref={ref} />;
}
