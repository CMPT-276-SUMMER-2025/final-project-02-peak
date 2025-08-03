import { describe, it, expect, vi } from 'vitest';
// import { fetchTips } from '../activity-suggestions/fetchTips'; 

// Functions to Test
//Fetch travel tip from OpenRouter.
const fetchTips = async (destination, apiKey) => {
  try {
    //Log the destination being queried 
    console.log("Sending AI request for:", destination)

    //Make a POST request to OpenRouter's chat completion endpoint 
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, // Holds our API key from .env
        "Content-Type": "application/json", //Required content type for JSON API requests
        "HTTP-Referer": "http://localhost:5173/"
      },
      //This is the body of the API request
      body: JSON.stringify({
        model: "qwen/qwen3-coder:free",
        messages: [
          {
            role: "user",
            //User prompt to get the travel tip 
            content: `Give a short one-liner helpful travel tip for someone visiting ${destination}. Keep it under 15 words, and make it witty, practical, or surprising.`
          }
        ]
      })
    });
    //Parse the JSON response from the API 
    const data = await response.json();

    //Use the console.log to get the response data for troubleshooting 
    console.log("AI response:", data);

    //Extract the generated response 
    return data.choices?.[0]?.message?.content || "No tip available, but adventure awaits!";
  } catch (err) {

    //Logs errors
    console.error("Error fetching tip:", err);

    //Error message when failed to fetch any data from API 
    return "Oops! Couldn't fetch your travel tip.";
  }
}


//Mock the global fetch API before each test
global.fetch = vi.fn();

describe('fetchTips', () => {
  it('returns a travel tip from OpenRouter', async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: 'Pack light, but carry curiosity.',
              },
            },
          ],
        }),
    });

    const result = await fetchTips('Tokyo', 'fake-api-key');
    expect(result).toBe('Pack light, but carry curiosity.');
  });

  //Tests the fallback message when there is no input
  it('returns fallback message if choices are missing', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    const result = await fetchTips('Kyoto', 'fake-api-key');
    expect(result).toBe('No tip available, but adventure awaits!');
  });

  //Tests to see if a message pops up when there is a network failure
  it('returns error message on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network fail'));

    const result = await fetchTips('Osaka', 'fake-api-key');
    expect(result).toBe("Oops! Couldn't fetch your travel tip.");
  });
});
