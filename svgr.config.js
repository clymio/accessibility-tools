// svgr.config.js
module.exports = {
  svgProps: {
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    stroke: 'currentColor'
  },
  expandProps: 'end',
  prettier: false,
  svgo: true,
  svgoConfig: {
    plugins: [
      {
        name: 'removeDimensions'
      },
      {
        name: 'removeAttrs',
        params: {
          attrs: '(fill|stroke)'
        }
      }
    ]
  }
};
