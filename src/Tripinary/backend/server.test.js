import request from 'supertest';
import { describe, test, beforeEach, expect, vi } from 'vitest';
import app from './server';

process.env.GOOGLE_PLACES_API_KEY = 'mock_google_api_key';
process.env.OPENROUTER_API_KEY = 'mock_openrouter_api_key';
process.env.PORT = '5001';

describe('GET /api/place-details', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Clear mocks before each test
  });

  test('should return place details for a valid query', async () => {
    const mockQuery = 'Eiffel Tower';
    const mockPlaceId = 'ChIJ-abc123';
    const mockTextSearchResponse = {
      status: 'OK',
      results: [{ place_id: mockPlaceId }],
    };
    const mockDetailsResponse = {
      status: 'OK',
      result: {
        name: 'Eiffel Tower',
        formatted_address: 'Paris, France',
        rating: 4.6,
        reviews: [{ author_name: 'User A', rating: 5, text: 'Amazing!' }],
        photos: [{ photo_reference: 'mock_photo_ref_1' }],
      },
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTextSearchResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetailsResponse,
      });

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockDetailsResponse);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('should return 400 if query is missing', async () => {
    const response = await request(app).get('/api/place-details');
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Missing query' });
  });

  test('should return 404 if no place is found for the query', async () => {
    const mockQuery = 'NonExistentPlace123';
    const mockTextSearchResponse = {
      status: 'ZERO_RESULTS',
      results: [],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockTextSearchResponse,
    });

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: 'No place found for query',
      details: mockTextSearchResponse,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('should return 500 if Google Places Details API returns an error', async () => {
    const mockQuery = 'ValidPlaceButDetailsFail';
    const mockPlaceId = 'ChIJ_valid_place_id';
    const mockTextSearchResponse = {
      status: 'OK',
      results: [{ place_id: mockPlaceId }],
    };
    const mockDetailsErrorResponse = {
      status: 'REQUEST_DENIED',
      error_message: 'API key not authorized.',
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTextSearchResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetailsErrorResponse,
      });

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: 'Google API error (details)',
      details: mockDetailsErrorResponse,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('should return 500 if there is a network error fetching from Google API', async () => {
    const mockQuery = 'NetworkErrorPlace';

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network connection failed'));

    const response = await request(app).get(`/api/place-details?query=${encodeURIComponent(mockQuery)}`);
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Failed to fetch from Google Places API (text search)');
    expect(response.body.details).toBe('Network connection failed');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
