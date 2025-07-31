import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect, vi } from 'vitest';
import SidePanel from '../slide-out/slideout';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ /* mock placeDetails response */ }),
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks(); // Clean up after each test
});

// Mock a successful place details response from the backend
const mockSuccessResponse = {
  result: {
    name: 'Mock Place Name',
    formatted_address: '123 Mock Street, Mock City',
    rating: 4.5,
    reviews: [
      { author_name: 'Test User 1', rating: 5, relative_time_description: '2 days ago', text: 'Great place!' },
      { author_name: 'Test User 2', rating: 3, relative_time_description: '1 week ago', text: 'It was okay.' },
    ],
    photos: [{ photo_reference: 'mock_photo_ref_123' }],
  },
};

// Mock an error response from the backend
const mockErrorResponse = {
  error: 'No place found for query',
  details: { status: 'ZERO_RESULTS' },
};

describe('SidePanel Integration Tests', () => {
  test('renders with default map source when no search query is provided', () => {
    render(<SidePanel isOpen={true} searchQuery="" onClose={() => {}} place={null} destinationName="" />);

    const mapIframe = screen.getByTitle('Map');
    expect(mapIframe).toBeInTheDocument();
    expect(mapIframe).toHaveAttribute('src', 'https://maps.google.com/maps?q=Simon+Fraser+University&output=embed');
    expect(screen.getByText('Simon Fraser University')).toBeInTheDocument();
    expect(screen.getByText('☆☆☆☆☆')).toBeInTheDocument(); // Default stars
  });

  test('updates map source and fetches details when searchQuery prop changes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const { rerender } = render(
      <SidePanel isOpen={true} searchQuery="" onClose={() => {}} place={null} destinationName="Vancouver" />
    );

    rerender(
      <SidePanel isOpen={true} searchQuery="Gastown" onClose={() => {}} place={null} destinationName="Vancouver" />
    );

    await waitFor(() => {
      const mapIframe = screen.getByTitle('Map');
      expect(mapIframe).toHaveAttribute(
        'src',
        `https://www.google.com/maps/embed/v1/place?key=${process.env.VITE_GOOGLE_PLACES_API_KEY}&q=Gastown%20Vancouver`
      );
      expect(screen.getByText('Mock Place Name')).toBeInTheDocument();
      expect(screen.getByText('123 Mock Street, Mock City')).toBeInTheDocument();
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/place-details?query=Gastown%20Vancouver`);
    });
  });

  test('updates map source and fetches details when user types and clicks search', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<SidePanel isOpen={true} searchQuery="" onClose={() => {}} place={null} destinationName="Vancouver" />);

    const searchInput = screen.getByPlaceholderText('search places!!!');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: 'Stanley Park' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      const mapIframe = screen.getByTitle('Map');
      expect(mapIframe).toHaveAttribute(
        'src',
        `https://www.google.com/maps/embed/v1/place?key=${process.env.VITE_GOOGLE_PLACES_API_KEY}&q=Stanley%20Park%20Vancouver`
      );
      expect(screen.getByText('Mock Place Name')).toBeInTheDocument();
      expect(screen.getByText('123 Mock Street, Mock City')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/place-details?query=Stanley%20Park%20Vancouver`);
    });
  });

  test('displays error message when place details fetch fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => mockErrorResponse,
    });

    render(<SidePanel isOpen={true} searchQuery="Invalid Place" onClose={() => {}} place={null} destinationName="" />);

    await waitFor(() => {
      expect(screen.getByText('No place found for "Invalid Place". Please try another search term.')).toBeInTheDocument();
      expect(screen.queryByText('Mock Place Name')).not.toBeInTheDocument();
    });
  });

  test('displays default reviews when placeDetails has no reviews', async () => {
    const mockResponseNoReviews = {
      result: {
        name: 'Place with No Reviews',
        formatted_address: 'No Review St',
        rating: 4.0,
        reviews: [],
        photos: [],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseNoReviews,
    });

    render(<SidePanel isOpen={true} searchQuery="No Reviews" onClose={() => {}} place={null} destinationName="" />);

    await waitFor(() => {
      expect(screen.getByText('Place with No Reviews')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  test('displays fetched reviews when placeDetails reviews are available', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<SidePanel isOpen={true} searchQuery="Place with Reviews" onClose={() => {}} place={null} destinationName="" />);

    await waitFor(() => {
      expect(screen.getByText('Mock Place Name')).toBeInTheDocument();
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('Great place!')).toBeInTheDocument();
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
      expect(screen.getByText('It was okay.')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });

  

});
