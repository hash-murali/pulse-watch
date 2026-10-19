// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { snapshot } from "./fixtures";
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("live dashboard", () => {
  it("shows loading before API results arrive, then renders partial failures truthfully", async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Checking in on your services" }),
    ).toBeTruthy();
    resolve(Response.json(snapshot()));
    await screen.findByText("Healthy website");
    expect(screen.getByText("Failed website")).toBeTruthy();
    expect(screen.getByText("Blocked website")).toBeTruthy();
    expect(screen.getAllByText("Unknown").length).toBeGreaterThan(0);
    expect(screen.queryByText("MOCK DATA")).toBeNull();
    expect(screen.queryByLabelText("Preview state")).toBeNull();
    expect(
      screen.getByRole("button", { name: /Refresh/ }).hasAttribute("disabled"),
    ).toBe(true);
  });
  it("shows an accessible API error and can recover with retry", async () => {
    let fail = true;
    vi.stubGlobal("fetch", async () => {
      if (fail) throw new Error("private detail");
      return Response.json(snapshot());
    });
    render(<App />);
    await screen.findByRole("alert");
    expect(screen.queryByText("private detail")).toBeNull();
    fail = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("Healthy website");
  });
  it("filters services, shows empty matches and preserves theme", async () => {
    vi.stubGlobal("fetch", async () => Response.json(snapshot()));
    render(<App />);
    await screen.findByText("Healthy website");
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by status"),
      "unknown",
    );
    expect(screen.queryByText("Healthy website")).toBeNull();
    expect(screen.getByText("Blocked website")).toBeTruthy();
    await userEvent.type(screen.getByLabelText("Search services"), "no-match");
    expect(
      screen.getByRole("heading", { name: "No services to show" }),
    ).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    await waitFor(() =>
      expect(localStorage.getItem("pulsewatch-theme")).toBe("light"),
    );
  });
});
