import type { PluginContextV1Alpha } from "@elite-dangerous-plugin-framework/core/v1alpha";
import { createContext } from "react";

/**
 * Context that exposes a `PluginContext` instance passed from EDPF. This is only present on the main Plugin Element (→ not on settings, overlay, etc).
 *
 * This specific context shall only be used for Plugins that use the `v1alpha` manifest version.
 *
 * Use `useContext(V1AlphaPluginContext)` to get the instance. The instance is guaranteed to never be null if used within `makePluginV1Alpha`
 */
export const V1AlphaPluginContext = createContext<PluginContextV1Alpha>(null!);
