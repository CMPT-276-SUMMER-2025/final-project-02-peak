import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TripinaryMain from './TripinaryMain';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import ItineraryContext from '../../context/ItineraryContext';
import PoisContext from '../../context/PoisContext';
import { findNearbyPlaces } from '../../context/PoisProvider';

const mockItineraryForm = {
  destination: { name: null, address: null },
  duration: { num: 0, timeType: null },
  selectedPlaces: [],
  generatedItinerary: null,
  isLoadingItinerary: false,
  itineraryError: null
};

const mockItineraryContext = {
  itineraryForm: mockItineraryForm,
  updateDestinationName: vi.fn(),
  updateDuration: vi.fn(),
  clearItineraryForm: vi.fn(),
  setGeneratedItinerary: vi.fn(),
  setIsLoadingItinerary: vi.fn(),
  setItineraryError: vi.fn()
};

const mockPoisContext = {
  pois: {
    food_drinks: [],
    attractions_sightseeing: [],
    activities_recreation: [],
    shopping: []
  },
  findPois: vi.fn(),
  deletePois: vi.fn(),
  isPoisEmpty: () => true,
  notification: { type: '', message: '' },
  isVisible: false
};

const renderWithProviders = () =>
  render(
    <ItineraryContext.Provider value={mockItineraryContext}>
      <PoisContext.Provider value={mockPoisContext}>
        <BrowserRouter>
          <TripinaryMain />
        </BrowserRouter>
      </PoisContext.Provider>
    </ItineraryContext.Provider>
  );

// Component Testing for Main page.  
describe('TripinaryMain Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and input fields', () => {
    renderWithProviders();

    expect(screen.getByText(/TRIPINARY/i)).toBeInTheDocument();
    expect(screen.getByText(/First, tell us your target city and trip duration./i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter a number/i)).toBeInTheDocument();
  });

  it('displays an alert if no destination or duration is set when submitting', () => {
    global.alert = vi.fn(); // mock alert
    renderWithProviders();

    const button = screen.getByRole('button', { name: /Plan My Trip/i });
    fireEvent.click(button);

    expect(global.alert).toHaveBeenCalledWith(
      'Please enter a city or increase the trip duration.'
    );
  });

  it('disables generate itinerary button if no places selected', () => {
    renderWithProviders();

    const generateBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
    expect(generateBtn).toBeDisabled();
  });

  it('renders correct button text based on loading state', () => {
    const loadingContext = {
      ...mockItineraryContext,
      itineraryForm: {
        ...mockItineraryForm,
        destination: { name: 'Vancouver' },
        duration: { num: 3, timeType: 'days' },
        selectedPlaces: [{ id: 1 }]
      },
      isLoadingItinerary: true
    };

    render(
      <ItineraryContext.Provider value={loadingContext}>
        <PoisContext.Provider value={mockPoisContext}>
          <BrowserRouter>
            <TripinaryMain />
          </BrowserRouter>
        </PoisContext.Provider>
      </ItineraryContext.Provider>
    );
  });
});

// Test for Google Places API.
describe('findNearbyPlaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY = 'test-api-key';
  });

  it('sends correct POST request and updates pois', async () => {
    const mockSetPois = vi.fn();
    const mockLocation = { lat: 49.2827, lng: -123.1207 };
    const mockCategory = 'food_drinks';
    const mockTypes = {
      includedTypes: ['restaurant'],
      excludedTypes: ['lodging']
    };

    const mockResponse = {
      places: [
        {
          id: 'abc123',
          displayName: { text: 'Test Place' },
          location: { latitude: 49.28, longitude: -123.12 },
        }
      ]
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await findNearbyPlaces(mockLocation, mockCategory, mockTypes, mockSetPois);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://places.googleapis.com/v1/places:searchNearby',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': expect.any(String),
        }),
        body: expect.any(String),
      })
    );

    expect(mockSetPois).toHaveBeenCalledWith(expect.any(Function));
  });

  it('logs an error and returns null on failed request', async () => {
    const mockSetPois = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    const result = await findNearbyPlaces(
      { lat: 0, lng: 0 },
      'food_drinks',
      { includedTypes: [], excludedTypes: [] },
      mockSetPois
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Could not fetch nearby places:',
      expect.any(Error)
    );
    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });
});