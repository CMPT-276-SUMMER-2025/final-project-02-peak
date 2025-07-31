// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production (Vercel)
  : 'http://localhost:5000'; // Use localhost in development

export const API_ENDPOINTS = {
  GENERATE_ITINERARY: `${API_BASE_URL}/api/generate-itinerary`,
  PLACE_DETAILS: `${API_BASE_URL}/api/place-details`,
  PLACE_SEARCH: `${API_BASE_URL}/api/place-search`,
};

export default API_ENDPOINTS; 