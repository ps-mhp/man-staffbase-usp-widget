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

import { emptyConfig, encodeConfigAttribute, parseConfig } from "./usp-model";
import { FIELD_ATTRIBUTE, uspTranslationProvider } from "./translation-provider";

const stored = encodeConfigAttribute({
  ...emptyConfig(),
  layout: "tiles",
  accent: "blue",
  eyebrow: "Kundennutzen",
  heading: "Was bringt's dem Kunden?",
  items: [
    { id: "a", title: "Aerodynamik", text: "Verbessert", icon: "checkmark" },
    { id: "b", title: "Styling" },
  ],
});

/** Ersetzt jeden Textknoten wie ein Übersetzungsdienst. */
const translate = (html: string): string => html.replace(/>([^<>]+)</g, (_, text: string) => `>EN:${text}<`);

describe("uspTranslationProvider", () => {
  it("schickt jeden Text als eigenen Knoten mit Schlüssel", () => {
    const html = uspTranslationProvider.toTranslatable(stored) as string;

    expect(html).toContain(`${FIELD_ATTRIBUTE}="heading"`);
    expect(html).toContain(`${FIELD_ATTRIBUTE}="0.text"`);
    expect(html).not.toContain("1.text");
    expect(uspTranslationProvider.acceptsTranslated(html)).toBe(true);
  });

  it("schreibt die Übersetzung zurück und lässt alles andere stehen", () => {
    const html = translate(uspTranslationProvider.toTranslatable(stored) as string);
    const result = parseConfig(uspTranslationProvider.fromTranslated(html, stored));

    expect(result).toEqual({
      ...parseConfig(stored),
      eyebrow: "EN:Kundennutzen",
      heading: "EN:Was bringt's dem Kunden?",
      items: [
        { id: "a", title: "EN:Aerodynamik", text: "EN:Verbessert", icon: "checkmark" },
        { id: "b", title: "EN:Styling" },
      ],
    });
  });

  it("behält die Quellsprache, wo der Dienst einen Text verloren hat", () => {
    const html = (uspTranslationProvider.toTranslatable(stored) as string).replace(">Styling<", "><");
    const result = parseConfig(uspTranslationProvider.fromTranslated(html, stored));

    expect(result.items[1]!.title).toBe("Styling");
  });

  it("hat ohne Inhalt nichts zu übersetzen", () => {
    expect(uspTranslationProvider.toTranslatable(null)).toBeNull();
  });
});
