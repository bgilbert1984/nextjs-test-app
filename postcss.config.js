// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // Keep autoprefixer, even though preset-env includes it
  },
};