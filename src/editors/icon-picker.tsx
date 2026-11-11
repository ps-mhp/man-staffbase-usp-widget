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
 * Die Auswahl eines Zeichens aus der MAN-Symbolschrift: ein Raster mit
 * Suche. Ein Raster statt einer Ausklappliste, weil ein Symbol am Bild
 * erkannt wird, nicht am Namen — und `<option>` die Symbolschrift nicht
 * zuverlässig darstellt.
 */

import * as React from "react";
import { ReactElement, useState } from "react";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { cn } from "@shared/ui/utils";

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = findManIcon(value);
  const visible = MAN_ICONS.filter((icon) => matches(icon, query));

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid={`${testId}-toggle`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {current !== undefined ? (
            <>
              <Glyph icon={current} className="text-lg" />
              {current.label}
            </>
          ) : (
            "Symbol wählen"
          )}
        </Button>
        {current !== undefined && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid={`${testId}-clear`}
            onClick={() => onChange(undefined)}
          >
            Entfernen
          </Button>
        )}
      </div>

      {open && (
        <div className="grid gap-2 rounded-md border p-2">
          <Input
            type="search"
            placeholder="Suchen, z. B. Lkw, Kalender …"
            aria-label="Symbol suchen"
            data-testid={`${testId}-search`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div
            role="listbox"
            aria-label="Symbole"
            className="grid max-h-56 grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1 overflow-y-auto"
          >
            {visible.map((icon) => (
              <button
                key={icon.name}
                type="button"
                role="option"
                aria-selected={icon.name === value}
                title={icon.label}
                aria-label={icon.label}
                data-testid={`${testId}-option-${icon.name}`}
                className={cn(
                  "grid h-11 place-items-center rounded-md border text-2xl outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  icon.name === value && "border-primary bg-accent",
                )}
                onClick={() => {
                  onChange(icon.name);
                  setOpen(false);
                }}
              >
                <Glyph icon={icon} />
              </button>
            ))}
            {visible.length === 0 && (
              <p className="col-span-full p-2 text-sm text-muted-foreground">Kein Symbol gefunden.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
