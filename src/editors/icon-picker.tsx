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
 * Die Auswahl eines Zeichens aus der MAN-Symbolschrift: Suchfeld und ein
 * Raster, das immer offen steht. Ein Raster statt einer Ausklappliste, weil
 * ein Symbol am Bild erkannt wird, nicht am Namen — und `<option>` die
 * Symbolschrift nicht zuverlässig darstellt.
 */

import * as React from "react";
import { ReactElement, useState } from "react";
import { SearchField } from "@man/config-ui/form/search-field";
import { Button } from "@man/config-ui/primitives/button";

import { cn } from "@man/config-ui/primitives/utils";

import { MAN_ICONS, ManIcon, findManIcon, manIconGlyph } from "../man-icons";

/** Dieselbe Familienfolge wie in der Box: Theme zuerst, eingebettete Kopie danach. */
export const ICON_FONT_STYLE: React.CSSProperties = {
  fontFamily: '"man-icon", "man-usp-icon"',
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: 1,
};

export function Glyph({ icon, className }: { icon: ManIcon; className?: string }): ReactElement {
  return (
    <span aria-hidden="true" className={className} style={ICON_FONT_STYLE}>
      {manIconGlyph(icon)}
    </span>
  );
}

const matches = (icon: ManIcon, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return needle === "" || icon.label.toLowerCase().includes(needle) || icon.name.includes(needle);
};

export interface IconPickerProps {
  value: string | undefined;
  onChange: (name: string | undefined) => void;
  testId: string;
}

export function IconPicker({ value, onChange, testId }: IconPickerProps): ReactElement {
  const [query, setQuery] = useState("");
  const current = findManIcon(value);
  const visible = MAN_ICONS.filter((icon) => matches(icon, query));

  return (
    <div className="flex flex-col gap-3" data-testid={testId}>
      <div className="flex max-w-[360px] items-center gap-2">
        <SearchField
          className="min-w-0 flex-1"
          aria-label="Icon suchen"
          placeholder="Icon suchen"
          data-testid={`${testId}-search`}
          value={query}
          onValueChange={setQuery}
        />
        {current !== undefined && (
          <Button type="button" variant="ghost" size="sm" data-testid={`${testId}-clear`} onClick={() => onChange(undefined)}>
            Kein Icon
          </Button>
        )}
      </div>
      <div
        role="group"
        aria-label="Icons"
        className="grid max-h-72 max-w-[520px] grid-cols-8 gap-1.5 overflow-y-auto p-0.5 max-sm:grid-cols-5"
      >
        {visible.map((icon) => {
          const on = icon.name === value;
          return (
            <button
              key={icon.name}
              type="button"
              aria-pressed={on}
              aria-label={icon.label}
              title={icon.label}
              data-testid={`${testId}-option-${icon.name}`}
              className={cn(
                "grid h-11 cursor-pointer place-items-center rounded-md border bg-background text-2xl text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 motion-reduce:transition-none",
                on && "border-primary bg-muted ring-1 ring-primary",
              )}
              onClick={() => onChange(icon.name)}
            >
              <Glyph icon={icon} />
            </button>
          );
        })}
        {visible.length === 0 && (
          <p className="col-span-full p-2 text-sm text-muted-foreground">Kein Icon gefunden.</p>
        )}
      </div>
    </div>
  );
}
