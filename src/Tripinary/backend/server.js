//Import dependencies

import express from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

//CORS configuration


const corsOptions = {
    origin: ['https://tripinary-one.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());


// Environment variables

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL = "mistralai/mixtral-8x7b-instruct";
//const AI_MODEL = "openai/gpt-3.5-turbo"
/**
 * POST /api/generate-itinerary
 * Given a destination and selected places, generates an AI-based itinerary.
 * Input: JSON object with selectedPlaces (array), destinationName (string), and duration (object)
 * Output: JSON array of daily itinerary objects (each with a "day" and "items")
 */


app.post('/api/generate-itinerary', async (req, res) => {
    const { selectedPlaces, destinationName, duration } = req.body;

    //Input Validation

    if (!selectedPlaces || !Array.isArray(selectedPlaces) || selectedPlaces.length === 0) {
        return res.status(400).json({ message: 'No places selected for itinerary. Please select at least one place.' });
    }
    if (!destinationName) {
        return res.status(400).json({ message: 'Destination name is required.' });
    }
    if (!duration || !duration.num || !duration.timeType) {
        return res.status(400).json({ message: 'Trip duration (number and type) is required.' });
    }

    if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY is not set in environment variables.");
        return res.status(500).json({
            message: "Backend error: OpenRouter API key is missing.",
            details: "Please set OPENROUTER_API_KEY in your Vercel environment variables."
        });
    }

    // Format selected places into a readable list

    const formattedPlaces = selectedPlaces.map(place => {
        const name = place.displayName?.text || place.name || 'Unnamed Place';
        const address = place.formattedAddress ? ` (${place.formattedAddress})` : '';
        return `- ${name}${address}`;
    }).join('\n');

    // Prompt to instruct the AI to generate the itinerary in strict JSON format

    const promptContent = `Generate a ${duration.num} ${duration.timeType} itinerary
    for a trip to ${destinationName}. The itinerary MUST include the following
    specific places/activities: ${formattedPlaces}

    For each day, assign a reasonable time to each activity.
    If there are not enough activities for the duration, or if a day has fewer than 3 activities,
    suggest additional appropriate activities (e.g., morning (around 8 AM), mid-morning (around 9 AM),
    lunch (around 12 PM), afternoon, evening) to make the day feel complete. Make sure these suggested
    activities are relevant to the area and complement the provided places.
    Try to group geographically close activities and consider travel time between places.

    Make sure that each activity has a specific location as well, (e.g Lunch at Social House, Dinner at The Keg instead of just Lunch at Granville Island)

    Format the entire output strictly as a JSON array of daily itinerary objects.
    Each daily object MUST have a "day" string (e.g., "Day 1", "Day 2") and an "items" array.
    Each item in the "items" array MUST have a "time" string (e.g., "08:00", "12:30") and an "activity" string.
    
    DO NOT include any introductory or concluding text, explanations, or conversational filler.
    DO NOT wrap the JSON in markdown code blocks (e.g., NO \`\`\`json\`\`\` or similar).
    Ensure the JSON is perfectly valid and ready for direct parsing.`;


    // Call OpenRouter API with the user prompt
    try {
        const openRouterResponse = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: promptContent }]
            })
        });

        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text();
            console.error("OpenRouter API error (status %d):", openRouterResponse.status, errorText);
            throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
        }
        // Remove ```json or ``` wrappers if present
        const openRouterJson = await openRouterResponse.json();

        if (!openRouterJson.choices || !openRouterJson.choices[0] || !openRouterJson.choices[0].message) {
            console.error("Unexpected OpenRouter API response structure:", openRouterJson);
            throw new Error("OpenRouter API returned an unexpected response structure.");
        }

        const aiOutput = openRouterJson.choices[0].message.content;
        // parsing through AI response to clean output before creating itinerary
        let cleanJsonResponse = aiOutput
            .replace(/^```json|^```|```$/g, '')    
            .replace(/“|”/g, '"')             
            .replace(/\u0000/g, '')                
            .trim();

        if (cleanJsonResponse.startsWith('```json') && cleanJsonResponse.endsWith('```')) {
            const jsonStart = cleanJsonResponse.indexOf('\n');
            const jsonEnd = cleanJsonResponse.lastIndexOf('```');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanJsonResponse = cleanJsonResponse.substring(jsonStart + 1, jsonEnd).trim();
            } else {
                console.warn("AI response started with ```json and ended with ``` but format was unexpected. Attempting to parse original.");
            }
        } else if (cleanJsonResponse.startsWith('```') && cleanJsonResponse.endsWith('```')) {
            // Handle cases where it's just ``` and not ```json
            const jsonStart = cleanJsonResponse.indexOf('\n');
            const jsonEnd = cleanJsonResponse.lastIndexOf('```');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanJsonResponse = cleanJsonResponse.substring(jsonStart + 1, jsonEnd).trim();
            }
        }

        // Parse the cleaned JSON string
        let itineraryData;
        try {
            // Clean common characters to make it easier to parse through
            const cleanedResponse = cleanJsonResponse
                .replace(/^```json|^```|```$/g, '') 
                .replace(/“|”/g, '"')                 
                .replace(/\u0000/g, '')           
                .trim();

            itineraryData = JSON.parse(cleanedResponse);
        } catch (err) {
            console.error("AI returned unparseable JSON.");
            console.error("Raw AI response:", aiOutput);       
            console.error("Cleaned response:", cleanJsonResponse);
            console.error("Parse error:", err.message);

            return res.status(500).json({
                message: "Backend error! Status: 500 - AI generated an unparseable response (JSON parsing failed).",
                rawResponse: cleanJsonResponse,
                error: err.message
            });
        }
        res.json(itineraryData);

    } catch (error) {
        console.error('Error in /api/generate-itinerary endpoint:', error);
        res.status(500).json({
            message: 'Internal server error while generating itinerary.',
            details: error.message
        });
    }
});

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * GET /api/place-details
 * Fetches Google Places details based on a user-entered query string.
 * Input: query (string) via query parameter
 * Output: Place details JSON from Google Places API
 */

app.get('/api/place-details', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    if (!GOOGLE_PLACES_API_KEY) {
        console.error("GOOGLE_PLACES_API_KEY is not set in environment variables.");
        return res.status(500).json({
            error: "Google Places API key is missing.",
            details: "Please set GOOGLE_PLACES_API_KEY in your Vercel environment variables."
        });
    }

    // Use Text Search to get a place_id first
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`;
    try {
        const textSearchResponse = await fetch(textSearchUrl);
        const textSearchData = await textSearchResponse.json();
        if (textSearchData.status !== "OK" || !textSearchData.results.length) {
            return res.status(404).json({ error: "No place found for query", details: textSearchData });
        }
        // Use the first result's place_id
        const foundPlaceId = textSearchData.results[0].place_id;
        // fetch details 
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${foundPlaceId}&key=${GOOGLE_PLACES_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        if (detailsData.status !== "OK") {
            return res.status(500).json({ error: "Google API error (details)", details: detailsData });
        }
        return res.json(detailsData);
    } catch (err) {
        console.error("Error fetching from Google Places API (text search):", err);
        return res.status(500).json({ error: 'Failed to fetch from Google Places API (text search)', details: err.message });
    }
});

// Catch-all error handler for unhandled server errors

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Internal server error',
        details: err.message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


export default app;