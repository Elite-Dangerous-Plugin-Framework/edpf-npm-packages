import { memo, useContext, useEffect, useState } from "react";
import { PluginContext } from "../context.js";

/**
 * Fetch and listen for updates on a specific setting. Also exposes a callback to write a setting, which is only possible if the first segment is identical to the plugin ID (=it's the plugin's own setting)
 * @param pluginKey a setting key. You can omit the plugin ID. So `pluginname.some.key` and `.some.key` are identical. You can also listen to other plugin's settings, **if** they are public (identified by the last segment being Uppercase).
 *
 * @example
 * ```tsx
 *  interface SettingValues {
 *    preferredShipSite: "coriolis" | "edsy";
 *    preferredSystemSite: "inara" | "spansh" | "edsm";
 *  }
 *
 *  function Example() {
 *    // we dont write in this example
 *    const [settings, _, isLoaded] =
 *      usePluginSetting<SettingValues>(".preferredTooling");
 *
 *    if (!isLoaded) {
 *      return <div>Loading…</div>;
 *    }
 *    if (!settings) {
 *      return <div>No setting set…</div>;
 *    }
 *
 *    return (
 *      <div>
 *        Preferred Ship Site: {settings.preferredShipSite}, System Site:{" "}
 *        {settings.preferredSystemSite}
 *      </div>
 *    );
 *  }
 * ```
 *
 * @returns a tuple containing the setting, the write callback to invoke, and a bool if it has finished the initial load (to differentiate between fetching and fetched but missing).
 */
export function usePluginSetting<T = any>(pluginKey: string) {
  const [state, setState] = useState<T | undefined>(undefined);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const ctx = useContext(PluginContext);

  const normalizedPluginKey = pluginKey.startsWith(".")
    ? ctx.pluginMeta.id + pluginKey
    : pluginKey;

  useEffect(() => {
    // fetch initial state immediately
    ctx.Capabilities.Settings.getSetting(normalizedPluginKey)
      .then((e) => {
        setState(e as any);
        setFinishedLoading(true);
      })
      .catch((err) => {
        console.error(
          `Your Hook to get the setting ${normalizedPluginKey} has failed. This is likely because it is invalid. Please make sure you either access a public setting from a different plugin, or, when accessing an internal setting, make sure the format is correct. Do note you can omit the plugin id and just start with a dot`,
          { err, normalizedPluginKey, pluginKey },
        );
        throw err;
      });

    return ctx.Capabilities.Settings.registerSettingsChangedListener((k, v) => {
      if (k !== normalizedPluginKey) {
        // this is a setting update not captured by this hook
        return;
      }
      setState(v as any);
    });
  });

  const writeSetting = (val: T | undefined) => {
    ctx.Capabilities.Settings.writeSetting(normalizedPluginKey, val)
      .then((e) => {
        setState(e);
      })
      .catch((err) => {
        console.error(
          `Your Hook tried to write ${normalizedPluginKey} and failed. This is likely because you are trying to write another plugin's settings, which is not permitted.`,
          {
            err,
            normalizedPluginKey,
            pluginKey,
            ownPluginId: ctx.pluginMeta.id,
          },
        );
        throw err;
      });
  };

  return [state, writeSetting, finishedLoading] as const;
}

type Locale =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "ja"
  | "ko"
  | "zh"
  | "ru";
/**
 * Wrapper that gets you the currently selected language. Use this if you are providing translations.
 * You cannot change the locale from the plugin as the setting belongs to the bundled `core` plugin. Instead, users must change it in the settings pane.
 *
 * @returns a tuple of `[currentLocale, initialLoadComplete]`
 */
export function useTranslation(): [Locale | undefined, boolean] {
  const [lang, _, loaded] = usePluginSetting<Locale>("core.Locale");
  return [lang, loaded];
}
