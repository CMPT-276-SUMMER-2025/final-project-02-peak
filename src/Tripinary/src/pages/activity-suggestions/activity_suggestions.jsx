import { useState, useEffect } from "react";
import Activity_Carousel from "../../components/activity_carousel/activity_carousel.jsx";
import "./activity_suggestions.css";

const getCategory = (cat) => {
  switch(cat) {
    case "food_drinks":
      return "Food & Drinks"
    case "attractions_sightseeing":
      return "Attractions & Sightseeing"
    case "activities_recreation":
      return "Activities & Recreation"
    case "shopping":
      return "Shopping"
    default:
      return "" 
  }
}

function Activity_Suggestions({ pois, destination }) {

// State hook to store travel tip
const [tips, setTips] = useState("");

// Access to secure API key
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

// 🔌 Fetch travel tip from OpenRouter.
  async function fetchTips(destination) {
    try {
      //Log the destination being queried 
      console.log("Sending AI request for:", destination)

      //Make a POST request to OpenRouter's chat completion endpoint 
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`, // Holds our API key from .env
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
      console.log("Qwen response:", data);

      //Extract the generated response 
      const tip = data.choices?.[0]?.message?.content;

      //Updates the local state with the tip. If AI can't find any, there's an alternate response.
      setTips(tip || "No tip available, but adventure awaits!");
    } catch (error) {
      
      //Logs errors
      console.error("Failed to fetch tip:", error);

      //Error message when failed to fetch any data from API 
      setTips("Oops! Couldn't fetch your travel tip.");
    }
  }

  //useEffect is used here in case the destination changes, it will rerun the function fetchTips
  useEffect(() => {
    if (destination) {
      fetchTips(destination);
    }
  }, [destination]); //Only rerun it if the destination changes.

  return (
    <div className="activity_suggestions">
      <h1>
        Plan a trip in <span>{destination}</span>
      </h1>
      <div className = "tips-container">
      <p className="tips-label">HELPFUL TRAVEL TIP TO {destination}</p>
      <p className="tips-desc">{tips}</p>
      </div>
      <div>
        {Object.entries(pois).map(([category, places]) => (
          <>
            <Activity_Carousel key={category} category={getCategory(category)} list={places} />
          </>
        ))}
      </div>
    </div>
  );
}

export default Activity_Suggestions;
