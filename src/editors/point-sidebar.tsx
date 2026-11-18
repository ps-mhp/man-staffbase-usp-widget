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
 * Die linke Spalte des USP-Editors: alle Punkte in der Reihenfolge der Box,
 * „Neuer Punkt“ und Sortieren per Ziehen. Jede Zeile wie im Screen: das Icon
 * des Punkts, das Stichwort und „Icon Schild“.
 */

import * as React from "react";
import { ReactElement } from "react";
import { Minus } from "lucide-react";
import { useConfigShell } from "@man/config-ui/shell/shell-context";
import { ItemList, type ListItem } from "@man/config-ui/sidebar/item-list";
import { SidebarPanel } from "@man/config-ui/sidebar/sidebar-panel";

import { findManIcon } from "../man-icons";
import { MAX_USP_ITEMS, UspItem } from "../usp-model";
import { Glyph } from "./icon-picker";

export interface PointSidebarProps {
  items: readonly UspItem[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onReorder: (ids: string[]) => void;
}

const EMPTY_STATE = (
  <>
    Noch kein Punkt. Lege über <strong>Neuer Punkt</strong> den ersten an.
  </>
);

function Thumb({ name }: { name: string | undefined }): ReactElement {
  const icon = findManIcon(name);
  return icon === undefined ? (
    <Minus className="size-4 text-muted-foreground" aria-hidden />
  ) : (
    <Glyph icon={icon} className="text-xl text-foreground" />
  );
}

function listItems(items: readonly UspItem[], issuesVisible: boolean): ListItem[] {
  return items.map((item) => {
    const icon = findManIcon(item.icon);
    const empty = item.title.trim() === "" && (item.text ?? "").trim() === "";
    return {
      id: item.id,
      label: item.title.trim() === "" ? (item.text ?? "Neuer Punkt") : item.title,
      description: icon === undefined ? "Ohne Icon" : `Icon ${icon.label}`,
      thumbnail: <Thumb name={item.icon} />,
      invalid: issuesVisible && empty,
    };
  });
}

export function PointSidebar({ items, selectedId, onSelect, onAdd, onReorder }: PointSidebarProps): ReactElement {
  const { issuesVisible } = useConfigShell();
  return (
    <SidebarPanel title="Punkte" count={items.length} max={MAX_USP_ITEMS} addLabel="Neuer Punkt" onAdd={onAdd}>
      <ItemList
        aria-label="Punkte"
        items={listItems(items, issuesVisible)}
        selectedId={selectedId}
        onSelect={onSelect}
        onReorder={onReorder}
        emptyState={EMPTY_STATE}
      />
    </SidebarPanel>
  );
}
