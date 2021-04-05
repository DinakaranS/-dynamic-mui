module.exports = {
  template: {
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
    fontFamily: {
      base: '"Roboto", sans-serif',
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
};
