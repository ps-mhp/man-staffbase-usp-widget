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
 * Links die Einstellungen und die Punkte, rechts die Box, wie sie auf der
 * Seite steht. Er läuft im Shadow Root von `@shared/config-modal`; Übergeben,
 * Rückfrage und Wiederöffnen erledigt der Dialog, Speichern und Schließen
 * die Fußleiste hier.
 */

import * as React from "react";
import { ReactElement } from "react";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";
import { cn } from "@shared/ui/utils";

import { UspBox } from "../usp";
import {
  MAX_USP_ITEMS,
  USP_ACCENTS,
  USP_LAYOUTS,
  UspAccent,
  UspConfig,
  UspItem,
  UspLayout,
  emptyItem,
} from "../usp-model";
import { IconPicker } from "./icon-picker";

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

/** Verschiebt einen Punkt um eine Stelle; außerhalb der Liste bleibt alles, wie es ist. */
export function moveItem(items: UspItem[], from: number, by: -1 | 1): UspItem[] {
  const to = from + by;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

interface ItemFieldsProps {
  item: UspItem;
  position: number;
  count: number;
  onChange: (item: UspItem) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
}

function ItemFields({ item, position, count, onChange, onMove, onRemove }: ItemFieldsProps): ReactElement {
  const testId = `usp-item-${position}`;
  const titleId = `${testId}-title`;
  const textId = `${testId}-text`;

  return (
    <fieldset className="grid gap-3 rounded-md border p-3" data-testid={testId}>
      <legend className="px-1 text-sm font-medium">Punkt {position + 1}</legend>
      <div className="-mt-2 flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Punkt ${position + 1} nach vorn`}
          data-testid={`${testId}-up`}
          disabled={position === 0}
          onClick={() => onMove(-1)}
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Punkt ${position + 1} nach hinten`}
          data-testid={`${testId}-down`}
          disabled={position === count - 1}
          onClick={() => onMove(1)}
        >
          ↓
        </Button>
        <Button type="button" variant="ghost" size="sm" data-testid={`${testId}-remove`} onClick={onRemove}>
          Entfernen
        </Button>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={titleId}>Stichwort</Label>
        <Input
          id={titleId}
          data-testid={titleId}
          value={item.title}
          placeholder="z. B. Aerodynamik"
          onChange={(event) => onChange({ ...item, title: event.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={textId}>Erläuterung (optional)</Label>
        <Input
          id={textId}
          data-testid={textId}
          value={item.text ?? ""}
          placeholder="z. B. Verbessert"
          onChange={(event) => {
            const text = event.target.value;
            const { text: _old, ...rest } = item;
            void _old;
            onChange(text === "" ? rest : { ...rest, text });
          }}
        />
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm font-medium">Symbol</span>
        <IconPicker
          value={item.icon}
          testId={`${testId}-icon`}
          onChange={(icon) => {
            const { icon: _old, ...rest } = item;
            void _old;
            onChange(icon === undefined ? rest : { ...rest, icon });
          }}
        />
      </div>
    </fieldset>
  );
}

export interface UspEditorProps {
  value: UspConfig;
  onChange: (config: UspConfig) => void;
  onSave: () => void;
  onClose: () => void;
  dirty: boolean;
}

export function UspEditor({ value, onChange, onSave, onClose, dirty }: UspEditorProps): ReactElement {
  const patch = (changes: Partial<UspConfig>): void => onChange({ ...value, ...changes });
  const setItems = (items: UspItem[]): void => patch({ items });
  const full = value.items.length >= MAX_USP_ITEMS;

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="usp-editor">
      <div className="grid min-h-0 flex-1 gap-6 overflow-auto p-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="grid content-start gap-6">
          <section className="grid gap-2" aria-labelledby="usp-layout-label">
            <h3 id="usp-layout-label" className="text-sm font-semibold">
              Gestaltung
            </h3>
            <div role="radiogroup" aria-labelledby="usp-layout-label" className="grid grid-cols-2 gap-2">
              {USP_LAYOUTS.map((layout) => (
                <button
                  key={layout}
                  type="button"
                  role="radio"
                  aria-checked={value.layout === layout}
                  data-testid={`usp-layout-${layout}`}
                  className={cn(
                    "grid gap-0.5 rounded-md border p-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    value.layout === layout && "border-primary ring-1 ring-primary",
                  )}
                  onClick={() => patch({ layout })}
                >
                  <span className="text-sm font-medium">{LAYOUT_LABELS[layout].title}</span>
                  <span className="text-xs text-muted-foreground">{LAYOUT_LABELS[layout].hint}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-2" aria-labelledby="usp-accent-label">
            <h3 id="usp-accent-label" className="text-sm font-semibold">
              Akzentfarbe
            </h3>
            <div role="radiogroup" aria-labelledby="usp-accent-label" className="flex flex-wrap gap-2">
              {USP_ACCENTS.map((accent) => (
                <button
                  key={accent}
                  type="button"
                  role="radio"
                  aria-checked={value.accent === accent}
                  data-testid={`usp-accent-${accent}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    value.accent === accent && "border-primary ring-1 ring-primary",
                  )}
                  onClick={() => patch({ accent })}
                >
                  <span className="size-3" style={{ background: ACCENT_LABELS[accent].swatch }} aria-hidden="true" />
                  {ACCENT_LABELS[accent].title}
                </button>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3">
            <Switch
              id="usp-show-icons"
              data-testid="usp-show-icons"
              checked={value.showIcons}
              onCheckedChange={(checked) => patch({ showIcons: checked })}
            />
            <Label htmlFor="usp-show-icons">Symbole zeigen</Label>
          </div>

          <section className="grid gap-3" aria-labelledby="usp-text-label">
            <h3 id="usp-text-label" className="text-sm font-semibold">
              Kopf
            </h3>
            <div className="grid gap-1.5">
              <Label htmlFor="usp-eyebrow">Zeile darüber (optional)</Label>
              <Input
                id="usp-eyebrow"
                data-testid="usp-eyebrow"
                value={value.eyebrow ?? ""}
                placeholder="z. B. Kundennutzen"
                onChange={(event) => {
                  const eyebrow = event.target.value;
                  const { eyebrow: _old, ...rest } = value;
                  void _old;
                  onChange(eyebrow === "" ? rest : { ...rest, eyebrow });
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="usp-heading">Überschrift</Label>
              <Input
                id="usp-heading"
                data-testid="usp-heading"
                value={value.heading}
                placeholder="z. B. Was bringt's dem Kunden?"
                onChange={(event) => patch({ heading: event.target.value })}
              />
            </div>
          </section>

          <section className="grid gap-3" aria-labelledby="usp-items-label">
            <h3 id="usp-items-label" className="text-sm font-semibold">
              Punkte
            </h3>
            {value.items.map((item, position) => (
              <ItemFields
                key={item.id}
                item={item}
                position={position}
                count={value.items.length}
                onChange={(next) => setItems(value.items.map((entry, at) => (at === position ? next : entry)))}
                onMove={(by) => setItems(moveItem(value.items, position, by))}
                onRemove={() => setItems(value.items.filter((_, at) => at !== position))}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              data-testid="usp-item-add"
              disabled={full}
              onClick={() => setItems([...value.items, emptyItem()])}
            >
              Punkt hinzufügen
            </Button>
            {full && (
              <p className="text-xs text-muted-foreground">Mehr als {MAX_USP_ITEMS} Punkte trägt keine Gestaltung.</p>
            )}
          </section>
        </div>

        <section className="grid content-start gap-2" aria-label="Vorschau">
          <h3 className="text-sm font-semibold">Vorschau</h3>
          <div className="rounded-md border bg-white p-6" data-testid="usp-preview">
            {value.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Punkte. Ohne Punkte erscheint die Box auf der Seite nicht.
              </p>
            ) : (
              <UspBox config={value} />
            )}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end gap-2 border-t p-4">
        <Button type="button" variant="ghost" data-testid="usp-close" onClick={onClose}>
          Schließen
        </Button>
        <Button type="button" data-testid="usp-save" disabled={!dirty} onClick={onSave}>
          Übernehmen
        </Button>
      </div>
    </div>
  );
}
