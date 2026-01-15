import { render, screen } from "@testing-library/react";

import { ArchiveItem } from "./archive-item";

describe("ArchiveItem", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn().mockImplementation((query) => ({
        addEventListener: jest.fn(),
        addListener: jest.fn(), // deprecated
        dispatchEvent: jest.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: jest.fn(),
        removeListener: jest.fn(), // deprecated
      })),
      writable: true,
    });
  });

  it("renders a single image when provided with one image", () => {
    const mockImages = ["/image1.jpg"];
    render(
      <ArchiveItem images={mockImages} title="Test Title" date="2026.01.15" />
    );

    // Check if the image is rendered
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", expect.stringContaining("image1.jpg"));
    expect(image).toHaveAttribute("alt", "Test Title");
  });

  it("renders a carousel when provided with multiple images", () => {
    const mockImages = ["/image1.jpg", "/image2.jpg"];
    render(
      <ArchiveItem images={mockImages} title="Test Title" date="2026.01.15" />
    );

    // Check if carousel specific elements are present (e.g., buttons)
    // Note: shadcn carousel usually renders buttons with specific aria-labels or classes
    // We'll look for the navigation buttons which are typical in carousels
    const nextButton = screen.queryByRole("button", { name: /next/i });
    const prevButton = screen.queryByRole("button", { name: /previous/i });

    // Since we haven't implemented it yet, these expect might fail or pass depending on implementation status
    // But conceptually this is the RED step for ensuring Carousel logic is verified
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
  });
});
