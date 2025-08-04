
//Fetch travel tip from OpenRouter.
export async function fetchTips(destination, apiKey) {
  try {
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

    //Extract the generated response 
    return data.choices?.[0]?.message?.content || "No tip available, but adventure awaits!";
  } catch (err) {

    //Logs errors
    console.error("Error fetching tip:", err);

    //Error message when failed to fetch any data from API 
    return "Oops! Couldn't fetch your travel tip.";
  }
}
