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
import { CONFIG_ATTRIBUTE } from "./configuration-schema";
import { isStudioPage, uspEditorShell } from "./usp-editor-injector";
import { encodeConfigAttribute, parseConfig, parseConfigJson } from "./usp-model";

describe("uspEditorShell", () => {
  it("gibt dem Rahmen Namen, Vorschau, Status und Prüfung", () => {
    expect(uspEditorShell.widgetName).toBe("USP-Box");
    expect(uspEditorShell.title).toBe("Punkte bearbeiten");
    expect(uspEditorShell.preview).toBe(true);
    expect(uspEditorShell.help).toBeTruthy();
    expect(typeof uspEditorShell.statusText).toBe("function");
    expect(typeof uspEditorShell.validate).toBe("function");
  });
});

describe("Altbestand", () => {
  it("liest das bisherige Attribut und schreibt es inhaltsgleich zurück", () => {
    const legacy =
      '{"layout":"tiles","accent":"blue","showIcons":false,"builder":true,"eyebrow":"Zeile","heading":"Frage",' +
      '"items":[{"id":"x","title":"Eins","text":"Text","icon":"workshop"},{"id":"y","title":"Zwei"}]}';
    const config = parseConfig(legacy, { keepEmpty: true });
    const roundTrip = parseConfig(encodeConfigAttribute(config), { keepEmpty: true });

    expect(roundTrip).toEqual(config);
    expect(roundTrip).toEqual(parseConfigJson(legacy));
  });

  it("behält den Attributnamen", () => {
    expect(CONFIG_ATTRIBUTE).toBe("usp-config");
  });
});

describe("isStudioPage", () => {
  it("erkennt das Studio am Pfad", () => {
    expect(isStudioPage({ pathname: "/studio/x" } as Location)).toBe(true);
    expect(isStudioPage({ pathname: "/content/x" } as Location)).toBe(false);
  });
});
