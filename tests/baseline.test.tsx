// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getMockServices } from "../src/data/mockServices";
import { ServiceList } from "../src/components/ServiceList";
import { StatePanel } from "../src/components/StatePanel";
afterEach(cleanup);
describe("v0.1 baseline", () => {
  it("renders fixture status, HTTP result and latency with a timestamp", () => {
    render(
      <ServiceList
        services={getMockServices(new Date("2026-10-19T12:00:00Z"))}
      />,
    );
    expect(screen.getByText("Checkout API")).toBeTruthy();
    expect(screen.getByText("503")).toBeTruthy();
    expect(screen.getByText("Down")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(7);
  });
  it("exposes load failures accessibly with a retry action", () => {
    render(
      <StatePanel
        kind="error"
        message="Connection unavailable"
        onRetry={() => {}}
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Connection unavailable",
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
