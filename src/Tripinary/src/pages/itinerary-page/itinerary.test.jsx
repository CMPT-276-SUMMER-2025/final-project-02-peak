import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, beforeEach, afterEach, expect, vi } from "vitest";
import Itinerary from "./itinerary.jsx";
import ItineraryContext from "../../context/ItineraryContext.jsx";

// ✅ Sample data for testing
const mockItinerary = [
  {
    day: 1,
    items: [
      { time: "9:00 AM", activity: "Walk through Stanley Park" },
      { time: "11:00 AM", activity: "Visit Vancouver Aquarium" },
      { time: "1:00 PM", activity: "Lunch at Cardero’s" },
      { time: "3:00 PM", activity: "Explore Granville Island" },
    ],
  },
  {
    day: 2,
    items: [
      { time: "10:00 AM", activity: "Visit Science World" },
      { time: "12:30 PM", activity: "Lunch at Phnom Penh" },
      { time: "2:00 PM", activity: "Stroll through Gastown" },
      { time: "4:30 PM", activity: "Capilano Suspension Bridge" },
    ],
  },
];

// ✅ Utility: Mock context generator
const getMockContext = (overrides = {}) => ({
  itineraryForm: {
    generatedItinerary: mockItinerary,
    isLoadingItinerary: false,
    itineraryError: null,
    selectedPlaces: [
      { name: "Stanley Park", place_id: "vancouver001" },
      { name: "Granville Island", place_id: "vancouver002" },
      { name: "Science World", place_id: "vancouver003" },
      { name: "Gastown", place_id: "vancouver004" },
      { name: "Capilano Bridge", place_id: "vancouver005" },
    ],
    destination: { name: "Vancouver" },
    duration: { num: 2 },
    ...overrides,
  },
  setGeneratedItinerary: vi.fn(),
  setIsLoadingItinerary: vi.fn(),
  setItineraryError: vi.fn(),
});

// ✅ Utility: Render component with context
const renderWithContext = (context) =>
  render(
    <ItineraryContext.Provider value={context}>
      <Itinerary />
    </ItineraryContext.Provider>
 );

// 🧪 Integration Test: Itinerary Rendering
describe("Integration Test: Itinerary rendering", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItinerary),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("displays correct itinerary structure and content", () => {
    renderWithContext(getMockContext());

    const dayLabels = document.querySelectorAll(".day-label");
    expect(dayLabels.length).toBe(2);
    expect(dayLabels[0]).toHaveTextContent("1");
    expect(dayLabels[1]).toHaveTextContent("2");

    mockItinerary.forEach((day) => {
      day.items.forEach((entry) => {
        const expectedText = `${entry.time}: ${entry.activity}`;
        const match = Array.from(document.querySelectorAll(".time-box li")).find((li) =>
          li.textContent.includes(expectedText)
        );
        expect(match).toBeTruthy();
      });
    });
  });
});

// 🧪 Unit Tests: Conditional Rendering Logic
describe("Unit Tests: Conditional rendering logic", () => {
  test("shows fallback when itinerary and selectedPlaces are empty", () => {
    const context = getMockContext({
      generatedItinerary: [],
      selectedPlaces: [],
    });

    renderWithContext(context);

    expect(
      screen.getByText(/No itinerary available. Please select destinations\/activities/i)
    ).toBeInTheDocument();
  });

  test("shows error message when itineraryError is present", () => {
    const context = getMockContext({
      generatedItinerary: [],
      itineraryError: "Failed to generate itinerary",
    });

    renderWithContext(context);

    expect(
      screen.getByText(/Failed to generate itinerary/i)
    ).toBeInTheDocument();
  });
});
