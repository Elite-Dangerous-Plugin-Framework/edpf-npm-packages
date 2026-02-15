import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/*/index.ts", "src/*/internal.ts"],
  platform: "browser",
  unbundle: true,
  clean: true,
  exports: true,
  dts: true,
  treeshake: true,
  sourcemap: true,
});
