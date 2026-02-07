import type {
  Destructor,
  PluginContextV1AlphaCapabilitiesSettings,
} from "./context.js";
import { PluginManifestV1AlphaWithId } from "./manifest.js";

/**
 * The settings context. This is trimmed down and does not get any Journal updates. You only get access to read and write Settings here, plus get the assetsBase so you can load images / stylesheets.
 */
export interface PluginSettingsContextV1Alpha {
  /**
   * **Enabled by default**
   *
   * always present, used to read and write settings.
   */
  get Settings(): PluginContextV1AlphaCapabilitiesSettings;
  /**
   * Your Plugin is exposed via an asset server that is running on localhost. The Port is not stable. Use this readonly property to get the base URL.
   *
   * You can then append the path to the file, relative to the `frontend` folder. Do note that relative escapes out of the `frontend` folder are not supported.
   *
   * `assetsBase` has always a `/` as a suffix.
   */
  get assetsBase(): string;

  /**
   * This is useful for writing plugins in a more abstract manner. (e.g. not hardcoding settings keys).
   * The property exposes the Plugin Manifest
   */
  get pluginMeta(): PluginManifestV1AlphaWithId;

  /**
   * ## Used to block shutdown for cleanup tasks
   *
   * If your Plugin requires some form of cleanup / finalizing, register a shutdown listener here.
   * When stopping a Plugin, the Context will **wait up to a second** for you to finish cleanup.
   *
   * Cleanup is considered finished **when the Promise returns**. The callback is invoked once only
   *
   * This can be called multiple times. On call, you get back a destructor that should be invoked to unregister.
   */
  registerShutdownListener(callback: () => Promise<void>): Destructor;

  /**
   * ## Used to open a URL in the User's browser
   *
   * Note that using a `<a href="…"/>` is not possible as that would cause In-Webview navigation. Instead, you have to instruct the OS to open the resource outside the webview.
   * This Command does just that. Do note that only the `http` and `https` protocols are supported.
   *
   * This action is considered a Safe action and is accessible to all plugins without additional permissions
   */
  openUrl(url: string): Promise<void>;
}
