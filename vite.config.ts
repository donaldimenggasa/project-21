import dotenv from "dotenv";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { flatRoutes } from 'remix-flat-routes'



declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    
    remix({
      ignoredRouteFiles: ['**/*', '**/*.css'],
      
      
      routes(defineRoutes) {
        return flatRoutes('routes', defineRoutes, { ignoredRouteFiles: ['**/.*']})
      }, 

      

      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    //react({
    //  babel: {
    //    parserOpts: {
    //      plugins: ["decorators-legacy"],
    //    },
    //  },
    //}),
    tsconfigPaths(),
  ],
});
