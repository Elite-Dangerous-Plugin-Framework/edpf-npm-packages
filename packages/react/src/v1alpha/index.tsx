import {
  PluginContextV1Alpha,
  EDPFPluginElementV1Alpha,
} from "@elite-dangerous-plugin-framework/core/v1alpha";

import { type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { V1AlphaPluginContext } from "./context.js";

/**
 * This creates a Plugin class definition, as expected by EDPF. You should export the response from your index.tsx as the `default` export.
 * This Helper already registers a shutdown listener and correctly unmounts the React root element.
 */
export function makePluginV1Alpha(inner: ReactNode) {
  return class extends EDPFPluginElementV1Alpha {
    initPlugin(ctx: PluginContextV1Alpha): void {
      const root = ReactDOM.createRoot(this);
      ctx.registerShutdownListener(async () => {
        root.unmount();
      });
      root.render(
        <V1AlphaPluginContext.Provider value={ctx}>
          {inner}
        </V1AlphaPluginContext.Provider>,
      );
    }
  };
}

export * from "./context.js";
export * from "./hooks/useBundledResource.js";
export * from "./hooks/useJournalEvents.js";
