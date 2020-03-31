module.exports = function (api) {
  api.cache(true);

  const presets = [
    ["@babel/preset-env", {
      "targets": {
        "node": "11.6.0"
      }
    }],
    "@babel/preset-react"
  ];
  const plugins = [ 
    "@babel/plugin-transform-react-jsx",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread"
  ];

  const env = {
      "server": {
          "plugins": [
              [
                  "css-modules-transform",
                  {
                      "camelCase": true,
                      "generateScopedName": "./lib/css-scope-generator.js",
                      "extensions": [
                          ".css"
                      ]
                  }
              ]
          ]
      }
  };

  return {
    presets,
    plugins,
    env
  };
}