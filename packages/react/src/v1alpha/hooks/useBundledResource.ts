import { useContext } from "react";
import { PluginContext } from "../context.js";

/**
 * This is a simple hook that will give you the asset name to use. It essentially just prepends the path to the asset server
 * @param pathInFrontendDir the relative path to your plugin's `frontend` folder.
 */
export default function useBundledResource(pathInFrontendDir: string): string {
  const ctx = useContext(PluginContext);
  if (pathInFrontendDir.startsWith("/")) {
    pathInFrontendDir = pathInFrontendDir.substring(1);
  }
  return ctx.assetsBase + pathInFrontendDir;
}
