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
 * Der Rumpf des USP-Editors: Kopf mit „Punkt 1 von 4“ und den Aktionen,
 * darunter die Abschnitte Text und Icon auf Lesebreite (720 px) – wie im
 * Screen.
 */

import * as React from "react";
import { ReactElement } from "react";
import { Field } from "@man/config-ui/form/field";
import { FormSection } from "@man/config-ui/form/form-section";
import { Input } from "@man/config-ui/primitives/input";
import { RichTextField } from "@man/config-ui/rich-text/rich-text-field";
import { ItemActions } from "@man/config-ui/sidebar/item-actions";

import { UspItem } from "../usp-model";
import { IconField } from "@shared/icons/icon-field";

export interface PointMainProps {
  item: UspItem | undefined;
  position: number;
  total: number;
  full: boolean;
  /** Ob „Übernehmen“ schon an Fehlern scheiterte; erst dann zeigen Felder ihre. */
  issuesVisible: boolean;
  onChange: (item: UspItem) => void;
  onMove: (by: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

/** Ohne die Eigenschaft statt mit leerem Wert: so bleibt das Attribut schlank. */
function withoutKey<K extends "text" | "icon">(item: UspItem, key: K): UspItem {
  const { [key]: _dropped, ...rest } = item;
  void _dropped;
  return rest as UspItem;
}

export function PointMain({
  item,
  position,
  total,
  full,
  issuesVisible,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: PointMainProps): ReactElement {
  if (item === undefined) {
    return (
      <p className="px-10 py-6 text-sm text-muted-foreground max-lg:px-6">
        Hier stehen die Felder des gewählten Punkts. Ohne Punkte erscheint die Box auf der Seite nicht.
      </p>
    );
  }
  const testId = `usp-item-${position}`;
  const empty = item.title.trim() === "" && (item.text ?? "").trim() === "";

  return (
    <div className="px-10 pt-6 pb-12 max-lg:px-6" data-testid={testId}>
      <div className="flex max-w-[720px] flex-col gap-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-xl font-semibold text-foreground">{`Punkt ${position + 1} von ${total}`}</h2>
          <ItemActions
            className="ml-auto"
            noun="Punkt"
            onMoveBack={() => onMove(-1)}
            onMoveForward={() => onMove(1)}
            canMoveBack={position > 0}
            canMoveForward={position < total - 1}
            onDuplicate={onDuplicate}
            canDuplicate={!full}
            onDelete={onRemove}
          />
        </div>

        <FormSection title="Text">
          <Field label="Stichwort" error={issuesVisible && empty ? "Ohne Stichwort oder Erläuterung wird der Punkt nicht gezeigt." : undefined}>
            <Input
              data-testid={`${testId}-title`}
              value={item.title}
              placeholder="z. B. Aerodynamik"
              onChange={(event) => onChange({ ...item, title: event.target.value })}
            />
          </Field>
          <Field label="Erläuterung" hint="Optional, steht unter dem Stichwort. Aufzählung über den Knopf oder „- “ am Zeilenanfang; Umschalt+Enter beginnt eine neue Zeile.">
            <RichTextField
              // Je Punkt ein eigenes Feld: der Inhalt gehört nicht zum nächsten Punkt.
              key={item.id}
              data-testid={`${testId}-text`}
              value={item.text ?? ""}
              placeholder="z. B. Verbessert"
              onChange={(text) => onChange(text === "" ? withoutKey(item, "text") : { ...item, text })}
            />
          </Field>
        </FormSection>

        <FormSection title="Icon">
          <IconField
            // Je Punkt ein eigenes Feld: die offene Auswahl gehört nicht zum nächsten Punkt.
            key={item.id}
            label="Zeichen vor dem Punkt"
            title={`Icon für Punkt ${position + 1}`}
            value={item.icon}
            data-testid={`${testId}-icon`}
            onChange={(icon) => onChange(icon === undefined ? withoutKey(item, "icon") : { ...item, icon })}
          />
        </FormSection>
      </div>
    </div>
  );
}
