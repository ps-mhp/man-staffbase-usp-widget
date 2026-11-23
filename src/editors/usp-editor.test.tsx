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
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigShellProvider, type ConfigShellState } from "@man/config-ui";

import { UspConfig, emptyConfig } from "../usp-model";
import { UspEditor, moveItem, orderItems } from "./usp-editor";

interface Harness {
  latest: () => UspConfig;
}

const shellState = (overrides: Partial<ConfigShellState> = {}): ConfigShellState => ({
  view: "editor",
  setView: () => undefined,
  preview: true,
  issuesVisible: false,
  ...overrides,
});

const setup = (initial: UspConfig, shell: Partial<ConfigShellState> = {}): Harness => {
  const onChange = jest.fn<void, [UspConfig]>();

  function Live(): React.ReactElement {
    const [value, setValue] = React.useState(initial);
    return (
      <ConfigShellProvider value={shellState(shell)}>
        <UspEditor
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      </ConfigShellProvider>
    );
  }

  render(<Live />);
  return { latest: () => onChange.mock.calls[onChange.mock.calls.length - 1]![0] };
};

const withItems = (): UspConfig => ({
  ...emptyConfig(),
  heading: "Was bringt's?",
  items: [
    { id: "a", title: "Eins" },
    { id: "b", title: "Zwei", icon: "workshop" },
  ],
});

const openTab = async (name: string): Promise<void> => {
  await userEvent.click(screen.getByRole("tab", { name }));
};

