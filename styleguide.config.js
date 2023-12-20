// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const { version } = require('./package.json');

module.exports = {
  version,
  title: 'Dynamic MUI',
  dangerouslyUpdateWebpackConfig(config) {
    config.module.rules.push({
      test: /.\.md$/,
      type: 'javascript/auto',
    });
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /react-styleguidist\/lib\/loaders\/utils\/client\/requireInRuntime$/,
        'react-styleguidist/lib/loaders/utils/client/requireInRuntime',
      ),
    );
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /react-styleguidist\/lib\/loaders\/utils\/client\/evalInContext$/,
        'react-styleguidist/lib/loaders/utils/client/evalInContext',
      ),
    );
    return config;
  },
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
    Logo: {
      logo: {
        color: 'white',
      },
      '@keyframes blink': {
        to: { opacity: 0 },
      },
    },
  },
  pagePerSection: true,
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
    {
      name: 'Charts',
      components: 'src/components/charts/**/*.js',
      exampleMode: 'expand',
      usageMode: 'expand',
      sectionDepth: 2,
    },
  ],
  styleguideComponents: {},
};
