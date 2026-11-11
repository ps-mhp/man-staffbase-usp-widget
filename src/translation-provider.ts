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

/**
 * Wie die Texte der Box durch Staffbases Inhaltsübersetzung reisen.
 *
 * Der Dienst übersetzt Textknoten, keine Attribute. Die Box schickt deshalb
 * ein kleines Dokument, in dem jeder Text ein eigener Knoten ist und seinen
 * Schlüssel in einem Attribut trägt — wie die Bühne des Hero-Sliders.
 * Gestaltung, Farbe, Symbole und Reihenfolge bleiben Zeichen für Zeichen.
 */

import { TranslationProvider } from "@shared/translation/carriers";

import { CONFIG_ATTRIBUTE } from "./configuration-schema";
import { USP_WIDGET_TAG } from "./usp";
import { UspConfig, encodeConfigAttribute, parseConfig } from "./usp-model";

export const FIELD_ATTRIBUTE = "data-mhp-usp-field";

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Field {
  key: string;
  tag: "h2" | "p";
  text: string;
}

/** Alle übersetzbaren Texte in Lesereihenfolge, mit Schlüssel. */
export function configFields(config: UspConfig): Field[] {
  const fields: Field[] = [];
  const add = (key: string, tag: Field["tag"], text: string | undefined): void => {
    if (text !== undefined && text.trim() !== "") fields.push({ key, tag, text });
  };
  add("eyebrow", "p", config.eyebrow);
  add("heading", "h2", config.heading);
  config.items.forEach((item, index) => {
    add(`${index}.title`, "p", item.title);
    add(`${index}.text`, "p", item.text);
  });
  return fields;
}

export function readTranslatedFields(html: string): Map<string, string> {
  const fields = new Map<string, string>();
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  doc.body.querySelectorAll(`[${FIELD_ATTRIBUTE}]`).forEach((element) => {
    const key = element.getAttribute(FIELD_ATTRIBUTE);
    if (key !== null && !fields.has(key)) fields.set(key, element.textContent ?? "");
  });
  return fields;
}

/** Leer heißt verloren, nicht übersetzt — dann bleibt die Quellsprache. */
const pick = (fields: ReadonlyMap<string, string>, key: string, source: string): string => {
  const translated = fields.get(key)?.trim();
  return translated === undefined || translated === "" ? source : translated;
};

export function applyTranslatedFields(config: UspConfig, fields: ReadonlyMap<string, string>): UspConfig {
  return {
    ...config,
    ...(config.eyebrow === undefined ? {} : { eyebrow: pick(fields, "eyebrow", config.eyebrow) }),
    heading: pick(fields, "heading", config.heading),
    items: config.items.map((item, index) => ({
      ...item,
      title: pick(fields, `${index}.title`, item.title),
      ...(item.text === undefined ? {} : { text: pick(fields, `${index}.text`, item.text) }),
    })),
  };
}

export const uspTranslationProvider: TranslationProvider = {
  id: `${USP_WIDGET_TAG}/${CONFIG_ATTRIBUTE}`,
  label: "USP-Box",
  ref: { tagName: USP_WIDGET_TAG, attribute: CONFIG_ATTRIBUTE },

  toTranslatable: (stored) => {
    const fields = configFields(parseConfig(stored));
    if (fields.length === 0) return null;
    const nodes = fields
      .map(({ key, tag, text }) => `<${tag} ${FIELD_ATTRIBUTE}="${key}">${escapeHtml(text)}</${tag}>`)
      .join("");
    return `<div>${nodes}</div>`;
  },

  acceptsTranslated: (html) => html.includes(FIELD_ATTRIBUTE),

  fromTranslated: (html, stored) => {
    const config = parseConfig(stored);
    if (config.items.length === 0 && config.heading === "") return null;
    return encodeConfigAttribute(applyTranslatedFields(config, readTranslatedFields(html)));
  },
};
