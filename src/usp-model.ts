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
 * Was eine USP-Box zeigt und wie es im einen Attribut `config` steht.
 *
 * Alles in einem Attribut, weil Staffbases eigener Dialog Auswahlfelder nicht
 * lesbar macht (siehe Hotspot-Widget) und die Liste der Punkte ohnehin einen
 * eigenen Editor braucht. Gespeichert als `b64:`-Payload: Staffbases
 * Übersetzung gibt Attributwerte unmaskiert aus, rohes JSON endete dort am
 * ersten Anführungszeichen.
 *
 * Frei von DOM und React.
 */

import { decodePayload, encodePayload, isPayload } from "@shared/payload";

import { findManIcon } from "./man-icons";

/**
 * Die Gestaltungen. Die Namen beschreiben die Form, nicht den Buchstaben aus
 * dem Entwurf — der Entwurf ist vergänglich, das Attribut nicht.
 *  - `split`: Frage links, Antworten rechts untereinander (Entwurf E),
 *  - `tiles`: Kacheln mit Akzentkante (C),
 *  - `checklist`: getönte Fläche mit Häkchen (B),
 *  - `linebar`: Titel mit Akzentlinie, Punkte in einer Zeile (K),
 *  - `sidepanel`: Farbspalte mit Frage, Antworten rechts (J),
 *  - `band`: Farbband oben, Punkte darunter nebeneinander (I),
 *  - `headbar`: Frage links, Punkte als Leiste daneben (G).
 */
export type UspLayout = "split" | "tiles" | "checklist" | "linebar" | "sidepanel" | "band" | "headbar";

export const USP_LAYOUTS: readonly UspLayout[] = [
  "split",
  "tiles",
  "checklist",
  "linebar",
  "sidepanel",
  "band",
  "headbar",
];

export const DEFAULT_LAYOUT: UspLayout = "split";

/** Die Akzentfarbe im Rahmen der MAN-CI. */
export type UspAccent = "red" | "grey" | "blue";

export const USP_ACCENTS: readonly UspAccent[] = ["red", "grey", "blue"];

export const DEFAULT_ACCENT: UspAccent = "red";

/** Mehr Punkte trägt keine der Gestaltungen; die Leisten brechen schon ab vier um. */
export const MAX_USP_ITEMS = 8;

export interface UspItem {
  /** Stabil über Umsortieren hinweg — React-Key im Editor. */
  id: string;
  /** Das Stichwort, z. B. „Aerodynamik“. */
  title: string;
  /** Die Erläuterung darunter, z. B. „Verbessert“. */
  text?: string;
  /** Name aus `MAN_ICONS`. */
  icon?: string;
}

export interface UspConfig {
  layout: UspLayout;
  accent: UspAccent;
  /** Vorgabe `true`. */
  showIcons: boolean;
  /**
   * Builder-Modus: Leser:innen bekommen über der Box eine Leiste, mit der sie
   * Gestaltung, Farbe und Symbole selbst umschalten. Die Wahl gilt nur für
   * ihre Ansicht und wird nicht gespeichert. Vorgabe `false`.
   */
  builder: boolean;
  /** Die kleine Zeile über der Überschrift, z. B. „Kundennutzen“. */
  eyebrow?: string;
  heading: string;
  items: UspItem[];
}

export const emptyConfig = (): UspConfig => ({
  layout: DEFAULT_LAYOUT,
  accent: DEFAULT_ACCENT,
  showIcons: true,
  builder: false,
  heading: "",
  items: [],
});

/** Wie `newSlideId` im Hero: auch ohne `crypto.randomUUID` (unsicherer Kontext). */
export function newItemId(): string {
  const uuid = globalThis.crypto?.randomUUID;
  if (typeof uuid === "function") return uuid.call(globalThis.crypto);
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const emptyItem = (): UspItem => ({ id: newItemId(), title: "" });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export interface ParseOptions {
  /**
   * Behält Punkte ohne Text. Der Editor braucht das: ein frisch angelegter
   * Punkt ist leer und verschwände sonst beim nächsten Öffnen.
   */
  keepEmpty?: boolean;
}

const parseItem = (value: unknown, options: ParseOptions): UspItem | null => {
  if (!isRecord(value)) return null;
  const title = asText(value.title);
  const text = asText(value.text);
  if (title === "" && text === "" && options.keepEmpty !== true) return null;

  const item: UspItem = { id: asText(value.id) || newItemId(), title };
  if (text !== "") item.text = text;
  // Unbekannte Namen fallen weg: ein Zeichen, das die Schrift nicht kennt,
  // wäre ein leeres Kästchen.
  const icon = asText(value.icon);
  if (findManIcon(icon) !== undefined) item.icon = icon;
  return item;
};

/** Liest das JSON *im* Attribut. Alles Unlesbare ergibt die leere Konfiguration. */
export function parseConfigJson(json: string, options: ParseOptions = {}): UspConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return emptyConfig();
  }
  if (!isRecord(parsed)) return emptyConfig();

  const config = emptyConfig();
  if (USP_LAYOUTS.includes(parsed.layout as UspLayout)) config.layout = parsed.layout as UspLayout;
  if (USP_ACCENTS.includes(parsed.accent as UspAccent)) config.accent = parsed.accent as UspAccent;
  if (parsed.showIcons === false) config.showIcons = false;
  if (parsed.builder === true) config.builder = true;

  const eyebrow = asText(parsed.eyebrow);
  if (eyebrow !== "") config.eyebrow = eyebrow;
  config.heading = asText(parsed.heading);

  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const usedIds = new Set<string>();
  for (const entry of items) {
    if (config.items.length >= MAX_USP_ITEMS) break;
    const item = parseItem(entry, options);
    if (item === null) continue;
    // Doppelte Kennungen ließen React Einträge verwechseln.
    const unique = usedIds.has(item.id) ? { ...item, id: newItemId() } : item;
    usedIds.add(unique.id);
    config.items.push(unique);
  }
  return config;
}

/**
 * Liest das Attribut `config`: `b64:`-Payload (was der Editor schreibt) oder
 * rohes JSON (von Hand gesetzt). Wirft nie — eine kaputte Box darf die Seite
 * nicht mitreißen.
 */
export function parseConfig(raw: unknown, options: ParseOptions = {}): UspConfig {
  if (typeof raw !== "string" || raw.trim() === "") return emptyConfig();
  if (isPayload(raw)) {
    const decoded = decodePayload(raw);
    return decoded === null ? emptyConfig() : parseConfigJson(decoded, options);
  }
  return parseConfigJson(raw, options);
}

/** Das JSON, Vorgaben weggelassen. */
export function serializeConfigJson(config: UspConfig): string {
  const out: Record<string, unknown> = { layout: config.layout, accent: config.accent };
  if (!config.showIcons) out.showIcons = false;
  if (config.builder) out.builder = true;
  if (config.eyebrow !== undefined && config.eyebrow.trim() !== "") out.eyebrow = config.eyebrow;
  out.heading = config.heading;
  out.items = config.items.map((item) => {
    const entry: Record<string, unknown> = { id: item.id, title: item.title };
    if (item.text !== undefined && item.text !== "") entry.text = item.text;
    if (item.icon !== undefined) entry.icon = item.icon;
    return entry;
  });
  return JSON.stringify(out);
}

export function encodeConfigAttribute(config: UspConfig): string {
  return encodePayload(serializeConfigJson(config));
}

/** Ob die Box etwas zu zeigen hat. Ohne Punkte bleibt sie weg, eine Überschrift allein ist keine USP-Box. */
export const hasContent = (config: UspConfig): boolean => config.items.length > 0;
