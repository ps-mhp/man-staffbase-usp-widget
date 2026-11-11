/*!
 * Copyright 2026, MHP Management und IT-Beratung GmbH and contributors.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { USP_ACCENTS, USP_LAYOUTS } from "./usp-model";

const read = (file: string): string => readFileSync(join(__dirname, "styles", file), "utf8");

describe("Stylesheet der USP-Box", () => {
  const css = read("usp.scss");

  it("gestaltet jede Gestaltung des Modells", () => {
    for (const layout of USP_LAYOUTS) expect(css).toMatch(new RegExp(`\\.man-usp--${layout}\\s*\\{`));
  });

  it("führt jede Akzentfarbe des Modells", () => {
    for (const accent of USP_ACCENTS) expect(css).toMatch(new RegExp(`"${accent}":`));
  });

  it("setzt Texte und Liste gegen die Wirtsseite durch", () => {
    for (const name of ["heading", "eyebrow", "title", "text", "list", "item", "icon"]) {
      expect(css).toMatch(new RegExp(`\\.man-usp__${name}\\s*\\{\\s*@include man-outshine-host`));
    }
  });

  it("gestaltet nur Klassen, die es im Markup wirklich gibt", () => {
    const sources = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return sources(path);
        if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
        return [readFileSync(path, "utf8")];
      });
    const names = (source: string, prefix: string): Set<string> =>
      new Set([...source.matchAll(new RegExp(`${prefix}(man-usp(?:__|--)[a-z0-9-]+)`, "g"))].map(([, name]) => name!));

    const rendered = names(sources(__dirname).join("\n"), "");
    const orphans = [...names(css, "\\.")].filter((name) => !rendered.has(name));

    expect(orphans).toEqual([]);
  });
});
