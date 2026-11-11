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
 * Die MAN-Symbolschrift als Rückfall.
 *
 * Im Normalfall liefert das Tenant-Theme `man-icon` selbst aus (man-theme,
 * `_icons-app.scss`), und die Box nimmt diese Schrift. Wo das Theme fehlt —
 * im Studio-Editor, auf einer fremden Instanz —, springt diese Kopie ein.
 * Sie steht im Dokument und nicht im Stylesheet der Box: ein `@font-face` in
 * einem Shadow Root übergeht Chrome, und die Box kann in einem stehen.
 *
 * Eigener Familienname, damit sie nie eine Theme-Fassung überdeckt.
 */

import manIconFont from "./fonts/man-icon.woff2";

export const FALLBACK_ICON_FAMILY = "man-usp-icon";

const STYLE_ID = "man-usp-icon-face";

export function ensureIconFontFace(doc: Document = document): void {
  if (doc.getElementById(STYLE_ID) !== null) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent =
    `@font-face{font-family:"${FALLBACK_ICON_FAMILY}";` +
    `src:url("${manIconFont}") format("woff2");font-weight:400;font-style:normal;font-display:block}`;
  doc.head.appendChild(style);
}
