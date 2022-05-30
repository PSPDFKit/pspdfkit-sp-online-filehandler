const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                "node_modules/pspdfkit/dist/pspdfkit-lib"
              ),
              to: path.join(__dirname, "public/pspdfkit-lib"),
            },
          ],
        })
      );
    }

    return config;
  },
};
