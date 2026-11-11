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
import { fireEvent, render, screen } from "@testing-library/react";

import { UspConfig, emptyConfig, encodeConfigAttribute } from "./usp-model";
import { UspWidget } from "./widget-root";

const config = (changes: Partial<UspConfig> = {}): UspConfig => ({
  ...emptyConfig(),
  builder: true,
  heading: "Was bringt's dem Kunden?",
  items: [{ id: "a", title: "Aerodynamik", icon: "truck" }],
  ...changes,
});

const renderWidget = (value: UspConfig): ReturnType<typeof render> =>
  render(<UspWidget config={encodeConfigAttribute(value)} />);

describe("Builder-Modus", () => {
  it("zeigt ohne Builder-Modus keine Leiste", () => {
    renderWidget(config({ builder: false }));

    expect(screen.queryByTestId("usp-builder")).toBeNull();
    expect(screen.getByTestId("usp-box")).toBeInTheDocument();
  });

  it("beginnt bei der gespeicherten Wahl", () => {
    renderWidget(config({ layout: "band", accent: "grey" }));

    expect(screen.getByTestId("usp-builder-layout-band")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("usp-builder-accent-grey")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByTestId("usp-builder-reset")).toBeNull();
  });

  it("schaltet Gestaltung, Farbe und Symbole in Echtzeit um", () => {
    const { container } = renderWidget(config());
    fireEvent.click(screen.getByTestId("usp-builder-layout-sidepanel"));
    fireEvent.click(screen.getByTestId("usp-builder-accent-blue"));
    fireEvent.click(screen.getByTestId("usp-builder-icons-off"));

    const box = screen.getByTestId("usp-box");
    expect(box).toHaveClass("man-usp--sidepanel");
    expect(box).toHaveAttribute("data-accent", "blue");
    expect(container.querySelector(".man-usp__mark")).toBeNull();
    expect(screen.getByTestId("usp-builder-summary")).toHaveTextContent("Farbspalte · Blau · Symbole aus");
  });

  it("setzt auf die gespeicherte Wahl zurück", () => {
    renderWidget(config());
    fireEvent.click(screen.getByTestId("usp-builder-layout-tiles"));
    fireEvent.click(screen.getByTestId("usp-builder-reset"));

    expect(screen.getByTestId("usp-box")).toHaveClass("man-usp--split");
    expect(screen.queryByTestId("usp-builder-reset")).toBeNull();
  });

  it("beginnt neu, wenn die Redaktion die Konfiguration ändert", () => {
    const { rerender } = renderWidget(config());
    fireEvent.click(screen.getByTestId("usp-builder-layout-tiles"));
    rerender(<UspWidget config={encodeConfigAttribute(config({ layout: "band" }))} />);

    expect(screen.getByTestId("usp-box")).toHaveClass("man-usp--band");
  });

  it("zeigt ohne Punkte auch keine Leiste", () => {
    renderWidget(config({ items: [] }));
    expect(screen.queryByTestId("usp-builder")).toBeNull();
  });
});
