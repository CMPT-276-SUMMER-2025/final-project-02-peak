import React, { useState, useEffect } from "react";
import "./slideout.css";
import tripImage from "../../pages/slide-out/Tripinary.png";
import magnifierIcon from "../../pages/slide-out/search.png";

// Access Google Places API key from environment variable
const APIKEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Renders a star rating using full, half, and empty stars.
 * @param {number} rating - A number between 0 and 5.
 * @returns {JSX.Element} - The star icons.
 */
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <>
      {"★".repeat(fullStars)}
      {halfStar ? "⯨" : ""}
      {"☆".repeat(emptyStars)}
    </>
  );
}

/**
 * SidePanel component displays map, place info, and reviews.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is open.
 * @param {string} props.searchQuery - Query string from parent component.
 * @param {Function} props.onClose - Function to close the panel.
 * @param {Object} props.place - Place object (optional).
 * @param {string} props.destinationName - Destination name to append in searches.
 */
function SidePanel({ isOpen, searchQuery, onClose, place, destinationName }) {
  const defaultPlaceId = "ChIJN1t_tDeuEmsRUsoyG83frY4";
  const effectivePlaceId = place?.place_id || defaultPlaceId;

  const [mapSource, setMapSource] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [placeDetails, setPlaceDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Update the map and fetch details when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchInputValue(searchQuery);
      const fullQuery = destinationName ? `${searchQuery} ${destinationName}` : searchQuery;
      updateMapSource(fullQuery);
      fetchPlaceDetailsByQuery(fullQuery);
    }
  }, [searchQuery, destinationName]);

  // Logs place details 
  useEffect(() => {
    if (placeDetails) {
      console.log("placeDetails updated:", placeDetails);
    }
  }, [placeDetails]);

  /**
   * Updates the map iframe source using the encoded search query.
   * @param {string} query - Place or location name to display in the map.
   */
  const updateMapSource = (query) => {
    const encodedQuery = encodeURIComponent(query);
    const newLocation = `https://www.google.com/maps/embed/v1/place?key=${APIKEY}&q=${encodedQuery}`;
    setMapSource(newLocation);
  };

  /**
   * make photo URL from the Google Places photo reference.
   * @param {string} photoRef - Reference token from Google Places photo object.
   * @returns {string} - Full image URL.
   */
  const getPhotoUrl = (photoRef) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${APIKEY}`;

  /**
   * Triggers a map update and place detail search using current search input.
   */
  const handleSearch = () => {
    const fullQuery = destinationName ? `${searchInputValue} ${destinationName}` : searchInputValue;
    updateMapSource(fullQuery);
    fetchPlaceDetailsByQuery(fullQuery);
  };

  /**
   * Fetches place details from backend using a string-based search.
   * Updates state with fetched data or error.
   * @param {string} query - Combined search string 
   */
  const fetchPlaceDetailsByQuery = (query) => {
    setErrorMessage("");
    fetch(`http://localhost:5000/api/place-details?query=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setPlaceDetails(data.result);
        } else {
          setPlaceDetails(null);
          setErrorMessage(`No place found for "${query}". Please try another search term.`);
        }
      })
      .catch((err) => {
        console.error("Error fetching place details:", err);
        setPlaceDetails(null);
        setErrorMessage(`Something went wrong fetching "${query}". Try again later.`);
      });
  };

  // Default hardcoded fallback reviews
  const fallbackReviews = [
    { name: "Alice", stars: 5, date: "July 12, 2025", text: "Amazing spot. Would definitely visit again!" },
    { name: "Bob", stars: 4, date: "July 10, 2025", text: "Great atmosphere and friendly staff." },
    { name: "Charlie", stars: 3, date: "July 9, 2025", text: "It was okay. A bit crowded." },
    { name: "Diana", stars: 2, date: "July 7, 2025", text: "Not what I expected. Service could be better." },
    { name: "Ethan", stars: 1, date: "July 5, 2025", text: "Disappointing experience. Would not recommend." },
  ];

  return (
    <div className={`side-panel-full ${isOpen ? "open" : ""}`}>
      <div className="inner-panel">
        <button className="close-button" onClick={onClose}>&times;</button>

        {/* Left Side: Search + Map */}
        <div className="left-panel">
          <div className="search-bar">
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search places..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
              <img src={magnifierIcon} alt="Magnifying glass icon for search" className="search-icon" />
            </button>
          </div>
          <iframe
            className="map-placeholder"
            src={mapSource || "https://maps.google.com/maps?q=Simon+Fraser+University&output=embed"}
            allowFullScreen
            title="Map"
          />
        </div>

        {/* Right Side: Place Info + Reviews */}
        <div className="right-panel">
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="info-card">
            <div className="info-text">
              <h3>{placeDetails?.name ?? "Simon Fraser University"}</h3>
              <p className="star">
                {placeDetails?.rating ? (
                  <>
                    {renderStars(placeDetails.rating)}
                    <span style={{ marginLeft: "0.5em", fontWeight: 500 }}>{placeDetails.rating.toFixed(1)}</span>
                  </>
                ) : "☆☆☆☆☆"}
              </p>
              <p>{placeDetails?.formatted_address ?? "Lorem ipsum placeholder address."}</p>
            </div>
            <div className="image-placeholder">
              {placeDetails?.photos?.[0]
                ? <img src={getPhotoUrl(placeDetails.photos[0].photo_reference)}  alt={`Image of ${placeDetails.name || "the selected place"}`} />
                : <img src={tripImage}   alt="Logo placeholder for missing place image" />}
            </div>
          </div>

          <div className="review-card">
            <h4>User Reviews</h4>
            <div className="review-scroll">
              {(placeDetails?.reviews ?? fallbackReviews).map((review, i) => (
                <div className="review" key={i}>
                  <p>
                    {review.author_name ?? review.name}
                    <span className="review-star">
                      {"★".repeat(review.rating ?? review.stars)}
                      {"☆".repeat(5 - (review.rating ?? review.stars))}
                    </span>
                  </p>
                  <p className="review-date">{review.relative_time_description ?? review.date}</p>
                  <p>{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
