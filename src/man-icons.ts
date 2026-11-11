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
 * Die Zeichen der MAN-Symbolschrift `man-icon`.
 *
 * Abgeschrieben aus `man-theme/src/01-foundation/_icons-app.scss`
 * (`$man-icons`, wertegleich zu man.eu). Gespeichert wird der Name, nicht der
 * Codepoint: ändert sich die Schrift, bleibt der Name die stabile Angabe.
 *
 * Einige Namen teilen sich einen Codepoint (`accordion` und `minus`); das
 * stammt so aus der Vorlage.
 */

export interface ManIcon {
  name: string;
  codepoint: number;
  label: string;
}

export const MAN_ICONS: readonly ManIcon[] = [
  { name: "accordion", codepoint: 0xe91b, label: "Akkordeon" },
  { name: "arrow-full", codepoint: 0xe938, label: "Pfeil gefüllt" },
  { name: "arrow-line", codepoint: 0xe93a, label: "Pfeil" },
  { name: "arrow-line-thin", codepoint: 0xe939, label: "Pfeil schmal" },
  { name: "arrow-line-thin-left", codepoint: 0xe953, label: "Pfeil schmal links" },
  { name: "bus", codepoint: 0xe941, label: "Bus" },
  { name: "bus-konfigurator", codepoint: 0xe95b, label: "Bus-Konfigurator" },
  { name: "bus-sideview-1", codepoint: 0xe93f, label: "Bus seitlich 1" },
  { name: "bus-sideview-2", codepoint: 0xe940, label: "Bus seitlich 2" },
  { name: "calendar", codepoint: 0xe901, label: "Kalender" },
  { name: "camera", codepoint: 0xe955, label: "Kamera" },
  { name: "cart", codepoint: 0xe902, label: "Warenkorb" },
  { name: "checkmark", codepoint: 0xe903, label: "Häkchen" },
  { name: "client-business", codepoint: 0xe904, label: "Geschäftskunde" },
  { name: "close", codepoint: 0xe905, label: "Schließen" },
  { name: "crosshair", codepoint: 0xe906, label: "Fadenkreuz" },
  { name: "doc-office", codepoint: 0xe934, label: "Office-Dokument" },
  { name: "doc-original", codepoint: 0xe935, label: "Dokument" },
  { name: "doc-pdf", codepoint: 0xe936, label: "PDF" },
  { name: "doc-web", codepoint: 0xe937, label: "Webdokument" },
  { name: "download", codepoint: 0xe907, label: "Herunterladen" },
  { name: "edit", codepoint: 0xe908, label: "Bearbeiten" },
  { name: "eye", codepoint: 0xe909, label: "Auge" },
  { name: "facebook", codepoint: 0xe94a, label: "Facebook" },
  { name: "favorite-filled", codepoint: 0xe90a, label: "Favorit gefüllt" },
  { name: "favorite-outline", codepoint: 0xe90b, label: "Favorit" },
  { name: "fax", codepoint: 0xe90c, label: "Fax" },
  { name: "filter", codepoint: 0xe90e, label: "Filter" },
  { name: "filter-list", codepoint: 0xe90d, label: "Filterliste" },
  { name: "flickr", codepoint: 0xe94b, label: "Flickr" },
  { name: "folder", codepoint: 0xe90f, label: "Ordner" },
  { name: "globe", codepoint: 0xe910, label: "Globus" },
  { name: "image", codepoint: 0xe911, label: "Bild" },
  { name: "index", codepoint: 0xe954, label: "Index" },
  { name: "industry-motor", codepoint: 0xe942, label: "Industriemotor" },
  { name: "info", codepoint: 0xe912, label: "Information" },
  { name: "instagram", codepoint: 0xe94c, label: "Instagram" },
  { name: "karriere", codepoint: 0xe95d, label: "Karriere" },
  { name: "language", codepoint: 0xe913, label: "Sprache" },
  { name: "level", codepoint: 0xe914, label: "Ebene" },
  { name: "linkedin", codepoint: 0xe94d, label: "LinkedIn" },
  { name: "list", codepoint: 0xe915, label: "Liste" },
  { name: "list-compare", codepoint: 0xe95a, label: "Vergleich" },
  { name: "location", codepoint: 0xe916, label: "Standort" },
  { name: "mail", codepoint: 0xe917, label: "E-Mail" },
  { name: "maximize", codepoint: 0xe918, label: "Maximieren" },
  { name: "menue", codepoint: 0xe919, label: "Menü" },
  { name: "microphone", codepoint: 0xe91a, label: "Mikrofon" },
  { name: "minus", codepoint: 0xe91b, label: "Minus" },
  { name: "mobile24", codepoint: 0xe943, label: "Mobil 24" },
  { name: "ok", codepoint: 0xe959, label: "OK" },
  { name: "open", codepoint: 0xe91c, label: "Öffnen" },
  { name: "overlay-360", codepoint: 0xe93c, label: "360°" },
  { name: "overlay-play", codepoint: 0xe93d, label: "Abspielen" },
  { name: "overlay-replay", codepoint: 0xe93e, label: "Wiederholen" },
  { name: "overlay-turntable", codepoint: 0xe956, label: "Drehteller" },
  { name: "panorama", codepoint: 0xe957, label: "Panorama" },
  { name: "phone", codepoint: 0xe91d, label: "Telefon" },
  { name: "pin", codepoint: 0xe91e, label: "Stecknadel" },
  { name: "placeholder", codepoint: 0xe900, label: "Platzhalter" },
  { name: "plus", codepoint: 0xe91f, label: "Plus" },
  { name: "print", codepoint: 0xe920, label: "Drucken" },
  { name: "quote-end", codepoint: 0xe921, label: "Zitat Ende" },
  { name: "quote-start", codepoint: 0xe922, label: "Zitat Anfang" },
  { name: "reset", codepoint: 0xe923, label: "Zurücksetzen" },
  { name: "result", codepoint: 0xe924, label: "Ergebnis" },
  { name: "rss", codepoint: 0xe925, label: "RSS" },
  { name: "search", codepoint: 0xe927, label: "Suche" },
  { name: "search-save", codepoint: 0xe926, label: "Suche speichern" },
  { name: "services", codepoint: 0xe928, label: "Services" },
  { name: "share", codepoint: 0xe929, label: "Teilen" },
  { name: "sign-out", codepoint: 0xe92a, label: "Abmelden" },
  { name: "stopwatch", codepoint: 0xe92b, label: "Stoppuhr" },
  { name: "thumb", codepoint: 0xe92c, label: "Daumen" },
  { name: "trailer", codepoint: 0xe944, label: "Anhänger" },
  { name: "trash", codepoint: 0xe92d, label: "Papierkorb" },
  { name: "truck", codepoint: 0xe947, label: "Lkw" },
  { name: "truck-konfigurator", codepoint: 0xe95c, label: "Lkw-Konfigurator" },
  { name: "truck-sideview-1", codepoint: 0xe945, label: "Lkw seitlich 1" },
  { name: "truck-sideview-2", codepoint: 0xe946, label: "Lkw seitlich 2" },
  { name: "turn-left", codepoint: 0xe92e, label: "Links abbiegen" },
  { name: "twitter", codepoint: 0xe94e, label: "Twitter" },
  { name: "usermanagement", codepoint: 0xe92f, label: "Benutzer" },
  { name: "van", codepoint: 0xe949, label: "Transporter" },
  { name: "van-konfigurator", codepoint: 0xe964, label: "Transporter-Konfigurator" },
  { name: "van-sideview-1", codepoint: 0xe948, label: "Transporter seitlich" },
  { name: "vk", codepoint: 0xe958, label: "VK" },
  { name: "whatsapp", codepoint: 0xe94f, label: "WhatsApp" },
  { name: "workshop", codepoint: 0xe930, label: "Werkstatt" },
  { name: "xing", codepoint: 0xe950, label: "Xing" },
  { name: "youtube-1", codepoint: 0xe951, label: "YouTube 1" },
  { name: "youtube-2", codepoint: 0xe952, label: "YouTube 2" },
  { name: "zoom-in", codepoint: 0xe931, label: "Vergrößern" },
  { name: "zoom-out", codepoint: 0xe932, label: "Verkleinern" },
];

const BY_NAME = new Map(MAN_ICONS.map((icon) => [icon.name, icon]));

export function findManIcon(name: string | undefined): ManIcon | undefined {
  return name === undefined ? undefined : BY_NAME.get(name);
}

/** Das Zeichen als Text, wie es in die Symbolschrift gehört. */
export function manIconGlyph(icon: ManIcon): string {
  return String.fromCodePoint(icon.codepoint);
}
