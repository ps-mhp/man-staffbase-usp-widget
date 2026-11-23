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
import { render, screen } from "@testing-library/react";

import { UspBox, itemIconName } from "./usp";
import { UspConfig, emptyConfig } from "./usp-model";

const config = (changes: Partial<UspConfig> = {}): UspConfig => ({
  ...emptyConfig(),
  heading: "Was bringt's dem Kunden?",
  items: [
    { id: "a", title: "Neues Styling", text: "Im MAN Design", icon: "truck" },
    { id: "b", title: "Aerodynamik" },
  ],
  ...changes,
});

describe("UspBox", () => {
  it("zeigt ohne Punkte nichts", () => {
    const { container } = render(<UspBox config={config({ items: [] })} />);
    expect(container.querySelector(".man-usp")).toBeNull();
  });

  it("zeigt Kopf und Punkte in Reihenfolge", () => {
    render(<UspBox config={config({ eyebrow: "Kundennutzen" })} />);

    expect(screen.getByRole("heading", { name: "Was bringt's dem Kunden?" })).toBeInTheDocument();
    expect(screen.getByText("Kundennutzen")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("Neues Styling"),
      expect.stringContaining("Aerodynamik"),
    ]);
  });

  it("trägt Gestaltung und Akzentfarbe am Element", () => {
    render(<UspBox config={config({ layout: "band", accent: "blue" })} />);
    const box = screen.getByTestId("usp-box");

    expect(box).toHaveClass("man-usp", "man-usp--band");
    expect(box).toHaveAttribute("data-accent", "blue");
  });

  it("zeigt Symbole schmückend und nur, wo eines gewählt ist", () => {
    const { container } = render(<UspBox config={config()} />);
    const marks = container.querySelectorAll(".man-usp__mark");

    expect(marks).toHaveLength(1);
    expect(marks[0]).toHaveAttribute("aria-hidden", "true");
    expect(marks[0]!.textContent).toBe(String.fromCodePoint(0xe947));
  });

  it("blendet Symbole aus, wenn sie abgeschaltet sind", () => {
    const { container } = render(<UspBox config={config({ showIcons: false })} />);
    expect(container.querySelector(".man-usp__mark")).toBeNull();
  });
});

describe("UspBox – Häkchen mit Kopflinie", () => {
  it("zeigt das Zeichen über der Frage und Häkchen vor den Punkten", () => {
    const { container } = render(<UspBox config={config({ layout: "checkline", headIcon: "usermanagement" })} />);
    const box = container.querySelector(".man-usp")!;
    expect(box).toHaveClass("man-usp--checkline");
    const head = box.querySelector(".man-usp__head")!;
    expect(head.firstElementChild).toHaveClass("man-usp__head-mark");
    expect(head.querySelector(".man-usp__head-mark")).toHaveAttribute("aria-hidden", "true");
    // Jeder Punkt trägt ein Zeichen, der ohne eigenes das Häkchen.
    expect(box.querySelectorAll(".man-usp__item .man-usp__mark")).toHaveLength(2);
  });

  it("blendet das Zeichen über der Frage mit „Icons aus“ und in anderen Gestaltungen aus", () => {
    const off = render(<UspBox config={config({ layout: "checkline", headIcon: "usermanagement", showIcons: false })} />);
    expect(off.container.querySelector(".man-usp__head-mark")).toBeNull();
    off.unmount();
    const other = render(<UspBox config={config({ layout: "checklist", headIcon: "usermanagement" })} />);
    expect(other.container.querySelector(".man-usp__head-mark")).toBeNull();
  });
});

describe("itemIconName", () => {
  const item = { id: "a", title: "X" };

  it("setzt in der Häkchenliste immer ein Zeichen, notfalls das Häkchen", () => {
    expect(itemIconName(item, config({ layout: "checklist" }))).toBe("checkmark");
    expect(itemIconName({ ...item, icon: "truck" }, config({ layout: "checklist" }))).toBe("truck");
    expect(itemIconName({ ...item, icon: "truck" }, config({ layout: "checklist", showIcons: false }))).toBe(
      "checkmark",
    );
  });

  it("setzt auch bei „Häkchen mit Kopflinie“ immer ein Zeichen", () => {
    expect(itemIconName(item, config({ layout: "checkline" }))).toBe("checkmark");
    expect(itemIconName({ ...item, icon: "truck" }, config({ layout: "checkline", showIcons: false }))).toBe("checkmark");
  });

  it("zeigt sonst nur gewählte Zeichen", () => {
    expect(itemIconName(item, config())).toBeUndefined();
    expect(itemIconName({ ...item, icon: "mail" }, config({ showIcons: false }))).toBeUndefined();
  });
});
