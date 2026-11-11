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

import { startFieldModalInjector } from "@shared/config-modal";
import { CONFIG_ATTRIBUTE } from "./configuration-schema";
import { UspConfig, encodeConfigAttribute, parseConfig } from "./usp-model";

// Erst im Studio nachgeladen: der Editor gehört nicht ins Bündel, das jede
// veröffentlichte Seite lädt.
const LazyUspEditor = React.lazy(() =>
  import("./editors/usp-editor").then((module) => ({ default: module.UspEditor })),
);

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
    // Der Editor zeichnet seinen eigenen Rahmen und seine Fußleiste.
    panelClassName: "p-0 overflow-hidden",
    render: (props) =>
      React.createElement(
        React.Suspense,
        { fallback: React.createElement("p", { className: "p-4" }, "Editor wird geladen …") },
        React.createElement(LazyUspEditor, props),
      ),
  });
}
