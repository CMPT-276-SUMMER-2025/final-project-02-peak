# Vercel Deployment Instructions

## Environment Variables Required

You need to set these environment variables in your Vercel project settings:

### Backend Environment Variables (for serverless functions)
- `OPENROUTER_API_KEY` - Your OpenRouter API key for AI itinerary generation
- `GOOGLE_PLACES_API_KEY` - Your Google Places API key for place search and details

### Frontend Environment Variables
- `VITE_OPENROUTER_API_KEY` - Your OpenRouter API key (for direct frontend calls)

## Deployment Steps

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a React app

3. **Configure Environment Variables**
   - In your Vercel project dashboard, go to Settings > Environment Variables
   - Add all the environment variables listed above

4. **Deploy**
   - Vercel will automatically build and deploy your app
   - The frontend will be served from the root
   - API routes will be available at `/api/*`

## Project Structure for Vercel

```
/
├── api/                    # Serverless functions
│   ├── generate-itinerary.js
│   ├── place-details.js
│   └── place-search.js
├── src/                    # Frontend React app
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies for both frontend and backend
```

## API Endpoints

After deployment, your API endpoints will be available at:
- `https://your-domain.vercel.app/api/generate-itinerary`
- `https://your-domain.vercel.app/api/place-details`
- `https://your-domain.vercel.app/api/place-search`

## Troubleshooting

1. **API calls failing**: Make sure all environment variables are set in Vercel
2. **CORS errors**: The serverless functions are configured to allow requests from your Vercel domain
3. **Build errors**: Check that all dependencies are in the root `package.json`

## Local Development

For local development, you can still run:
- Frontend: `npm run dev` (runs on localhost:5173)
- Backend: `cd backend && npm start` (runs on localhost:5000)

The frontend will automatically use the correct API URLs based on the environment. 