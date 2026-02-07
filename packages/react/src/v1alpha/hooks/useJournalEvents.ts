import { useContext, useEffect, useRef } from "react";
import { PluginContext } from "../context.js";
import {
  JournalEvent,
  JournalEvent_BI,
  parseWithBigInt,
  parseWithLossyIntegers,
} from "@elite-dangerous-plugin-framework/journal";

type Mode = "raw" | "jsonBigint" | "jsonSimple";
type ResponseTypeByMode = {
  raw: string;
  jsonBigint: JournalEvent_BI;
  jsonSimple: JournalEvent;
};

/**
 * This hook accepts a callback that is invoked whenever the plugin receives a batch of new journal items.
 * Do note multiple CMDR's files are send in separate batches.
 *
 * Note that you must provide a `mode`. The mode will determine how the journal items are transformed before being passed to the callback.
 * - `raw` - events are not altered at all and not parsed at all. Each event is a `string`.
 * - `jsonBigint` - events are converted and get strong typing. Integer numbers are parsed as BigInt's
 * - `jsonSimple` - events are converted and get strong typing. Parsing is done using the regular `JSON.parse`
 *
 * If you need help choosing:
 * - do you rely on IDs in your plugin? → pick `jsonBigint`
 * - else, pick `jsonSimple`
 * - if you have some very odd use case where you need to event as string, do pick `raw`
 *
 * @example
 * ```tsx
 * function Example() {
 *  const [lastEventName, setLastEventName] = useState("");
 *  useJournalEvents("jsonSimple", ({ events }) =>
 *    setLastEventName(events[events.length - 1].event),
 *  );
 *
 *  return <div>Last event name: {lastEventName ?? "(awaiting first event)"}</div>
 * }
 * ```
 *
 * @param mode one of `raw` | `jsonBigint` | `jsonSimple`. See function-block comment for more info
 * @param cb The callback invoked whenever a new batch of journals is received. Do note that you get different typings based on the mode you pick!
 */
export function useJournalEvents<T extends Mode>(
  mode: T,
  cb: (payload: {
    events: ResponseTypeByMode[T][];
    cmdr: string;
    file: string;
  }) => void,
): undefined {
  const ctx = useContext(PluginContext);

  // Keep latest callback without re-subscribing
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  useEffect(() => {
    if (!ctx) return;

    const unsubscribe = ctx.registerEventListener((evs) => {
      if (evs.length === 0) return;

      const { cmdr, file } = evs[0];

      let events: JournalEvent[] | JournalEvent_BI[] | string[];
      switch (mode) {
        case "raw":
          events = evs.map((e) => e.event);
          break;
        case "jsonBigint":
          events = evs.map((e) => parseWithBigInt(e.event));
          break;
        case "jsonSimple":
          events = evs.map((e) => parseWithLossyIntegers(e.event));
          break;
      }

      cbRef.current({ events: events as any, cmdr, file });
    });

    return unsubscribe;
  }, [ctx, mode]);
}
