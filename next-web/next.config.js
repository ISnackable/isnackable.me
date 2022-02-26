"use strict";

const exec = require("child_process").exec;
const writeFile = require("fs").writeFile;
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});
const { ReplaceSource } = require("webpack-sources");

const headers = async () => {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff"
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN"
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block"
        }
      ]
    }
  ];
};

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      // Needed if your cache script is asynchronous
      config.experiments = {
        layers: true,
        topLevelAwait: true
      };

      config.devServer = {
        hot: false
      };

      config.watchOptions = {
        ignored: "**/.*"
      };

      if (isServer) {
        config.plugins.push({
          apply: (compiler) => {
            const { webpack } = compiler;
            const { Compilation } = webpack;

            compiler.hooks.thisCompilation.tap(
              "generateCachePlugin",
              (compilation) => {
                var testModule;
                var testModule2;

                // Tapping to the assets processing pipeline on a specific stage.
                compilation.hooks.finishRebuildingModule.tap(
                  { name: "TEST" },
                  (module) => {
                    console.log("FINISH REBUILDING module");
                    console.log(module);
                  }
                );

                // compilation.hooks.processAssets.tap(
                //   {
                //     name: "generateCachePlugin",
                //     stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
                //     // additionalAssets: true
                //   },
                //   (assets) => {
                //     console.log("START");
                //     var sourceofasset;
                //     var sourceinfoofasset;
                //     console.log(sourceofasset);
                //     Object.entries(assets).forEach(([pathname, source]) => {
                //       console.log(pathname);
                //       if (pathname === "../pages/api/search.js") {
                //         sourceofasset = source;
                //         sourceinfoofasset =
                //           compilation.assetsInfo.get(pathname);
                //       }
                //       if (
                //         pathname === "cache.js" ||
                //         pathname === "../cache.js"
                //       ) {
                //         writeFile(
                //           `./scripts/cache.js`,
                //           source.source(),
                //           (err) => {
                //             if (err) throw err;
                //             exec("node ./scripts/cache.js");
                //           }
                //         );
                //       } else if (
                //         pathname === "webpack-runtime.js" ||
                //         pathname === "../webpack-runtime.js"
                //       ) {
                //         writeFile(
                //           `./scripts/webpack-runtime.js`,
                //           source.source(),
                //           (err) => {
                //             if (err) throw err;
                //             exec("node ./scripts/cache.js");
                //           }
                //         );
                //       } else if (/^\d+\.js$/.test(pathname)) {
                //         writeFile(
                //           `./scripts/chunks/${pathname}`,
                //           source.source(),
                //           (err) => {
                //             if (err) throw err;
                //             exec("node ./scripts/cache.js");
                //           }
                //         );
                //       }
                //     });
                //     console.log(sourceofasset);
                //     console.log(sourceinfoofasset);
                //     console.log("END");

                //     if (testModule && testModule2) {
                //       compilation.rebuildModule(testModule, () => {
                //         console.log("DONE REBUILDING MODULE");
                //       });
                //       compilation.rebuildModule(testModule2, () => {
                //         console.log("DONE REBUILDING MODULE2");
                //       });
                //     }

                //     console.log("======================================\n");
                //   }
                // );

                compilation.hooks.finishModules.tapAsync(
                  {
                    name: "generateCachePlugin"
                  },
                  (module, callback) => {
                    module.forEach((m) => {
                      if (m?.resource?.includes("scripts/cache.js")) {
                        console.log(m?.resource);
                        // writeFile(
                        //   `./scripts/cache.js`,
                        //   source.source(),
                        //   (err) => {
                        //     if (err) throw err;
                        //     exec("node ./scripts/cache.js");
                        //   }
                        // );
                      } else if (m?.resource?.includes("webpack-runtime.js")) {
                        console.log(m?.resource);

                        // writeFile(
                        //   `./scripts/webpack-runtime.js`,
                        //   source.source(),
                        //   (err) => {
                        //     if (err) throw err;
                        //     exec("node ./scripts/cache.js");
                        //   }
                        // );
                      } else if (/^\d+\.js$/.test(m?.resource)) {
                        // writeFile(
                        //   `./scripts/chunks/${pathname}`,
                        //   source.source(),
                        //   (err) => {
                        //     if (err) throw err;
                        //     exec("node ./scripts/cache.js");
                        //   }
                        // );
                        console.log(m?.resource);
                      }

                      if (m?.resource?.includes("cache/blog.js")) {
                        m._source = new ReplaceSource(m._source).replace(
                          13,
                          23,
                          "cachedPosts2"
                        );

                        console.log(m._source);
                        m._forceBuild = true;
                        // testModule = m;
                        // console.log(m);
                      } else if (m?.resource?.includes("api/search.ts")) {
                        m._source = new ReplaceSource(m._source).replace(
                          0,
                          81,
                          `import { cachedPosts2 } from "../../cache/blog.js";
                          const blogPosts = cachedPosts2;`
                        );
                        // console.log(m._source.source());
                        m._forceBuild = true;
                        // testModule2 = m;
                        // console.log(m);
                      }
                    });

                    callback();
                  }
                );

                console.log("> [generateCachePlugin] The file has been saved!");
              }
            );
          }
        });

        return {
          ...config,
          // This is what allows us to add a node script via NextJS's server
          entry() {
            return config.entry().then((entry) => {
              return Object.assign({}, entry, {
                cache: "./scripts/cache.ts"
              });
            });
          }
        };
      }

      return config;
    },
    pwa: {
      dest: "public",
      runtimeCaching,
      buildExcludes: [/middleware-manifest.json$/],
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === "development"
    },
    headers,
    images: {
      domains: ["cdn.sanity.io"]
    }
  })
);

module.exports = nextConfig;
