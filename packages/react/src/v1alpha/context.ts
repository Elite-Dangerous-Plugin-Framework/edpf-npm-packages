import {
  PluginSettingsContextV1Alpha,
  type PluginContextV1Alpha,
} from "@elite-dangerous-plugin-framework/core/v1alpha";
import { createContext, useContext } from "react";

/**
 * Context that exposes a `PluginContext` instance passed from EDPF. This is only present on the main Plugin Element (→ not on settings, overlay, etc).
 *
 * This specific context shall only be used for Plugins that use the `v1alpha` manifest version.
 *
 * Use `useContext(PluginContext)` to get the instance. The instance is guaranteed to never be null if used within `makePluginV1Alpha`.
 *
 *
 */
export const PluginContext = createContext<PluginContextV1Alpha>(null!);

/**
 * Helper for getting the plugin context via a hook
 */
export function usePluginContext() {
  return useContext(PluginContext);
}

/**
 * Context that exposes a `SettingsContext` instance passed from EDPF. This is only present on the settings Element.
 *
 * This specific context shall only be used for Plugins that use the `v1alpha` manifest version.
 *
 * Use `useContext(SettingsContext)` to get the instance. The instance is guaranteed to never be null if used within `makePluginV1Alpha`.
 *
 *
 */
export const SettingsContext = createContext<PluginSettingsContextV1Alpha>(
  null!,
);

/**
 * Helper for getting the settings context via a hook
 */
export function useSettingsContext() {
  return useContext(SettingsContext);
}
