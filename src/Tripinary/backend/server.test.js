import request from 'supertest';
import nock from 'nock';
import { describe, test, beforeEach, expect, vi } from 'vitest'; // Import Vitest globals if not using `globals: true` in vite.config.js
import app from './server'; // Adjust path if server.js is in a different directory

// Mock environment variables for testing.
// These are also set in vite.config.js under `test.env`, but explicitly setting them here
// ensures they are available for the backend tests running in Node.js environment.
process.env.GOOGLE_PLACES_API_KEY = 'mock_google_api_key';
process.env.OPENROUTER_API_KEY = 'mock_openrouter_api_key';
process.env.PORT = '5001'; // Use a different port for tests if needed

describe('GET /api/place-details', () => {
  beforeEach(() => {
    // Clear all active nocks before each test to ensure isolation
    nock.cleanAll();
  });

  // Test case for successful place details fetch
  test('should return place details for a valid query', async () => {
    const mockQuery = 'Eiffel Tower';
    const mockPlaceId = 'ChIJ-y4B_05u5kcR-Q_y4B_05u5kcR-Q';
    const mockTextSearchResponse = {
      status: 'OK',
      results: [{ place_id: mockPlaceId }],
    };
    const mockDetailsResponse = {
      status: 'OK',
      result: {
        name: 'Eiffel Tower',
        formatted_address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
        rating: 4.6,
        reviews: [
          { author_name: 'User A', rating: 5, relative_time_description: 'a week ago', text: 'Amazing!' },
        ],
        photos: [{ photo_reference: 'mock_photo_ref_1' }],
      },
    };

    // Mock the Google Places Text Search API call
    nock('https://maps.googleapis.com')
      .get(`/maps/api/place/textsearch/json`)
      .query({ query: mockQuery, key: process.env.GOOGLE_PLACES_API_KEY })
      .reply(200, mockTextSearchResponse);

    // Mock the Google Places Details API call
    nock('https://maps.googleapis.com')
      .get(`/maps/api/place/details/json`)
      .query({ place_id: mockPlaceId, key: process.env.GOOGLE_PLACES_API_KEY })
      .reply(200, mockDetailsResponse);

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockDetailsResponse);
    expect(nock.isDone()).toBe(true); // Ensure all nocks were called
  });

  // Test case for missing query parameter
  test('should return 400 if query is missing', async () => {
    const response = await request(app).get('/api/place-details');

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Missing query' });
  });

  // Test case for no place found by text search
  test('should return 404 if no place is found for the query', async () => {
    const mockQuery = 'NonExistentPlace123';
    const mockTextSearchResponse = {
      status: 'ZERO_RESULTS',
      results: [],
    };

    nock('https://maps.googleapis.com')
      .get(`/maps/api/place/textsearch/json`)
      .query({ query: mockQuery, key: process.env.GOOGLE_PLACES_API_KEY })
      .reply(200, mockTextSearchResponse);

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: 'No place found for query',
      details: mockTextSearchResponse,
    });
    expect(nock.isDone()).toBe(true);
  });

  // Test case for Google Places Details API error
  test('should return 500 if Google Places Details API returns an error', async () => {
    const mockQuery = 'ValidPlaceButDetailsFail';
    const mockPlaceId = 'ChIJ_valid_place_id_but_details_fail';
    const mockTextSearchResponse = {
      status: 'OK',
      results: [{ place_id: mockPlaceId }],
    };
    const mockDetailsErrorResponse = {
      status: 'REQUEST_DENIED',
      error_message: 'API key not authorized.',
    };

    nock('https://maps.googleapis.com')
      .get(`/maps/api/place/textsearch/json`)
      .query({ query: mockQuery, key: process.env.GOOGLE_PLACES_API_KEY })
      .reply(200, mockTextSearchResponse);

    nock('https://maps.googleapis.com')
      .get(`/maps/api/place/details/json`)
      .query({ place_id: mockPlaceId, key: process.env.GOOGLE_PLACES_API_KEY })
      .reply(200, mockDetailsErrorResponse); // Simulate an error response from details API

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: 'Google API error (details)',
      details: mockDetailsErrorResponse,
    });
    expect(nock.isDone()).toBe(true);
  });

  // Test case for network error during fetch to Google API
  test('should return 500 if there is a network error fetching from Google API', async () => {
    const mockQuery = 'NetworkErrorPlace';

    // Simulate a network error (e.g., DNS lookup failure, connection refused)
    nock('https://maps.googleapis.com')
      .get(`/maps/api/place/textsearch/json`)
      .query({ query: mockQuery, key: process.env.GOOGLE_PLACES_API_KEY })
      .replyWithError('Network connection failed');

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Failed to fetch from Google Places API (text search)');
    expect(response.body.details).toBe('Network connection failed');
    expect(nock.isDone()).toBe(true);
  });
});
