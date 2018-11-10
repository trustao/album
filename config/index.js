// see http://vuejs-templates.github.io/webpack for documentation.
var path = require("path");

const data = {
  templateName: 'xxx',
  image: 'http://tmp/wx4a9a55a260001198.o6zAJs0pznlgX_lAKTeGRWx_9WOs.cvcpsoWWQmHnc2dc20f56f2594a9337958ce547a3b4e.png',
  photo: [{
    "photoPath": "http://tmp/wx4a9a55a260001198.o6zAJs0pznlgX_lAKTeGRWx_9WOs.cvcpsoWWQmHnc2dc20f56f2594a9337958ce547a3b4e.png",
    "materials": [{
      "type": "icon",
      "x": 70.88945652203031,
      "y": 59.88945652203032,
      "w": 176.22108695593937,
      "h": 153.6965871194659,
      "z": 11,
      "scaleX": 1,
      "scaleY": 1,
      "rotate": -9.090382638587906,
      "icon": "https://api.pintuxiangce.com/resources/uploads/icons/b9fb032d16c4a5d5ecfffcd657b31d17.png",
    }],
    "textList": [{
      "type": "text",
      "x": 115.00000000000001,
      "y": 110.99999999999997,
      "w": 48,
      "h": 22,
      "z": 12,
      "scaleX": 2.124979148967239,
      "scaleY": 2.124979148967239,
      "rotate": -6.818814791596894,
      "value": "阿道夫"
    }],
    "photoW": 414,
    "photoH": 414,
    "scale": 1
  }]
};

module.exports = {
  build: {
    env: require("./prod.env"),
    index: path.resolve(__dirname, "../dist/index.html"),
    assetsRoot: path.resolve(__dirname, "../dist"),
    assetsSubDirectory: "static",
    assetsPublicPath: "/",
    productionSourceMap: false,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ["js", "css"],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require("./dev.env"),
    port: 8080,
    // 在小程序开发者工具中不需要自动打开浏览器
    autoOpenBrowser: false,
    assetsSubDirectory: "static",
    assetsPublicPath: "/",
    proxyTable: {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
};
