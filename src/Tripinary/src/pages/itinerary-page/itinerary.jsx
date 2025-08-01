import React, { useState, useEffect, useContext } from "react";
import ItineraryContext from "../../context/ItineraryContext.jsx";
import DayCard from "../../components/day_card/day_card";
import "./itinerary.css";
import SidePanel from "../slide-out/slideout";

function Itinerary() {
  const {
    itineraryForm,
    setGeneratedItinerary,
    setIsLoadingItinerary,
    setItineraryError,
  } = useContext(ItineraryContext);

  const itinerary = itineraryForm.generatedItinerary;
  const isLoading = itineraryForm.isLoadingItinerary;
  const error = itineraryForm.itineraryError;
  const placesToItinerize = itineraryForm.selectedPlaces;

  const [selectedPlaceForPanel, setSelectedPlaceForPanel] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectPlaceForPanel = (item) => {
    if (item.place_id) {
      setSelectedPlaceForPanel(item);
      setIsPanelOpen(true);
    } else {
      alert("This activity does not have a linked place_id.");
    }
  };

  const handleSelectActivity = (activity) => {
    setSearchQuery(activity);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedPlaceForPanel(null);
  };

  const handleSubmitItinerary = async () => {
    if (
      !itineraryForm.destination.name ||
      !itineraryForm.duration.num ||
      itineraryForm.selectedPlaces.length === 0
    ) {
      alert(
        "Please ensure you have selected a destination, duration, and at least one activity. You might need to go back to the main page to adjust your selections."
      );
      return;
    }

    setIsLoadingItinerary(true);
    console.log("Loading:", itineraryForm.isLoadingItinerary);
    setItineraryError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/generate-itinerary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedPlaces: itineraryForm.selectedPlaces,
            destinationName: itineraryForm.destination.name,
            duration: itineraryForm.duration,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Unknown error from backend.",
        }));
        throw new Error(
          `Backend error! Status: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      setGeneratedItinerary(data);
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      setItineraryError(err.message);
      alert(`Error generating itinerary: ${err.message}`);
    } finally {
      setIsLoadingItinerary(false); // ✅ clean-up
    }
  };

  return (
    <div className="itinerary-container">
 
      <h1>
        Your Trip Itinerary for {itineraryForm.destination.name || "Your Destination"}
      </h1>

      {itineraryForm.isLoadingItinerary ? ( // ✅ updated to use correct state
        <div className="loading-message-container">
          <p>Generating your itinerary... please wait ⏳</p>
        </div>
      ) : error ? (
        <p className="error-message">Error: {error}</p>
      ) : itinerary && itinerary.length > 0 ? (
        <div className="itinerary-days-container">
          {itinerary.map((dayData, index) => (
            <DayCard
              key={index}
              day={dayData.day}
              items={dayData.items}
              onSelectActivity={handleSelectActivity}
            />
          ))}
        </div>
      ) : placesToItinerize.length > 0 ? (
        <div className="itinerary-button">
          <p>Please wait while your new itinerary is being generated...</p>
        </div>
      ) : (
        <p>
          No itinerary available. Please select destinations/activities on the previous
          screen to generate one!
        </p>
      )}

      {itinerary &&
        itinerary.length > 0 &&
        !isLoading &&
        !error && (
          <p className="regenerate-prompt-message">
            Not quite what you were looking for? Feel free to try again!
            Click the "Regenerate" button below to create a new itinerary with the same
            activities you selected earlier!
          </p>
        )}

      <div className="regenerate-button-container">
        <button
          onClick={handleSubmitItinerary}
          disabled={
            isLoading ||
            !itineraryForm.destination.name ||
            !itineraryForm.duration.num ||
            itineraryForm.selectedPlaces.length === 0
          }
          className="regenerate-button"
        >
          {isLoading ? "Regenerating..." : "Regenerate ↻"}
        </button>

        <div className="help-icon-container">
          <span className="help-icon">?</span>
          <div className="help-tooltip">
            Note: while your chosen activities remain, the AI may provide different
            timings or arrangements each time you regenerate.
          </div>
        </div>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        place={selectedPlaceForPanel}
        searchQuery={searchQuery}
        destinationName={itineraryForm.destination.name}
      />
    </div>
  );
}

export default Itinerary;
