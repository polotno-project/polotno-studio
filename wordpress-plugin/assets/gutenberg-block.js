/**
 * Polotno Studio Gutenberg Block
 */

(function(blocks, element, blockEditor, components) {
    const el = element.createElement;
    const { InspectorControls } = blockEditor;
    const { PanelBody, TextControl } = components;

    blocks.registerBlockType('polotno-studio/editor', {
        title: 'Polotno Design Editor',
        icon: 'edit',
        category: 'widgets',
        attributes: {
            productId: {
                type: 'string',
                default: '',
            },
            designId: {
                type: 'string',
                default: '',
            },
            width: {
                type: 'string',
                default: '100%',
            },
            height: {
                type: 'string',
                default: '600px',
            },
        },

        edit: function(props) {
            const { attributes, setAttributes } = props;

            return el(
                'div',
                { className: 'polotno-studio-block' },
                [
                    el(InspectorControls, {},
                        el(PanelBody, { title: 'Editor Settings', initialOpen: true },
                            [
                                el(TextControl, {
                                    label: 'Product ID',
                                    value: attributes.productId,
                                    onChange: function(value) {
                                        setAttributes({ productId: value });
                                    },
                                    help: 'WooCommerce product ID (optional)',
                                }),
                                el(TextControl, {
                                    label: 'Design ID',
                                    value: attributes.designId,
                                    onChange: function(value) {
                                        setAttributes({ designId: value });
                                    },
                                    help: 'Pre-load a specific design (optional)',
                                }),
                                el(TextControl, {
                                    label: 'Width',
                                    value: attributes.width,
                                    onChange: function(value) {
                                        setAttributes({ width: value });
                                    },
                                }),
                                el(TextControl, {
                                    label: 'Height',
                                    value: attributes.height,
                                    onChange: function(value) {
                                        setAttributes({ height: value });
                                    },
                                }),
                            ]
                        )
                    ),
                    el('div', {
                        style: {
                            border: '2px dashed #ccc',
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                        }
                    },
                        [
                            el('svg', {
                                width: '48',
                                height: '48',
                                viewBox: '0 0 24 24',
                                fill: 'none',
                                style: { margin: '0 auto 16px' }
                            },
                                el('path', {
                                    d: 'M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z',
                                    stroke: '#666',
                                    strokeWidth: '2'
                                })
                            ),
                            el('h3', { style: { margin: '0 0 8px' } }, 'Polotno Design Editor'),
                            el('p', { style: { margin: 0, color: '#666', fontSize: '14px' } },
                                attributes.productId
                                    ? 'Product ID: ' + attributes.productId
                                    : 'Configure in sidebar →'
                            ),
                        ]
                    ),
                ]
            );
        },

        save: function() {
            return null; // Rendered server-side
        },
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components
);
