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

// Ein Modul, kein Skript: sonst teilten sich die Testdateien aller Widgets
// einen Namensraum.
export {};

const mockStartWidget = jest.fn().mockResolvedValue(undefined);

jest.mock("@shared/dev-mode/start-widget", () => ({ startWidget: mockStartWidget }));

interface Host {
  defineBlock: jest.Mock;
}

describe("Anmeldung des Widgets", () => {
  it("meldet den Baustein mit dem Attribut usp-config an", async () => {
    const host = window as unknown as Host;
    host.defineBlock = jest.fn();

    jest.resetModules();
    await import("./index");

    const options = mockStartWidget.mock.calls[0][0] as { name: string; register: () => void };
    expect(options.name).toBe("usp-widget");

    options.register();

    expect(host.defineBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        blockDefinition: expect.objectContaining({
          name: "usp-widget",
          label: "USP-Box",
          attributes: ["usp-config"],
        }),
      }),
    );
  });
});

describe("Attributname", () => {
  it("teilt seinen Feldnamen mit keinem anderen Widget", async () => {
    // Die Editoren finden ihr Feld über `root_<Attribut>`, ohne das Widget zu
    // kennen. Ein geteilter Name ließe fremde Editoren in diesen Dialog.
    const { readdirSync, readFileSync, existsSync } = await import("fs");
    const { join } = await import("path");
    const { CONFIG_ATTRIBUTE } = await import("./configuration-schema");
    const widgetsRoot = join(__dirname, "..", "..");
    const others = readdirSync(widgetsRoot).filter((name) => name !== "usp-widget");
    const clashes = others.filter((name) => {
      const schema = join(widgetsRoot, name, "src", "configuration-schema.ts");
      return existsSync(schema) && new RegExp(`["'\`]${CONFIG_ATTRIBUTE}["'\`]`).test(readFileSync(schema, "utf8"));
    });

    expect(clashes).toEqual([]);
  });
});
