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

/** Die Namen der Gestaltungen und Farben — für den Editor und die Builder-Leiste. */

import { UspAccent, UspLayout } from "./usp-model";

export const LAYOUT_LABELS: Record<UspLayout, { title: string; hint: string }> = {
  split: { title: "Zweispaltig", hint: "Frage links, Antworten rechts untereinander" },
  tiles: { title: "Kacheln", hint: "Je Punkt eine Kachel mit Akzentkante" },
  checklist: { title: "Häkchen auf Fläche", hint: "Getönte Fläche, Häkchen in Akzentfarbe" },
  linebar: { title: "Linienleiste", hint: "Titel mit Akzentlinie, Punkte in einer Zeile" },
  sidepanel: { title: "Farbspalte", hint: "Frage auf Farbfläche, Antworten rechts" },
  band: { title: "Farbband", hint: "Titel als Farbband, Punkte darunter nebeneinander" },
  headbar: { title: "Fragekopf mit Leiste", hint: "Frage links, Punkte als Leiste daneben" },
};

export const ACCENT_LABELS: Record<UspAccent, { title: string; swatch: string }> = {
  red: { title: "Rot", swatch: "#e40045" },
  grey: { title: "Grau", swatch: "#303c49" },
  blue: { title: "Blau", swatch: "#3875b2" },
};
