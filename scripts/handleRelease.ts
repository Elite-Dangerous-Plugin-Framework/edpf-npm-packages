import { $, cd, within } from "zx";
import { env, exit } from "node:process";
import { parse } from "semver";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const currentTagStr = env["GITHUB_REF"]?.replaceAll("refs/tags/", "");
if (!currentTagStr) {
  throw new Error("GITHUB_REF unset");
}

const tag = parse(
  currentTagStr,
  {
    loose: false,
  },
  true,
);

const careAboutPrereleases = currentTagStr.includes("-pre");

const maybeLastRelevantEvent = (
  await $`git tag --sort=-creatordate | grep '^v'`
)
  .lines()
  .filter((e) => {
    const ev = parse(e);
    if (!ev) {
      return false;
    }
    if (tag.version == ev.version) {
      // current version we are building
      return false;
    }

    const isPrerelease = ev.prerelease.length > 0;
    if (!isPrerelease) {
      return true;
    }
    return careAboutPrereleases;
  })
  .find(() => true);

if (!maybeLastRelevantEvent) {
  await $`echo "changed=false" >> $GITHUB_OUTPUT`;
  exit(0);
}

const changed: { name: string; location: string }[] =
  await $`npx lerna changed --since ${maybeLastRelevantEvent} --json`.then(
    (e) => JSON.parse(e.stdout),
  );

await Promise.all(
  changed.map(async ({ location }) => {
    const packageLocation = join(location, "package.json");
    const content = await readFile(packageLocation, "utf-8").then((e) =>
      JSON.parse(e),
    );
    content.version = tag.version;
    await writeFile(
      packageLocation,
      JSON.stringify(content, undefined, 2),
      "utf-8",
    );
    console.info("patched " + packageLocation);
  }),
);

// At this point the package.json is patched with the correct version for own module. We still need to update to correct local dependencies
// This here basically updates our local deps
for (const item of changed) {
  switch (item.name) {
    case "@elite-dangerous-plugin-framework/react":
      await within(async () => {
        cd(item.location);
        await $`npm i @elite-dangerous-plugin-framework/core`;
      });
  }
}
// INFO: ^^^ up here you need to adjust the dependency tree manually

// At this point the package should be set up correctly with all the deps.
console.log("Building all packages");
await $`npm run build`;

console.log("…done");

for (const item of changed) {
  await within(async () => {
    cd(item.location);
    console.info("Publishing package " + item.name);
    await $`npx lerna publish from-package --force-publish --yes`;
  });
}

console.info("…done :)");
