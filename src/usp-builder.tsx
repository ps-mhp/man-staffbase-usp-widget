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
 * Der Builder-Modus: über der Box eine Leiste, mit der Leser:innen
 * Gestaltung, Farbe und Symbole selbst umschalten und das Ergebnis sofort
 * sehen. Gedacht für Seiten, auf denen die Box vorgestellt oder abgestimmt
 * wird.
 *
 * Die Wahl lebt nur im Zustand dieser Ansicht: nichts wird gespeichert,
 * nichts erreicht andere Leser:innen. Ändert die Redaktion die Konfiguration,
 * beginnt die Leiste wieder bei ihr (`key` in `widget-root.tsx`).
 */

import React, { useState } from "react";

import { ACCENT_LABELS, LAYOUT_LABELS } from "./labels";
import { UspBox } from "./usp";
import { USP_ACCENTS, USP_LAYOUTS, UspAccent, UspConfig, UspLayout, hasContent } from "./usp-model";

interface OptionProps {
  pressed: boolean;
  onPress: () => void;
  testId: string;
  title?: string;
  children: React.ReactNode;
}

function Option({ pressed, onPress, testId, title, children }: OptionProps): React.ReactElement {
  return (
    <button
      type="button"
      className="man-usp-builder__option"
      aria-pressed={pressed}
      title={title}
      data-testid={testId}
      onClick={onPress}
    >
      {children}
    </button>
  );
}

export interface UspBuilderProps {
  config: UspConfig;
}

export function UspBuilder({ config }: UspBuilderProps): React.ReactElement | null {
  const [layout, setLayout] = useState<UspLayout>(config.layout);
  const [accent, setAccent] = useState<UspAccent>(config.accent);
  const [showIcons, setShowIcons] = useState(config.showIcons);

  if (!hasContent(config)) return null;

  const changed = layout !== config.layout || accent !== config.accent || showIcons !== config.showIcons;
  const reset = (): void => {
    setLayout(config.layout);
    setAccent(config.accent);
    setShowIcons(config.showIcons);
  };

  return (
    <div className="man-usp-builder" data-testid="usp-builder">
      <div className="man-usp-builder__bar" role="group" aria-label="Darstellung der Box ausprobieren">
        <div className="man-usp-builder__group" role="group" aria-labelledby="man-usp-builder-layout">
          <span className="man-usp-builder__legend" id="man-usp-builder-layout">
            Gestaltung
          </span>
          <div className="man-usp-builder__options">
            {USP_LAYOUTS.map((option) => (
              <Option
                key={option}
                pressed={layout === option}
                onPress={() => setLayout(option)}
                title={LAYOUT_LABELS[option].hint}
                testId={`usp-builder-layout-${option}`}
              >
                {LAYOUT_LABELS[option].title}
              </Option>
            ))}
          </div>
        </div>

        <div className="man-usp-builder__group" role="group" aria-labelledby="man-usp-builder-accent">
          <span className="man-usp-builder__legend" id="man-usp-builder-accent">
            Farbe
          </span>
          <div className="man-usp-builder__options">
            {USP_ACCENTS.map((option) => (
              <Option
                key={option}
                pressed={accent === option}
                onPress={() => setAccent(option)}
                testId={`usp-builder-accent-${option}`}
              >
                <span
                  className="man-usp-builder__swatch"
                  style={{ background: ACCENT_LABELS[option].swatch }}
                  aria-hidden="true"
                />
                {ACCENT_LABELS[option].title}
              </Option>
            ))}
          </div>
        </div>

        <div className="man-usp-builder__group" role="group" aria-labelledby="man-usp-builder-icons">
          <span className="man-usp-builder__legend" id="man-usp-builder-icons">
            Symbole
          </span>
          <div className="man-usp-builder__options">
            <Option pressed={showIcons} onPress={() => setShowIcons(true)} testId="usp-builder-icons-on">
              An
            </Option>
            <Option pressed={!showIcons} onPress={() => setShowIcons(false)} testId="usp-builder-icons-off">
              Aus
            </Option>
          </div>
        </div>

        <div className="man-usp-builder__footer">
          {/* Live-Region: wer per Tastatur umschaltet, hört, was jetzt gilt. */}
          <p className="man-usp-builder__note" aria-live="polite" data-testid="usp-builder-summary">
            Vorschau: {LAYOUT_LABELS[layout].title} · {ACCENT_LABELS[accent].title} · Symbole{" "}
            {showIcons ? "an" : "aus"}. Wird nicht gespeichert.
          </p>
          {changed && (
            <button
              type="button"
              className="man-usp-builder__reset"
              data-testid="usp-builder-reset"
              onClick={reset}
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </div>

      <UspBox config={{ ...config, layout, accent, showIcons }} />
    </div>
  );
}
