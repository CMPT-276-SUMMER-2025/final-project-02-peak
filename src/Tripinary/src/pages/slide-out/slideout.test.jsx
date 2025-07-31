import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect, vi } from 'vitest'; // Import Vitest globals
import SidePanel from '../slideout.jsx'; // Adjust path as necessary

// Mock the API key as it's used in the component
// Vitest's `test.env` in `vite.config.js` is the preferred way for frontend env vars,
// but setting it here directly works too for isolated tests.
// process.env.VITE_GOOGLE_PLACES_API_KEY = 'mock_frontend_api_key';

describe('SidePanel Integration Tests', () => {
  beforeEach(() => {
    // Reset fetch mocks before each test
    // vitest-fetch-mock handles this automatically via setupFiles
    // If you need to mock specific responses, use `fetch.mockResponseOnce` etc.
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

  // Test 1: Initial render and default map source
  test('renders with default map source when no search query is provided', () => {
    render(<SidePanel isOpen={true} searchQuery="" onClose={() => {}} place={null} destinationName="" />);

    const mapIframe = screen.getByTitle('Map');
    expect(mapIframe).toBeInTheDocument();
    expect(mapIframe).toHaveAttribute('src', 'https://maps.google.com/maps?q=Simon+Fraser+University&output=embed');
    expect(screen.getByText('Simon Fraser University')).toBeInTheDocument();
    expect(screen.getByText('☆☆☆☆☆')).toBeInTheDocument(); // Default stars
  });

  // Test 2: Map source updates when searchQuery prop changes
  test('updates map source and fetches details when searchQuery prop changes', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    const { rerender } = render(
      <SidePanel isOpen={true} searchQuery="" onClose={() => {}} place={null} destinationName="Vancouver" />
    );

    // Simulate searchQuery change
    rerender(
      <SidePanel isOpen={true} searchQuery="Gastown" onClose={() => {}} place={null} destinationName="Vancouver" />
    );

    // Wait for the fetch call to resolve and component to update
    await waitFor(() => {
      const mapIframe = screen.getByTitle('Map');
      expect(mapIframe).toHaveAttribute(
        'src',
        `https://www.google.com/maps/embed/v1/place?key=${process.env.VITE_GOOGLE_PLACES_API_KEY}&q=${encodeURIComponent('Gastown Vancouver')}`
      );
      // Verify that place details are displayed
      expect(screen.getByText('Mock Place Name')).toBeInTheDocument();
      expect(screen.getByText('123 Mock Street, Mock City')).toBeInTheDocument();
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/place-details?query=${encodeURIComponent('Gastown Vancouver')}`);
    });
  });

  // Test 3: User interaction - typing and clicking search button
  test('updates map source and fetches details when user types and clicks search', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    render(<SidePanel isOpen={true} searchQuery="" onClose={() => {}} place={null} destinationName="Vancouver" />);

    const searchInput = screen.getByPlaceholderText('search places!!!');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(searchInput, { target: { value: 'Stanley Park' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      const mapIframe = screen.getByTitle('Map');
      expect(mapIframe).toHaveAttribute(
        'src',
        `https://www.google.com/maps/embed/v1/place?key=${process.env.VITE_GOOGLE_PLACES_API_KEY}&q=${encodeURIComponent('Stanley Park Vancouver')}`
      );
      // Verify that place details are displayed
      expect(screen.getByText('Mock Place Name')).toBeInTheDocument();
      expect(screen.getByText('123 Mock Street, Mock City')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/place-details?query=${encodeURIComponent('Stanley Park Vancouver')}`);
    });
  });

  // Test 4: Display error message on failed fetch from backend
  test('displays error message when place details fetch fails', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockErrorResponse), { status: 404 });

    render(<SidePanel isOpen={true} searchQuery="Invalid Place" onClose={() => {}} place={null} destinationName="" />);

    await waitFor(() => {
      expect(screen.getByText('No place found for "Invalid Place". Please try a different search term.')).toBeInTheDocument();
      expect(screen.queryByText('Mock Place Name')).not.toBeInTheDocument(); // Ensure old data is cleared
    });
  });

  // Test 5: Displays default reviews when no placeDetails reviews are available
  test('displays default reviews when placeDetails has no reviews', async () => {
    const mockResponseNoReviews = {
      result: {
        name: 'Place with No Reviews',
        formatted_address: 'No Review St',
        rating: 4.0,
        reviews: [], // Empty reviews array
        photos: [],
      },
    };
    fetch.mockResponseOnce(JSON.stringify(mockResponseNoReviews));

    render(<SidePanel isOpen={true} searchQuery="No Reviews" onClose={() => {}} place={null} destinationName="" />);

    await waitFor(() => {
      expect(screen.getByText('Place with No Reviews')).toBeInTheDocument();
      // Check for default reviews
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  // Test 6: Displays fetched reviews when placeDetails reviews are available
  test('displays fetched reviews when placeDetails reviews are available', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    render(<SidePanel isOpen={true} searchQuery="Place with Reviews" onClose={() => {}} place={null} destinationName="" />);

    await waitFor(() => {
      expect(screen.getByText('Mock Place Name')).toBeInTheDocument();
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('Great place!')).toBeInTheDocument();
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
      expect(screen.getByText('It was okay.')).toBeInTheDocument();
      // Ensure default reviews are NOT present if fetched reviews are shown
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });

  // Test 7: Correct star rendering for various ratings
  test('renders stars correctly for different ratings', async () => {
    // Helper to render and check stars
    const checkStars = async (rating, expectedStars, expectedRatingText) => {
      const mockResponse = { result: { name: `Rated ${rating}`, rating: rating, reviews: [], photos: [] } };
      fetch.mockResponseOnce(JSON.stringify(mockResponse));

      render(<SidePanel isOpen={true} searchQuery={`Test${rating}`} onClose={() => {}} place={null} destinationName="" />);
      fireEvent.change(screen.getByPlaceholderText('search places!!!'), { target: { value: `Test${rating}` } });
      fireEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        expect(screen.getByText(expectedStars)).toBeInTheDocument();
        expect(screen.getByText(expectedRatingText)).toBeInTheDocument();
      });
      // Clean up for next render
      screen.queryByText(expectedStars)?.remove();
      screen.queryByText(expectedRatingText)?.remove();
      fetch.resetMocks(); // Reset fetch mock for the next iteration
    };

    // Test 4.5 rating
    await checkStars(4.5, '★★★★⯨', '4.5');

    // Test 3.0 rating
    await checkStars(3.0, '★★★☆☆', '3.0');

    // Test 2.7 rating (should render as 2 full, 1 half, 2 empty)
    await checkStars(2.7, '★★⯨☆☆', '2.7');

    // Test 3.2 rating (should render as 3 full, 2 empty)
    await checkStars(3.2, '★★★☆☆', '3.2');

    // Test 3.7 rating (should render as 3 full, 1 half, 1 empty)
    await checkStars(3.7, '★★★⯨☆', '3.7');
  });
});
