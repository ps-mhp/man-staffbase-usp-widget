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

import { encodePayload } from "@shared/payload";

import {
  MAX_USP_ITEMS,
  emptyConfig,
  encodeConfigAttribute,
  parseConfig,
  serializeConfigJson,
} from "./usp-model";

const json = (value: unknown): string => JSON.stringify(value);

describe("parseConfig", () => {
  it("gibt für Leeres und Unlesbares die leere Konfiguration", () => {
    expect(parseConfig(undefined)).toEqual(emptyConfig());
    expect(parseConfig("")).toEqual(emptyConfig());
    expect(parseConfig("{kaputt")).toEqual(emptyConfig());
    expect(parseConfig("b64:###")).toEqual(emptyConfig());
    expect(parseConfig("[1,2]")).toEqual(emptyConfig());
  });

  it("liest rohes JSON und den b64-Payload gleich", () => {
    const raw = json({ layout: "tiles", accent: "blue", heading: "Was bringt's?", items: [{ id: "a", title: "Aero" }] });

    expect(parseConfig(raw)).toEqual(parseConfig(encodePayload(raw)));
    expect(parseConfig(raw)).toMatchObject({ layout: "tiles", accent: "blue", heading: "Was bringt's?" });
  });

  it("fällt bei unbekannter Gestaltung oder Farbe auf die Vorgabe zurück", () => {
    expect(parseConfig(json({ layout: "glitzer", accent: "pink", items: [] }))).toMatchObject({
      layout: "split",
      accent: "red",
    });
  });

  it("verwirft unbekannte Symbole und leere Punkte", () => {
    const config = parseConfig(
      json({ items: [{ id: "a", title: "Aero", icon: "rakete" }, { id: "b", title: " " }, { id: "c", text: "Nur Text", icon: "truck" }] }),
    );

    expect(config.items).toEqual([
      { id: "a", title: "Aero" },
      { id: "c", title: "", text: "Nur Text", icon: "truck" },
    ]);
  });

  it("behält leere Punkte für den Editor", () => {
    expect(parseConfig(json({ items: [{ id: "b", title: "" }] }), { keepEmpty: true }).items).toEqual([
      { id: "b", title: "" },
    ]);
  });

  it("liest höchstens die Obergrenze an Punkten und ersetzt doppelte Kennungen", () => {
    const items = Array.from({ length: MAX_USP_ITEMS + 2 }, (_, n) => ({ id: "gleich", title: `P${n}` }));
    const config = parseConfig(json({ items }));

    expect(config.items).toHaveLength(MAX_USP_ITEMS);
    expect(new Set(config.items.map((item) => item.id)).size).toBe(MAX_USP_ITEMS);
  });
});

describe("Schreiben", () => {
  it("übersteht einen Round-Trip über das Attribut", () => {
    const config = {
      ...emptyConfig(),
      layout: "sidepanel" as const,
      accent: "grey" as const,
      showIcons: false,
      eyebrow: "Kundennutzen",
      heading: "Was bringt's dem Kunden?",
      items: [{ id: "a", title: "Aerodynamik", text: "Verbessert", icon: "checkmark" }],
    };

    expect(encodeConfigAttribute(config).startsWith("b64:")).toBe(true);
    expect(parseConfig(encodeConfigAttribute(config))).toEqual(config);
  });

  it("lässt Vorgaben weg", () => {
    const written = serializeConfigJson({ ...emptyConfig(), items: [{ id: "a", title: "X" }] });

    expect(written).not.toContain("showIcons");
    expect(written).not.toContain("eyebrow");
    expect(written).not.toContain('"text"');
  });
});
