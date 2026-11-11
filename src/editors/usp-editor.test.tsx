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

import { UspConfig, emptyConfig } from "../usp-model";
import { UspEditor, moveItem } from "./usp-editor";

interface Harness {
  latest: () => UspConfig;
  onSave: jest.Mock;
}

const setup = (initial: UspConfig, dirty = false): Harness => {
  const onChange = jest.fn<void, [UspConfig]>();
  const onSave = jest.fn();

  function Live(): React.ReactElement {
    const [value, setValue] = React.useState(initial);
    return (
      <UspEditor
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
        onSave={onSave}
        onClose={jest.fn()}
        dirty={dirty}
      />
    );
  }

  render(<Live />);
  return { latest: () => onChange.mock.calls[onChange.mock.calls.length - 1]![0], onSave };
};

const withItems = (): UspConfig => ({
  ...emptyConfig(),
  heading: "Was bringt's?",
  items: [
    { id: "a", title: "Eins" },
    { id: "b", title: "Zwei" },
  ],
});

describe("UspEditor", () => {
  it("bietet alle sieben Gestaltungen und wählt eine", () => {
    const h = setup(withItems());
    expect(screen.getAllByRole("radio").filter((el) => el.dataset.testid?.startsWith("usp-layout-"))).toHaveLength(7);

    fireEvent.click(screen.getByTestId("usp-layout-sidepanel"));

    expect(h.latest().layout).toBe("sidepanel");
    expect(screen.getByTestId("usp-layout-sidepanel")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("usp-box")).toHaveClass("man-usp--sidepanel");
  });

  it("wechselt die Akzentfarbe", () => {
    const h = setup(withItems());
    fireEvent.click(screen.getByTestId("usp-accent-blue"));

    expect(h.latest().accent).toBe("blue");
    expect(screen.getByTestId("usp-box")).toHaveAttribute("data-accent", "blue");
  });

  it("schaltet Symbole ab", () => {
    const h = setup(withItems());
    fireEvent.click(screen.getByTestId("usp-show-icons"));

    expect(h.latest().showIcons).toBe(false);
  });

  it("schaltet den Builder-Modus ein", () => {
    const h = setup(withItems());
    fireEvent.click(screen.getByTestId("usp-builder-toggle"));

    expect(h.latest().builder).toBe(true);
  });

  it("legt einen Punkt an und füllt ihn", () => {
    const h = setup(emptyConfig());
    expect(screen.getByText(/Noch keine Punkte/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("usp-item-add"));
    fireEvent.change(screen.getByTestId("usp-item-0-title"), { target: { value: "Aerodynamik" } });
    fireEvent.change(screen.getByTestId("usp-item-0-text"), { target: { value: "Verbessert" } });

    expect(h.latest().items).toEqual([{ id: expect.any(String), title: "Aerodynamik", text: "Verbessert" }]);
  });

  it("wählt ein Symbol über die Suche und entfernt es wieder", () => {
    const h = setup(withItems());
    fireEvent.click(screen.getByTestId("usp-item-0-icon-toggle"));
    fireEvent.change(screen.getByTestId("usp-item-0-icon-search"), { target: { value: "lkw" } });

    expect(screen.queryByTestId("usp-item-0-icon-option-mail")).toBeNull();
    fireEvent.click(screen.getByTestId("usp-item-0-icon-option-truck"));
    expect(h.latest().items[0]!.icon).toBe("truck");

    fireEvent.click(screen.getByTestId("usp-item-0-icon-clear"));
    expect(h.latest().items[0]!.icon).toBeUndefined();
  });

  it("sortiert und entfernt Punkte", () => {
    const h = setup(withItems());
    expect(screen.getByTestId("usp-item-0-up")).toBeDisabled();

    fireEvent.click(screen.getByTestId("usp-item-1-up"));
    expect(h.latest().items.map((item) => item.title)).toEqual(["Zwei", "Eins"]);

    fireEvent.click(screen.getByTestId("usp-item-0-remove"));
    expect(h.latest().items.map((item) => item.title)).toEqual(["Eins"]);
  });

  it("übernimmt nur mit Änderungen", () => {
    setup(withItems(), false);
    expect(screen.getByTestId("usp-save")).toBeDisabled();
  });

  it("übernimmt auf Knopfdruck", () => {
    const h = setup(withItems(), true);
    fireEvent.click(screen.getByTestId("usp-save"));
    expect(h.onSave).toHaveBeenCalled();
  });
});

describe("moveItem", () => {
  it("lässt die Liste an den Rändern, wie sie ist", () => {
    const items = [{ id: "a", title: "A" }];
    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 0, 1)).toBe(items);
  });
});
