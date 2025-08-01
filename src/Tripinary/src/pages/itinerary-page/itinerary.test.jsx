import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, beforeEach, afterEach, expect, vi } from "vitest";
import Itinerary from "./itinerary.jsx";
import ItineraryContext from "../../context/ItineraryContext.jsx";

// Creating mock data for testing the itinerary page
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

// function to mock ItineraryContext
const getMockContext = (overrides = {}) => ({
  itineraryForm: {
    generatedItinerary: mockItinerary,
    isLoadingItinerary: false,
    itineraryError: null,
    selectedPlaces: [
      { name: "Stanley Park", place_id: "1231223" },
      { name: "Granville Island", place_id: "123123" },
      { name: "Science World", place_id: "1231232" },
      { name: "Gastown", place_id: "1232232" },
      { name: "Capilano Bridge", place_id: "12323123" },
    ],
    destination: { name: "Vancouver" },
    duration: { num: 2 },
    ...overrides,
  },
  setGeneratedItinerary: vi.fn(),
  setIsLoadingItinerary: vi.fn(),
  setItineraryError: vi.fn(),
});

// renders itinerary with mock context
const renderWithContext = (context) =>
  render(
    <ItineraryContext.Provider value={context}>
      <Itinerary />
    </ItineraryContext.Provider>
 );
 
// test to make sure that itinerary rendering is working
describe("integration test to render the itinerary", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => // mocking fetch api call
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItinerary),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks(); // after each test clear the mocks
  });

  test("displays correct itinerary layout and activity descriptions", () => {
    renderWithContext(getMockContext());
    // make sure that there are a correct number of days
    const dayLabels = document.querySelectorAll(".day-label");
    expect(dayLabels.length).toBe(2);
    expect(dayLabels[0]).toHaveTextContent("1");
    expect(dayLabels[1]).toHaveTextContent("2");

    // checking to make sure that all activities appear as expected 
    mockItinerary.forEach((day) => { // also checking the time
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

// unit test for the case where no data was passed in
describe("unit test to test itinerary rendering", () => {
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

  test("shows error  when itineraryError is present", () => {
    // trying to simulate what an error state would cause
    const context = getMockContext({
      generatedItinerary: [],
      itineraryError: "Failed to generate itinerary",
    });

    renderWithContext(context);
    expect(
      screen.getByText(/Failed to generate itinerary/i) // error message should appear
    ).toBeInTheDocument();
  });
});
