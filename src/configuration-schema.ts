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

import { UiSchema } from "@rjsf/utils";
import { JSONSchema7 } from "json-schema";

/** Das eine Attribut der Box: Gestaltung, Farbe, Kopf und Punkte (siehe `usp-model.ts`). */
export const CONFIG_ATTRIBUTE = "config";

/**
 * Das Schema des Konfigurationsdialogs.
 *
 * `config` steht als gewöhnliches Textfeld; im Studio setzt
 * `usp-editor-injector.ts` den eigenen Editor an seine Stelle. Erscheint er
 * einmal nicht, bleibt das Textfeld als Rückfallweg (JSON).
 *
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/
 */
export const configurationSchema: JSONSchema7 = {
  properties: {
    [CONFIG_ATTRIBUTE]: {
      type: "string",
      title: "USP-Box",
      default: "",
    },
  },
};

/**
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema
 */
export const uiSchema: UiSchema = {
  [CONFIG_ATTRIBUTE]: {
    "ui:widget": "textarea",
    "ui:help":
      "Normalerweise steht hier der Editor der USP-Box. Erscheint er nicht, " +
      "lässt sich die Box als JSON pflegen, z. B. " +
      '{"layout":"split","accent":"red","heading":"Was bringt\'s dem Kunden?",' +
      '"items":[{"title":"Aerodynamik","text":"Verbessert","icon":"checkmark"}]}',
  },
};
