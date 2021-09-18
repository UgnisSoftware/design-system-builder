const path = require("path")
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin")

const toPath = (_path) => path.join(process.cwd(), _path)

module.exports = {
  stories: ["../src/**/stories/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "storybook-addon-performance/register", "@storybook/addon-a11y"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  babel: async (options) => ({
    ...options,
    presets: [
      ...options.presets,
      [
        "@babel/preset-react",
        {
          importSource: "lape",
          runtime: "automatic",
        },
        "preset-react-jsx-transform", // Can name this anything, just an arbitrary alias to avoid duplicate presets'
      ],
    ],
  }),
  webpackFinal: async (config) => {
    ;[].push.apply(config.resolve.plugins, [new TsconfigPathsPlugin({ extensions: config.resolve.extensions })])
    return {
      ...config,
      devtool: "inline-source-map",
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          "@emotion/core": toPath("node_modules/@emotion/react"),
          "emotion-theming": toPath("node_modules/@emotion/react"),
        },
      },
    }
  },
}
