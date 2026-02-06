import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.tsx", "src/*/index.tsx"],
  platform: "browser",
  unbundle: true,
  clean: true,
  exports: true,
  dts: true,
  treeshake: true,
  sourcemap: true,
});
