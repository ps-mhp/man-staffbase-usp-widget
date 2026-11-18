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
 * Die Hilfe des USP-Editors in der Leiste des Rahmens. Tasten und den Satz
 * zu „Übernehmen“ ergänzt der Rahmen selbst; hier steht nur, was es nur in
 * diesem Widget gibt.
 */

import * as React from "react";

import { MAX_USP_ITEMS } from "./usp-model";

export const USP_EDITOR_HELP = (
  <ul className="flex list-disc flex-col gap-2 pl-5">
    <li>
      <strong>Punkte</strong> stehen links in der Reihenfolge der Box: am Griff ziehen oder über dem Formular nach
      oben und unten schieben. Höchstens {MAX_USP_ITEMS}.
    </li>
    <li>
      Je Punkt ein <strong>Stichwort</strong>, optional eine <strong>Erläuterung</strong> und ein{" "}
      <strong>Icon</strong> aus den MAN-Icons. Ein Punkt ohne Text wird nicht gezeigt; „Übernehmen“ nennt ihn.
    </li>
    <li>
      Rechts stehen unter <strong>Inhalt</strong> die Zeile darüber und die Überschrift, unter{" "}
      <strong>Gestaltung</strong> Layout, Akzent und Icons, unter <strong>Verhalten</strong> der Builder-Modus.
    </li>
    <li>Ein Wechsel des Layouts behält alle Texte.</li>
    <li>Desktop, Tablet und Mobil zeigen die Box so, wie sie auf der Seite steht.</li>
  </ul>
);
