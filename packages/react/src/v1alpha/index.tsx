import {
  PluginContextV1Alpha,
  EDPFPluginElementV1Alpha,
  EDPFPluginSettingsElementV1Alpha,
  PluginSettingsContextV1Alpha,
} from "@elite-dangerous-plugin-framework/core/v1alpha";

import { type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { PluginContext, SettingsContext } from "./context.js";

/**
 * This creates a Plugin class definition, as expected by EDPF. You should export the response from your index.tsx as the `default` export.
 * This Helper already registers a shutdown listener and correctly unmounts the React root element.
 */
export function makePluginV1Alpha(
  inner: ReactNode,
): new () => EDPFPluginElementV1Alpha {
  return class extends EDPFPluginElementV1Alpha {
    initPlugin(ctx: PluginContextV1Alpha): void {
      const root = ReactDOM.createRoot(this);
      ctx.registerShutdownListener(async () => {
        root.unmount();
      });
      root.render(
        <PluginContext.Provider value={ctx}>{inner}</PluginContext.Provider>,
      );
    }
  };
}

/**
 * This creates a Settings class definition, as expected by EDPF. You should export the response from your index.tsx as the `settings` export.
 * This Helper already registers a shutdown listener and correctly unmounts the React root element.
 */
export function makeSettingsV1Alpha(
  inner: ReactNode,
): new () => EDPFPluginSettingsElementV1Alpha {
  return class extends EDPFPluginSettingsElementV1Alpha {
    initSettings(ctx: PluginSettingsContextV1Alpha): void {
      const root = ReactDOM.createRoot(this);
      ctx.registerShutdownListener(async () => {
        root.unmount();
      });
      root.render(
        <SettingsContext.Provider value={ctx}>
          {inner}
        </SettingsContext.Provider>,
      );
    }
  };
}

export * from "./context.js";
export * from "./hooks/index.js";
