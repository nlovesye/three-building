const path = require('path');

const CracoLessPlugin = require('craco-less');
const WorkerPlugin = require('worker-plugin');
const WebpackBar = require('webpackbar');
const customLessVars = require('@xkool/ui/src/styles/antdThemeConfig');
const slash = require('slash');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

const isDev = false;

module.exports = {
  style: {
    css: {
      loaderOptions: (cssLoaderOptions) => {
        cssLoaderOptions.modules = {
          getLocalIdent: (context, _, localName) => {
            if (
              context.resourcePath.includes('node_modules') ||
              context.resourcePath.includes('global.less')
            ) {
              return localName;
            }
            const match = context.resourcePath.match(/src(.*)/);
            if (match && match[1]) {
              const relativePath = match[1].replace('.less', '');
              const arr = slash(relativePath)
                .split('/')
                .map((a) => a.replace(/([A-Z])/g, '-$1'))
                .map((a) => a.toLowerCase());
              return `xkool${arr.join('-')}-${localName}`.replace(/--/g, '-');
            }
            return localName;
          },
        };
        return cssLoaderOptions;
      },
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: customLessVars,
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    plugins: {
      add: [
        new WebpackBar(),
        new WorkerPlugin({
          // use "self" as the global object when receiving hot updates.
          globalObject: 'self',
        }),
        new AntdDayjsWebpackPlugin(),
      ],
    },
    configure: (webpackConfig) => {
      // 解除目录限制
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin',
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

      // include dt graphic api utils
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRule && isDev) {
        const tsxRule = oneOfRule.oneOf.find(
          (rule) => rule.test && rule.test.toString().includes('tsx'),
        );

        if (tsxRule) {
          if (Array.isArray(tsxRule.include)) {
            tsxRule.include = [...tsxRule.include];
          } else {
            tsxRule.include = [tsxRule.include];
          }
        }
      }
      //

      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        ...webpackConfig.resolve.modules,
      ];

      webpackConfig.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        events: require.resolve('events/'),
      };
      webpackConfig.externals = { jsts: 'jsts' };
      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
        },
        'antd',
      ],
    ],
  },
};
