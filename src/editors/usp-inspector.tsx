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
 * Das Panel „USP-Box“ rechts: Kopf der Box (Inhalt), Gestaltung mit Layout,
 * Akzent und Icons, und das Verhalten (Builder-Modus). Drei Reiter wie im
 * Screen; kleine Wahlen als Pills, An/Aus als Schalterzeile mit Hinweis.
 */

import * as React from "react";
import { ReactElement, useId } from "react";
import { Field } from "@man/config-ui/form/field";
import { SegmentedField } from "@man/config-ui/form/segmented-field";
import type { IconComponent, SegmentedOption } from "@man/config-ui/form/segmented";
import { SwitchRow } from "@man/config-ui/form/switch-row";
import { InspectorPanel } from "@man/config-ui/inspector/inspector-panel";
import { Input } from "@man/config-ui/primitives/input";
import { cn } from "@man/config-ui/primitives/utils";

import { ACCENT_LABELS, LAYOUT_LABELS } from "../labels";
import { IconField } from "@shared/icons/icon-field";
import { USP_ACCENTS, USP_LAYOUTS, UspAccent, UspConfig, UspLayout } from "../usp-model";

export interface UspInspectorProps {
  value: UspConfig;
  onChange: (config: UspConfig) => void;
}

/** Ein Farbpunkt als „Icon“ der Pill; die Farbe ist ein Datum der Marke, kein Theme-Token. */
function swatch(accent: UspAccent): IconComponent {
  function Swatch(): ReactElement {
    return (
      <span
        aria-hidden="true"
        className="size-3 shrink-0 rounded-full"
        style={{ background: ACCENT_LABELS[accent].swatch }}
      />
    );
  }
  return Swatch;
}

const ACCENT_OPTIONS: readonly SegmentedOption<UspAccent>[] = USP_ACCENTS.map((accent) => ({
  id: accent,
  label: ACCENT_LABELS[accent].title,
  icon: swatch(accent),
}));

/**
 * Welche Teile der Miniatur Akzent tragen: das erste Feld (Titel, Spalte,
 * Band) und die übrigen (Punkte).
 */
const THUMB_ACCENT: Record<UspLayout, { head: boolean; rest: boolean }> = {
  split: { head: false, rest: false },
  tiles: { head: false, rest: false },
  checklist: { head: true, rest: false },
  checkline: { head: true, rest: false },
  linebar: { head: true, rest: false },
  sidepanel: { head: true, rest: false },
  band: { head: true, rest: true },
  headbar: { head: true, rest: false },
};

function LayoutThumb({ layout }: { layout: UspLayout }): ReactElement {
  const { head, rest } = THUMB_ACCENT[layout];
  return (
    <span aria-hidden="true" className="grid h-9 grid-cols-4 gap-[3px] bg-muted p-1">
      <span className={head ? "bg-primary" : "bg-border"} />
      <span className={rest ? "bg-primary" : "bg-border"} />
      <span className={rest ? "bg-primary" : "bg-border"} />
      <span className={rest ? "bg-primary" : "bg-border"} />
    </span>
  );
}

function LayoutField({ value, onChange }: { value: UspLayout; onChange: (layout: UspLayout) => void }): ReactElement {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-[13px] font-semibold text-foreground">
        Layout
      </span>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-2 gap-2">
        {USP_LAYOUTS.map((layout) => {
          const on = layout === value;
          return (
            <button
              key={layout}
              type="button"
              aria-pressed={on}
              title={LAYOUT_LABELS[layout].hint}
              data-testid={`usp-layout-${layout}`}
              className={cn(
                "flex cursor-pointer flex-col gap-1.5 rounded-md border bg-background p-2 text-left text-xs leading-snug text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 motion-reduce:transition-none",
                on && "border-primary ring-1 ring-primary",
              )}
              onClick={() => onChange(layout)}
            >
              <LayoutThumb layout={layout} />
              {LAYOUT_LABELS[layout].title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Ohne Zeichen statt mit leerem Namen: so bleibt das Attribut schlank. */
function withHeadIcon(config: UspConfig, headIcon: string | undefined): UspConfig {
  if (headIcon !== undefined) return { ...config, headIcon };
  const { headIcon: _dropped, ...rest } = config;
  void _dropped;
  return rest;
}

/** Ohne die Zeile darüber statt mit leerem Text: so bleibt das Attribut schlank. */
function withEyebrow(config: UspConfig, eyebrow: string): UspConfig {
  if (eyebrow !== "") return { ...config, eyebrow };
  const { eyebrow: _dropped, ...rest } = config;
  void _dropped;
  return rest;
}

function ContentTab({ value, onChange }: UspInspectorProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Zeile darüber" hint="Optional, eine kurze Zeile über der Überschrift.">
        <Input
          data-testid="usp-eyebrow"
          value={value.eyebrow ?? ""}
          placeholder="z. B. Kundennutzen"
          onChange={(event) => onChange(withEyebrow(value, event.target.value))}
        />
      </Field>
      <Field label="Überschrift" hint="Die Frage oder der Titel der Box.">
        <Input
          data-testid="usp-heading"
          value={value.heading}
          placeholder="z. B. Was bringt's dem Kunden?"
          onChange={(event) => onChange({ ...value, heading: event.target.value })}
        />
      </Field>
      {value.layout === "checkline" && (
        <section aria-label="Zeichen über der Überschrift" className="flex flex-col gap-1.5">
          <IconField
            label="Zeichen über der Überschrift"
            title="Zeichen über der Überschrift"
            value={value.headIcon}
            onChange={(headIcon) => onChange(withHeadIcon(value, headIcon))}
            data-testid="usp-head-icon"
          />
          <p className="text-[13px] text-muted-foreground">Steht in Akzentfarbe über der Frage; „Icons zeigen“ aus blendet es aus.</p>
        </section>
      )}
      <p className="text-[13px] text-muted-foreground">
        Die Punkte bearbeiten Sie links; Layout, Akzent und Icons unter „Gestaltung“.
      </p>
    </div>
  );
}

function DesignTab({ value, onChange }: UspInspectorProps): ReactElement {
  return (
    <div className="flex flex-col gap-5">
      <LayoutField value={value.layout} onChange={(layout) => onChange({ ...value, layout })} />
      <SegmentedField
        label="Akzent"
        options={ACCENT_OPTIONS}
        value={value.accent}
        onChange={(accent) => onChange({ ...value, accent })}
      />
      <SwitchRow
        label="Icons zeigen"
        hint="Aus blendet alle Icons aus; die Häkchenlisten zeigen dann überall das Häkchen."
        checked={value.showIcons}
        onCheckedChange={(showIcons) => onChange({ ...value, showIcons })}
        data-testid="usp-show-icons"
      />
    </div>
  );
}

function BehaviourTab({ value, onChange }: UspInspectorProps): ReactElement {
  return (
    <SwitchRow
      label="Builder-Modus"
      hint="Zeigt über der Box eine Leiste, mit der Leser:innen Gestaltung, Farbe und Icons selbst umschalten. Ihre Wahl wird nicht gespeichert."
      checked={value.builder}
      onCheckedChange={(builder) => onChange({ ...value, builder })}
      data-testid="usp-builder-toggle"
    />
  );
}

export function UspInspector(props: UspInspectorProps): ReactElement {
  return (
    <InspectorPanel
      title="USP-Box"
      tabs={[
        { id: "content", label: "Inhalt", content: <ContentTab {...props} /> },
        { id: "design", label: "Gestaltung", content: <DesignTab {...props} /> },
        { id: "behaviour", label: "Verhalten", content: <BehaviourTab {...props} /> },
      ]}
    />
  );
}
