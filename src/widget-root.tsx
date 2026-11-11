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

import React, { useMemo } from "react";

import { UspBox } from "./usp";
import { UspBuilder } from "./usp-builder";
import { parseConfig } from "./usp-model";

export interface UspWidgetProps {
  /** Das Attribut `config`, roh. */
  readonly config: unknown;
}

/** Was der Baustein rendert; eigene Datei, damit Tests `index.tsx` samt `defineBlock` nicht laden müssen. */
export function UspWidget({ config }: UspWidgetProps): React.ReactElement | null {
  const parsed = useMemo(() => parseConfig(config), [config]);
  // Der Schlüssel setzt die Leiste zurück, sobald die Redaktion speichert:
  // sonst zeigte sie weiter die Wahl zur alten Konfiguration.
  if (parsed.builder) return <UspBuilder key={String(config)} config={parsed} />;
  return <UspBox config={parsed} />;
}
