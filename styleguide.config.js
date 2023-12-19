const path = require('path');
const { version } = require('./package.json');

module.exports = {
  version,
  title: 'Dynamic MUI',
  // Check for updates in the template structure for v13
  template: {
    favicon: 'https://geoviewer.io/img/favicon.ico',
    head: {
      links: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Roboto',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
      ],
    },
  },
  theme: {
    // Update the theme configuration according to the new theme structure in v13
    color: {
      codeBackground: '#272C34',
      codeString: '#a6e22e',
      codeKeyword: '#66d9ef',
      codeOperator: '#f8f8f2',
      codePunctuation: '#f8f8f2',
      codeBase: '#f8f8f2',
      codeFunction: '#e6db74',
      codeProperty: '',
      // base: '#51B64B',
      link: '#FFF',
      linkHover: '#DDD',
      sidebarBackground: 'rgb(46, 70, 175)',
    },
    fontFamily: {
      base: '"Open Sans", Roboto, Helvetica, Arial, sans-serif',
      monospace: 'Monaco, Menlo, Courier, monospace',
    },
    fontSize: {
      base: 14,
      text: 16,
      small: 13,
      h1: 48,
      h2: 32,
      h3: 24,
      h4: 18,
      h5: 16,
      h6: 16,
    },
  },
  styles: {
    // Ensure that custom styles are still compatible with v13
    Logo: {
      logo: {
        color: 'white',
        // animation: '$blink ease-in-out 300ms infinite',
      },
      '@keyframes blink': {
        to: { opacity: 0 },
      },
    },
  },
  pagePerSection: true,
  ignore: ['src/components/controls/index.js'],
  components: 'src/components/controls/**/*.js',
  sections: [
    {
      name: 'Introduction',
      content: 'README.md',
      exampleMode: 'hide',
      usageMode: 'expand',
    },
    {
      name: 'Components',
      components: 'src/components/controls/**/*.js',
      exampleMode: 'expand',
      usageMode: 'expand',
      sectionDepth: 2,
    },
  ],
  // Confirm if styleguideComponents structure is the same in v13
  styleguideComponents: {},
  // Add any new configuration options introduced in v13
};
