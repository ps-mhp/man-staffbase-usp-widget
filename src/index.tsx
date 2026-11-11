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

import { setPublicPathFromBundle } from "@shared/public-path";
// Muss vor jedem dynamischen `import()` laufen, damit nachgeladene Teile von
// dem CDN kommen, von dem das Bundle stammt, und nicht von der Wirtsseite.
setPublicPathFromBundle("usp-widget.js");

import React from "react";
import ReactDOM from "react-dom/client";

import { BlockFactory, BlockDefinition, ExternalBlockDefinition, BaseBlock } from "widget-sdk";
import { startWidget } from "@shared/dev-mode/start-widget";
import { getTranslationRegistry } from "@shared/translation/registry";
import { CONFIG_ATTRIBUTE, configurationSchema, uiSchema } from "./configuration-schema";
import { uspTranslationProvider } from "./translation-provider";
import { USP_WIDGET_TAG } from "./usp";
import { isStudioPage, startUspEditorInjector } from "./usp-editor-injector";
import { UspWidget } from "./widget-root";
import icon from "../resources/usp-widget.svg";
import pkg from "../package.json";

/** Die Attribute des Widgets; gespiegelt im Konfigurationsschema. */
const widgetAttributes: string[] = [CONFIG_ATTRIBUTE];

const factory: BlockFactory = (BaseBlockClass, _widgetApi) => {
  /** <usp-widget usp-config="b64:…"></usp-widget> */
  return class UspWidgetBlock extends BaseBlockClass implements BaseBlock {
    private _root: ReactDOM.Root | null = null;

    public renderBlock(container: HTMLElement): void {
      const attrs = this.parseAttributes<Record<string, unknown>>();
      this._root ??= ReactDOM.createRoot(container);
      this._root.render(<UspWidget config={attrs[CONFIG_ATTRIBUTE]} />);
    }

    public unmountBlock(_container: HTMLElement): void {
      this._root?.unmount();
      this._root = null;
    }

    public static get observedAttributes(): string[] {
      return widgetAttributes;
    }

    public attributeChangedCallback(...args: [string, string | undefined, string | undefined]): void {
      super.attributeChangedCallback.apply(this, args);
    }
  };
};

export const blockDefinition: BlockDefinition = {
  name: USP_WIDGET_TAG,
  factory: factory,
  attributes: widgetAttributes,
  blockLevel: "block",
  configurationSchema: configurationSchema,
  uiSchema: uiSchema,
  label: "USP-Box",
  iconUrl: icon,
};

const externalBlockDefinition: ExternalBlockDefinition = {
  blockDefinition,
  author: pkg.author,
  version: pkg.version,
};

// Die Abfrage lässt das Modul in Jest laden, wo es keine Wirtsseite gibt.
if (typeof window.defineBlock === "function") {
  void startWidget({
    name: USP_WIDGET_TAG,
    version: pkg.version,
    register: () => {
      getTranslationRegistry().register(uspTranslationProvider);
      window.defineBlock(externalBlockDefinition);
      // Nur im Studio: auf der veröffentlichten Seite darf kein Beobachter laufen.
      if (isStudioPage()) startUspEditorInjector();
    },
  });
}
