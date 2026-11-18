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

import * as React from "react";

import { BadgeCheck } from "lucide-react";

import { FieldModalShellOptions, startFieldModalInjector } from "@shared/config-modal";
import { CONFIG_ATTRIBUTE } from "./configuration-schema";
import { USP_EDITOR_HELP } from "./usp-editor-help";
import { uspChangesStatus, validateUsp } from "./usp-editor-status";
import { UspConfig, encodeConfigAttribute, parseConfig } from "./usp-model";

// Erst im Studio nachgeladen: der Editor gehört nicht ins Bündel, das jede
// veröffentlichte Seite lädt.
const LazyUspEditor = React.lazy(() =>
  import("./editors/usp-editor").then((module) => ({ default: module.UspEditor })),
);

const LOADING = React.createElement(
  "p",
  { className: "p-6 text-sm text-muted-foreground" },
  "Editor wird geladen …",
);

/** Was der gemeinsame Rahmen von der USP-Box wissen muss. Offengelegt für Tests. */
export const uspEditorShell: FieldModalShellOptions<UspConfig> = {
  widgetName: "USP-Box",
  title: "Punkte bearbeiten",
  icon: BadgeCheck,
  preview: true,
  help: USP_EDITOR_HELP,
  statusText: uspChangesStatus,
  validate: validateUsp,
};

/** Läuft die Seite im Studio — und nicht als veröffentlichte Seite? */
export function isStudioPage(location: Location = window.location): boolean {
  return location.pathname.startsWith("/studio/");
}

/**
 * Wartet auf den Konfigurationsdialog der Box und setzt den Editor an die
 * Stelle des Feldes `config`.
 *
 * @param root der zu beobachtende Teilbaum; standardmäßig das Dokument.
 * @returns eine Funktion, die die Beobachtung beendet und den Editor abbaut.
 */
export function startUspEditorInjector(root: ParentNode = document): () => void {
  return startFieldModalInjector<UspConfig>({
    fieldKey: CONFIG_ATTRIBUTE,
    root,
    reopenLabel: "USP-Box bearbeiten",
    modalTestId: "usp-editor-modal",
    reopenTestId: "usp-editor-reopen",
    // Ein frisch angelegter Punkt ist leer; der strenge Leser verwürfe ihn.
    parse: (raw) => parseConfig(raw, { keepEmpty: true }),
    serialize: encodeConfigAttribute,
    // Kopf, Übernehmen, Rückgängig, Hilfe und Rückfrage zeichnet der Rahmen.
    shell: uspEditorShell,
    render: ({ value, onChange }) =>
      React.createElement(React.Suspense, { fallback: LOADING }, React.createElement(LazyUspEditor, { value, onChange })),
  });
}
