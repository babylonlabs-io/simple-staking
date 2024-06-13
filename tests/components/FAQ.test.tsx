import { render, screen } from "@testing-library/react";

import { FAQ } from "@/app/components/FAQ/FAQ";
import "@testing-library/jest-dom";

describe("FAQ Component", () => {
  it("renders the FAQ title", () => {
    render(<FAQ />);
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });
});