describe("UspEditor", () => {
  it("zeigt Punkte links und die Felder des ersten rechts daneben", () => {
    setup(withItems());
    const list = screen.getByRole("grid", { name: "Punkte" });
    expect(within(list).getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Punkt 1 von 2")).toBeInTheDocument();
    expect(screen.getByTestId("usp-item-0-title")).toHaveValue("Eins");
    expect(screen.getByText("2 von 8")).toBeInTheDocument();
  });

  it("wählt einen anderen Punkt über die Liste", async () => {
    setup(withItems());
    await userEvent.click(screen.getByText("Zwei"));
    expect(screen.getByText("Punkt 2 von 2")).toBeInTheDocument();
    expect(screen.getByTestId("usp-item-1-title")).toHaveValue("Zwei");
  });

  it("bietet alle acht Layouts und wählt eines", async () => {
    const h = setup(withItems());
    await openTab("Gestaltung");
    expect(screen.getAllByTestId(/^usp-layout-/)).toHaveLength(8);

    await userEvent.click(screen.getByTestId("usp-layout-sidepanel"));

    expect(h.latest().layout).toBe("sidepanel");
    expect(screen.getByTestId("usp-layout-sidepanel")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("usp-layout-split")).toHaveAttribute("aria-pressed", "false");
  });

  it("wechselt den Akzent über die Pills", async () => {
    const h = setup(withItems());
    await openTab("Gestaltung");
    await userEvent.click(screen.getByRole("radio", { name: "Blau" }));
    expect(h.latest().accent).toBe("blue");
  });

  it("schaltet Icons ab", async () => {
    const h = setup(withItems());
    await openTab("Gestaltung");
    await userEvent.click(screen.getByTestId("usp-show-icons"));
    expect(h.latest().showIcons).toBe(false);
  });

  it("schaltet den Builder-Modus unter Verhalten ein", async () => {
    const h = setup(withItems());
    await openTab("Verhalten");
    await userEvent.click(screen.getByTestId("usp-builder-toggle"));
    expect(h.latest().builder).toBe(true);
  });

  it("bietet bei „Häkchen mit Kopflinie“ das Zeichen über der Überschrift an", async () => {
    const h = setup(withItems());
    await userEvent.click(screen.getByRole("tab", { name: "Inhalt" }));
    expect(screen.queryByTestId("usp-head-icon")).toBeNull();

    await openTab("Gestaltung");
    await userEvent.click(screen.getByTestId("usp-layout-checkline"));
    await userEvent.click(screen.getByRole("tab", { name: "Inhalt" }));
    const picker = screen.getByTestId("usp-head-icon");
    await userEvent.click(within(picker).getByRole("button", { name: "Benutzer" }));
    expect(h.latest().headIcon).toBe("usermanagement");

    await userEvent.click(within(picker).getByRole("button", { name: "Kein Icon" }));
    expect(h.latest()).not.toHaveProperty("headIcon");
  });

  it("pflegt Zeile darüber und Überschrift unter Inhalt", async () => {
    const h = setup(withItems());
    await userEvent.click(screen.getByRole("tab", { name: "Inhalt" }));
    fireEvent.change(screen.getByTestId("usp-eyebrow"), { target: { value: "Kundennutzen" } });
    expect(h.latest().eyebrow).toBe("Kundennutzen");
    fireEvent.change(screen.getByTestId("usp-eyebrow"), { target: { value: "" } });
    expect(h.latest()).not.toHaveProperty("eyebrow");
    fireEvent.change(screen.getByTestId("usp-heading"), { target: { value: "Neu" } });
    expect(h.latest().heading).toBe("Neu");
  });

  it("legt einen Punkt an, wählt ihn und füllt ihn", async () => {
    const h = setup(emptyConfig());
    expect(screen.getByText(/Felder des gewählten Punkts/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Neuer Punkt/ }));
    fireEvent.change(screen.getByTestId("usp-item-0-title"), { target: { value: "Aerodynamik" } });
    fireEvent.change(screen.getByTestId("usp-item-0-text"), { target: { value: "Verbessert" } });

    expect(h.latest().items).toEqual([{ id: expect.any(String), title: "Aerodynamik", text: "Verbessert" }]);
  });

  it("sperrt „Neuer Punkt“ bei acht Punkten", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, title: `P${i}` }));
    setup({ ...emptyConfig(), items });
    expect(screen.getByRole("button", { name: /Neuer Punkt/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Punkt duplizieren" })).toHaveAttribute("aria-disabled", "true");
  });

  it("wählt ein Icon im Raster, sucht und entfernt es wieder", async () => {
    const h = setup(withItems());
    fireEvent.change(screen.getByTestId("usp-item-0-icon-search"), { target: { value: "lkw" } });
    expect(screen.queryByTestId("usp-item-0-icon-option-mail")).toBeNull();

    await userEvent.click(screen.getByTestId("usp-item-0-icon-option-truck"));
    expect(h.latest().items[0]!.icon).toBe("truck");
    expect(screen.getByTestId("usp-item-0-icon-option-truck")).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByTestId("usp-item-0-icon-clear"));
    expect(h.latest().items[0]).not.toHaveProperty("icon");
  });

  it("entfernt eine geleerte Erläuterung aus dem Punkt", () => {
    const h = setup({ ...emptyConfig(), items: [{ id: "a", title: "Eins", text: "Text" }] });
    fireEvent.change(screen.getByTestId("usp-item-0-text"), { target: { value: "" } });
    expect(h.latest().items[0]).toEqual({ id: "a", title: "Eins" });
  });

  it("sortiert per Knopf, dupliziert und löscht", async () => {
    const h = setup(withItems());
    expect(screen.getByRole("button", { name: "Punkt nach oben" })).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(screen.getByRole("button", { name: "Punkt nach unten" }));
    expect(h.latest().items.map((item) => item.title)).toEqual(["Zwei", "Eins"]);
    // Der gewählte Punkt bleibt „Eins“ und steht jetzt hinten.
    expect(screen.getByText("Punkt 2 von 2")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Punkt duplizieren" }));
    expect(h.latest().items.map((item) => item.title)).toEqual(["Zwei", "Eins", "Eins"]);
    expect(new Set(h.latest().items.map((item) => item.id)).size).toBe(3);

    await userEvent.click(screen.getByRole("button", { name: "Punkt löschen" }));
    expect(h.latest().items).toHaveLength(2);
  });

  it("zeigt in einer Geräteansicht die Box statt der Felder", () => {
    setup(withItems(), { view: "desktop" });
    expect(screen.getByTestId("usp-preview")).toBeInTheDocument();
    expect(screen.getByTestId("usp-box")).toBeInTheDocument();
    expect(screen.queryByTestId("usp-item-0-title")).toBeNull();
  });

  it("nennt in der Vorschau, dass die leere Box nicht erscheint", () => {
    setup(emptyConfig(), { view: "desktop" });
    expect(screen.getByText(/Ohne Punkte erscheint die Box/)).toBeInTheDocument();
  });

  it("zeigt den Fehler am leeren Punkt erst nach einem gescheiterten Übernehmen", () => {
    const empty = { ...emptyConfig(), items: [{ id: "a", title: "" }] };
    const { unmount } = render(
      <ConfigShellProvider value={shellState()}>
        <UspEditor value={empty} onChange={jest.fn()} />
      </ConfigShellProvider>,
    );
    expect(screen.queryByRole("alert")).toBeNull();
    unmount();
    render(
      <ConfigShellProvider value={shellState({ issuesVisible: true })}>
        <UspEditor value={empty} onChange={jest.fn()} />
      </ConfigShellProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Stichwort oder Erläuterung/);
  });
});

describe("moveItem", () => {
  it("lässt die Liste an den Rändern, wie sie ist", () => {
    const items = [{ id: "a", title: "A" }];
    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 0, 1)).toBe(items);
  });
});

describe("orderItems", () => {
  const items = [
    { id: "a", title: "A" },
    { id: "b", title: "B" },
    { id: "c", title: "C" },
  ];

  it("ordnet nach den Kennungen", () => {
    expect(orderItems(items, ["c", "a", "b"]).map((item) => item.id)).toEqual(["c", "a", "b"]);
  });

  it("verliert nichts, wenn Kennungen fehlen oder unbekannt sind", () => {
    expect(orderItems(items, ["c", "x"]).map((item) => item.id)).toEqual(["c", "a", "b"]);
  });
});
