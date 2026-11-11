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
 * Die USP-Box.
 *
 * Ein Markup für alle sieben Gestaltungen: Kopf (Zeile darüber, Überschrift)
 * und eine Liste von Punkten (Zeichen, Stichwort, Erläuterung). Was daraus
 * Kacheln, Leiste oder Farbspalte macht, steht allein im Stylesheet unter
 * `man-usp--<layout>`. So kann die Redaktion die Gestaltung wechseln, ohne
 * dass ein Inhalt verloren geht.
 */

import React, { useEffect } from "react";

import { useHotStyle } from "@shared/hot-style";
import { ensureIconFontFace } from "./icon-font";
import { findManIcon, manIconGlyph } from "./man-icons";
import { UspConfig, UspItem, UspLayout, hasContent } from "./usp-model";
import uspCss from "./styles/usp.scss";

export const USP_WIDGET_TAG = "usp-widget";

/** Das Häkchen der Gestaltung `checklist`, wenn ein Punkt kein eigenes Zeichen trägt. */
const CHECKMARK = "checkmark";

/** Ausgeschrieben, damit jede Klasse im Quelltext auffindbar bleibt. */
const LAYOUT_CLASS: Record<UspLayout, string> = {
  split: "man-usp--split",
  tiles: "man-usp--tiles",
  checklist: "man-usp--checklist",
  linebar: "man-usp--linebar",
  sidepanel: "man-usp--sidepanel",
  band: "man-usp--band",
  headbar: "man-usp--headbar",
};

/** Welches Zeichen vor einem Punkt steht — oder keins. */
export function itemIconName(item: UspItem, config: UspConfig): string | undefined {
  // Die Häkchenliste lebt vom Zeichen; ohne es wäre sie eine nackte Liste.
  if (config.layout === "checklist") return config.showIcons ? (item.icon ?? CHECKMARK) : CHECKMARK;
  return config.showIcons ? item.icon : undefined;
}

function ItemMark({ name }: { name: string | undefined }): React.ReactElement | null {
  const icon = findManIcon(name);
  if (icon === undefined) return null;
  // Schmückend: Bedeutung trägt das Stichwort daneben.
  return (
    <span className="man-usp__mark" aria-hidden="true">
      <span className="man-usp__icon">{manIconGlyph(icon)}</span>
    </span>
  );
}

export interface UspBoxProps {
  config: UspConfig;
}

export function UspBox({ config }: UspBoxProps): React.ReactElement | null {
  const liveCss = useHotStyle(uspCss, USP_WIDGET_TAG, "styles/usp.scss");

  useEffect(() => {
    if (config.showIcons || config.layout === "checklist") ensureIconFontFace();
  }, [config.showIcons, config.layout]);

  if (!hasContent(config)) return null;

  const heading = config.heading.trim();
  const eyebrow = config.eyebrow?.trim() ?? "";

  return (
    <section
      className={`man-usp ${LAYOUT_CLASS[config.layout]}`}
      data-accent={config.accent}
      data-testid="usp-box"
    >
      <style>{liveCss}</style>
      {(heading !== "" || eyebrow !== "") && (
        <div className="man-usp__head">
          {eyebrow !== "" && <p className="man-usp__eyebrow">{eyebrow}</p>}
          {heading !== "" && <h3 className="man-usp__heading">{heading}</h3>}
        </div>
      )}
      <ul className="man-usp__list">
        {config.items.map((item) => (
          <li className="man-usp__item" key={item.id}>
            <ItemMark name={itemIconName(item, config)} />
            <span className="man-usp__point">
              {item.title !== "" && <strong className="man-usp__title">{item.title}</strong>}
              {item.text !== undefined && <span className="man-usp__text">{item.text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
