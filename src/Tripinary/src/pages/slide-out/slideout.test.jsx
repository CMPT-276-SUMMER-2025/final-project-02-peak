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
