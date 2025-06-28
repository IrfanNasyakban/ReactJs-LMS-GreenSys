module.exports = {
  style: {
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Exclude pdfjs-dist dari source-map-loader
      const sourceMapLoaderRule = webpackConfig.module.rules.find(
        rule => rule.enforce === 'pre' && rule.use && rule.use.loader && rule.use.loader.includes('source-map-loader')
      );
      
      if (sourceMapLoaderRule) {
        sourceMapLoaderRule.exclude = /node_modules\/pdfjs-dist/;
      }

      return webpackConfig;
    },
  },
};