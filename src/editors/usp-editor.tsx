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
 * Der Redaktionsdialog der USP-Box.
 *
 * Links die Punkte der Box, in der Mitte die Felder des gewählten Punkts
 * (Text, Icon), rechts das Panel „USP-Box“ mit Kopf, Gestaltung und
 * Verhalten. In den Geräteansichten steht statt der Felder die echte Box in
 * Gerätebreite.
 *
 * Er schreibt nichts selbst zurück und zeichnet keine Knöpfe zum Übernehmen
 * oder Abbrechen: Kopf, Status, Rückgängig, Hilfe und Rückfrage kommen aus
 * dem Rahmen von `@man/config-ui`, das Zurückschreiben ins Formularfeld aus
 * `@shared/config-modal`. Nachgeladen wird er nur im Studio
 * (`usp-editor-injector.ts`).
 */

import * as React from "react";
import { ReactElement, useCallback, useState } from "react";
import { ConfigWorkspace } from "@man/config-ui/layout/config-workspace";
import { useConfigShell } from "@man/config-ui/shell/shell-context";

import { UspBox } from "../usp";
import { MAX_USP_ITEMS, UspConfig, UspItem, emptyItem, newItemId } from "../usp-model";
import { PointMain } from "./point-main";
import { PointSidebar } from "./point-sidebar";
import { UspInspector } from "./usp-inspector";

/** Verschiebt einen Punkt um eine Stelle; außerhalb der Liste bleibt alles, wie es ist. */
export function moveItem(items: UspItem[], from: number, by: -1 | 1): UspItem[] {
  const to = from + by;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

/** Die Punkte in der Reihenfolge der Kennungen; Unbekanntes fällt weg, Fehlendes bleibt hinten. */
export function orderItems(items: readonly UspItem[], ids: readonly string[]): UspItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = ids.flatMap((id) => byId.get(id) ?? []);
  const placed = new Set(ids);
  return [...ordered, ...items.filter((item) => !placed.has(item.id))];
}

export interface UspEditorProps {
  value: UspConfig;
  onChange: (config: UspConfig) => void;
}

/**
 * Die Auswahl hängt an der Kennung, nicht an der Stelle: nach Ziehen, ↑ ↓ und
 * Rückgängig bleibt derselbe Punkt gewählt. Verschwindet er, rückt die
 * Auswahl an dieselbe Stelle nach.
 */
function useSelection(items: readonly UspItem[]) {
  const [selection, setSelection] = useState<{ id: string | null; index: number }>({
    id: items[0]?.id ?? null,
    index: 0,
  });
  const found = items.findIndex((item) => item.id === selection.id);
  const index = found >= 0 ? found : items.length === 0 ? -1 : Math.min(Math.max(selection.index, 0), items.length - 1);
  const select = useCallback(
    (id: string): void => setSelection({ id, index: items.findIndex((item) => item.id === id) }),
    [items],
  );
  return { index, item: index >= 0 ? items[index] : undefined, select };
}

function PreviewStage({ value }: { value: UspConfig }): ReactElement {
  return (
    // `inert`: die Vorschau ist zum Ansehen da, nicht zum Bedienen.
    <div inert data-testid="usp-preview" className="p-6">
      {value.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Noch keine Punkte. Ohne Punkte erscheint die Box auf der Seite nicht.
        </p>
      ) : (
        <UspBox config={value} />
      )}
    </div>
  );
}

export function UspEditor({ value, onChange }: UspEditorProps): ReactElement {
  const { issuesVisible } = useConfigShell();
  const { items } = value;
  const { index, item, select } = useSelection(items);
  const full = items.length >= MAX_USP_ITEMS;
  const setItems = (next: UspItem[]): void => onChange({ ...value, items: next });

  const add = (): void => {
    if (full) return;
    const fresh = emptyItem();
    setItems([...items, fresh]);
    select(fresh.id);
  };
  const duplicate = (): void => {
    if (item === undefined || full) return;
    const copy = { ...item, id: newItemId() };
    setItems([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
    select(copy.id);
  };
  const remove = (): void => {
    if (item === undefined) return;
    const rest = items.filter((entry) => entry.id !== item.id);
    setItems(rest);
    // Der Nachfolger rückt nach, am Ende der Vorgänger.
    const next = rest[Math.min(index, rest.length - 1)];
    if (next !== undefined) select(next.id);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col" data-testid="usp-editor">
      <ConfigWorkspace
        className="flex-1"
        sidebar={
          <PointSidebar
            items={items}
            selectedId={item?.id}
            onSelect={select}
            onAdd={add}
            onReorder={(ids) => setItems(orderItems(items, ids))}
          />
        }
        inspector={<UspInspector value={value} onChange={onChange} />}
        preview={<PreviewStage value={value} />}
      >
        <PointMain
          item={item}
          position={index}
          total={items.length}
          full={full}
          issuesVisible={issuesVisible}
          onChange={(next) => setItems(items.map((entry) => (entry.id === next.id ? next : entry)))}
          onMove={(by) => setItems(moveItem(items, index, by))}
          onDuplicate={duplicate}
          onRemove={remove}
        />
      </ConfigWorkspace>
    </div>
  );
}
