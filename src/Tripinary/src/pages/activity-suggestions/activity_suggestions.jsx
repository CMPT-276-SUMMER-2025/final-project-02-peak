import { useState, useEffect } from "react";
import Activity_Carousel from "../../components/activity_carousel/activity_carousel.jsx";
import "./activity_suggestions.css";
import { fetchTips } from "./fetchTips.jsx";

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

  //useEffect is used here in case the destination changes, it will rerun the function fetchTips
  useEffect(() => {
  if (destination) {
    fetchTips(destination, apiKey).then((tip) => {
      setTips(tip);
    });
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
