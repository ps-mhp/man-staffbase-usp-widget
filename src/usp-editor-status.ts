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
 * Prüfung und Statustext der USP-Box im Rahmen des Konfigurationsdialogs.
 *
 * Liegt im Seitenbündel, weil der Injektor beides dem Rahmen mitgibt, bevor
 * der Editor nachgeladen ist – deshalb nichts außer dem Modell.
 */

import type { ValidationIssue } from "@man/config-ui/shell/shell-context";

import { UspConfig, UspItem } from "./usp-model";

const sameJson = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * Ein Punkt ohne Stichwort und ohne Erläuterung würde auf der Seite
 * übergangen; „Übernehmen“ nennt ihn, statt ihn stillschweigend zu verlieren.
 */
export function validateUsp(draft: UspConfig): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  draft.items.forEach((item, index) => {
    const empty = item.title.trim() === "" && (item.text ?? "").trim() === "";
    if (empty) issues.push({ id: item.id, message: `Punkt ${index + 1}: Stichwort fehlt` });
  });
  return issues;
}

/** Punkte, die neu sind oder anders lauten, plus die entfernten; jeder zählt einmal. */
function changedPoints(draft: readonly UspItem[], saved: readonly UspItem[]): number {
  const before = new Map(saved.map((item) => [item.id, item]));
  const changed = draft.filter((item) => !sameJson(item, before.get(item.id))).length;
  const kept = new Set(draft.map((item) => item.id));
  const removed = saved.filter((item) => !kept.has(item.id)).length;
  return changed + removed;
}

const sameOrder = (draft: readonly UspItem[], saved: readonly UspItem[]): boolean =>
  draft.length === saved.length && draft.every((item, index) => item.id === saved[index]?.id);

/** Gestaltung, Farbe, Zeichen, Builder und Kopf – alles außer den Punkten. */
function settingsChanged(draft: UspConfig, saved: UspConfig): boolean {
  return (
    draft.layout !== saved.layout ||
    draft.accent !== saved.accent ||
    draft.showIcons !== saved.showIcons ||
    draft.builder !== saved.builder ||
    (draft.eyebrow ?? "") !== (saved.eyebrow ?? "") ||
    draft.heading !== saved.heading
  );
}

const pointsText = (count: number): string => (count === 1 ? "1 Punkt geändert" : `${count} Punkte geändert`);

/**
 * Der Status im Kopf, solange der Entwurf nicht übernommen ist: „1 Punkt
 * geändert · Einstellungen geändert“. `undefined`, wenn sich nichts
 * unterscheidet.
 */
export function uspChangesStatus(draft: UspConfig, saved: UspConfig): string | undefined {
  const parts: string[] = [];
  const points = changedPoints(draft.items, saved.items);
  if (points > 0) parts.push(pointsText(points));
  else if (!sameOrder(draft.items, saved.items)) parts.push("Reihenfolge geändert");
  if (settingsChanged(draft, saved)) parts.push("Einstellungen geändert");
  return parts.length === 0 ? undefined : parts.join(" · ");
}
