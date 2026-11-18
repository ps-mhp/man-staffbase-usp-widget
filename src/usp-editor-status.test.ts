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

import { UspConfig, emptyConfig } from "./usp-model";
import { uspChangesStatus, validateUsp } from "./usp-editor-status";

const base = (): UspConfig => ({
  ...emptyConfig(),
  heading: "Was uns ausmacht",
  items: [
    { id: "a", title: "Sicherheit", text: "Schutz", icon: "workshop" },
    { id: "b", title: "Effizienz" },
  ],
});

describe("validateUsp", () => {
  it("meldet einen Punkt ohne Text mit seiner Nummer", () => {
    const draft = { ...base(), items: [...base().items, { id: "c", title: "  " }] };
    expect(validateUsp(draft)).toEqual([{ id: "c", message: "Punkt 3: Stichwort fehlt" }]);
  });

  it("lässt einen Punkt mit nur einer Erläuterung gelten", () => {
    const draft = { ...base(), items: [{ id: "a", title: "", text: "Nur Text" }] };
    expect(validateUsp(draft)).toEqual([]);
  });

  it("akzeptiert die leere Box", () => {
    expect(validateUsp(emptyConfig())).toEqual([]);
  });
});

describe("uspChangesStatus", () => {
  it("schweigt, solange nichts abweicht", () => {
    expect(uspChangesStatus(base(), base())).toBeUndefined();
  });

  it("zählt geänderte, neue und entfernte Punkte", () => {
    const saved = base();
    const edited = { ...saved, items: [{ ...saved.items[0]!, title: "Schutz" }, saved.items[1]!] };
    expect(uspChangesStatus(edited, saved)).toBe("1 Punkt geändert");

    const added = { ...saved, items: [...saved.items, { id: "c", title: "Neu" }] };
    expect(uspChangesStatus(added, saved)).toBe("1 Punkt geändert");

    const removed = { ...saved, items: [saved.items[0]!] };
    expect(uspChangesStatus(removed, saved)).toBe("1 Punkt geändert");

    const both = { ...saved, items: [{ ...saved.items[0]!, title: "X" }, { id: "c", title: "Neu" }] };
    expect(uspChangesStatus(both, saved)).toBe("3 Punkte geändert");
  });

  it("nennt eine bloße Umsortierung", () => {
    const saved = base();
    const swapped = { ...saved, items: [saved.items[1]!, saved.items[0]!] };
    expect(uspChangesStatus(swapped, saved)).toBe("Reihenfolge geändert");
  });

  it("nennt Einstellungen und hängt sie an", () => {
    const saved = base();
    expect(uspChangesStatus({ ...saved, accent: "blue" }, saved)).toBe("Einstellungen geändert");
    expect(uspChangesStatus({ ...saved, eyebrow: "Zeile" }, saved)).toBe("Einstellungen geändert");
    const edited = { ...saved, builder: true, items: [saved.items[0]!, { ...saved.items[1]!, title: "E" }] };
    expect(uspChangesStatus(edited, saved)).toBe("1 Punkt geändert · Einstellungen geändert");
  });
});
