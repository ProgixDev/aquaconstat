import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MotionProvider } from "@/components/motion";
import { FaqSection } from "./faq-section";

afterEach(cleanup);

const firstQuestion = /quel est le délai exact/i;
const secondQuestion = /quels types de sinistres/i;

function renderFaq() {
  return render(
    <MotionProvider>
      <FaqSection />
    </MotionProvider>,
  );
}

describe("FaqSection", () => {
  it("renders all questions with the first answer open", () => {
    renderFaq();
    expect(screen.getAllByRole("button")).toHaveLength(6);
    expect(screen.getByRole("button", { name: firstQuestion })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText(/48 h ouvrées après la confirmation/i)).toBeInTheDocument();
  });

  it("opens one item at a time", () => {
    renderFaq();
    fireEvent.click(screen.getByRole("button", { name: secondQuestion }));
    expect(screen.getByRole("button", { name: secondQuestion })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: firstQuestion })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText(/fuite, infiltration, débordement/i)).toBeInTheDocument();
  });

  it("closes an open item when clicked again", () => {
    renderFaq();
    fireEvent.click(screen.getByRole("button", { name: firstQuestion }));
    // The exit animation may keep the panel in the DOM briefly — the
    // accessible contract is the collapsed state on the trigger.
    expect(screen.getByRole("button", { name: firstQuestion })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
