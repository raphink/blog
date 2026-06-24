import React from 'react';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import ScriptTag from 'react-script-tag';
import _ from 'lodash';
import Carousel from '../components/Carousel';

export default function(html) {
    if (!html) {
        return null;
    }
    return ReactHtmlParser(html, {
        transform: (node, index) => {
            if (node.type === 'tag' && node.name === 'div' && node.attribs && node.attribs.class === 'carousel') {
                const slides = (node.children || [])
                    .filter(n => n.type === 'tag' && n.name === 'img')
                    .map(n => ({ src: n.attribs.src, alt: n.attribs.alt || '' }));
                return <Carousel key={index} slides={slides} />;
            }
            if (node.type === 'script') {
                if (!_.isEmpty(node.children)) {
                    return (
                        <ScriptTag key={index} {...node.attribs}>
                            {_.map(node.children, childNode => convertNodeToElement(childNode, index, _.noop()))}
                        </ScriptTag>
                    );
                } else {
                    return <ScriptTag key={index} {...node.attribs}/>;
                }
            }
        }
    });
};
