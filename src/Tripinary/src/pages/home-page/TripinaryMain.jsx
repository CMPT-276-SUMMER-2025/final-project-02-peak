import { React, useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Place_AutoComplete from "../../components/place_autocomplete/Place_Autocomplete";
import Activity_Suggestions from "../activity-suggestions/activity_suggestions";

import ItineraryContext from "../../context/ItineraryContext";
import PoisContext from "../../context/PoisContext";

import categoryTypes from "../../assets/category_types.json";
import "./TripinaryMain.css";

const TripinaryMain = () => {

  const navigate = useNavigate();

  const [clicked, setClick] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timeType, setTimeType] = useState("days");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const {
    itineraryForm,
    updateDestinationName,
    updateDuration,
    clearItineraryForm,
    setGeneratedItinerary,
    setIsLoadingItinerary,   
    setItineraryError       
  } = useContext(ItineraryContext);

  const { pois, findPois, deletePois, isPoisEmpty, notification, isVisible } = useContext(PoisContext);

  useEffect(() => {
    if (!isPoisEmpty()) {
      setClick(true);
    }
  }, [isPoisEmpty]);

  // Find all points of interest around selectedPlace.
  // 1. Grab latitude & longitude of selectedPlace
  // 2. Delete current pois list and clear current itineraryForm if occupied
  // 3. For each category in categoryTypes, make API call to find places in that category
  // 4. Store results to pois list
  // 5. Update duration and type of time of user input.
  const handleSubmitDestination = (e) => {
    e.preventDefault();

    if(selectedPlace === null && duration === 0) {
      alert("Please enter a city or increase the trip duration.");
      return;
    }
    
    if (selectedPlace && selectedPlace.geometry) {
      setClick(true);
      
      const location = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      };

      deletePois(); 
      clearItineraryForm();

      for (const category in categoryTypes) {
        if (categoryTypes.hasOwnProperty(category)) {
          findPois(location, category, categoryTypes[category]);
        }
      }  

      updateDestinationName((selectedPlace.displayName?.text || selectedPlace.name), selectedPlace.formatted_address)
      updateDuration(Number(duration), timeType);
    } else {
      console.warn("No place selected or invalid place data.");
      alert("Please select a valid destination using the autocomplete search and enter a duration."); // Provide user feedback
      setClick(false);
    }
  };

  const handleSubmitItinerary = async (e) => {
    e.preventDefault(); 

    if (!itineraryForm.destination.name|| !itineraryForm.duration.num || itineraryForm.selectedPlaces.length === 0) {
      alert("Please ensure you have selected a destination, duration, and at least one activity before generating the itinerary.");
      return;
    }

    setIsLoadingItinerary(true);
    setItineraryError(null);

    try {
      const response = await fetch("http://localhost:5000/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedPlaces: itineraryForm.selectedPlaces,
          destinationName: itineraryForm.destination.name,
          duration: itineraryForm.duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error from backend.' }));
        throw new Error(`Backend error! Status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      setGeneratedItinerary(data); 
      
      navigate('/itinerary');

    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      setItineraryError(err.message);
      alert(`Error generating itinerary: ${err.message}`); 
    } finally {
    }
  };

  return (
    <div className="tripinarymain">
      <div className="form">
        <h1>TRIPINARY</h1>
        <h4>EASY. PERSONALIZED. EFFICIENT.</h4>
        <p>First, tell us your target city and trip duration.</p>
        <p>Then click the “Plan My Trip!” button to kick off your adventure!</p>

        <div className="user-input">
          <div className="city-box">
            <h5>Destination</h5>
            <Place_AutoComplete
              onPlaceSelected={(place) => {
                setSelectedPlace(place);
              }}
            />
          </div>
          <div className="number-box">
            <h5>Trip Duration</h5>
            <input
              type="number"
              className="number-input"
              placeholder="Enter a number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <select 
              className="drop-down"
              value={timeType}
              onChange={(e) => setTimeType(e.target.value)}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
          <div className="itinerary-button">
            <button
              type="button"
              className="enter-button"
              onClick={(e) => handleSubmitDestination(e)}
            >
              Plan My Trip!
            </button>
          </div>
        </div>
      </div>
      <div className="activity-suggestions-wrapper">
        <AnimatePresence>
          {clicked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              <Activity_Suggestions key={"activity_suggestions"} pois={pois} destination={itineraryForm.destination.name} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="submit_area">
        <p>{itineraryForm.selectedPlaces.length} Destinations Selected</p>
        <button
          onClick={(e) => handleSubmitItinerary(e)}
          disabled={
            itineraryForm.isLoadingItinerary ||    
            !itineraryForm.destination.name ||        
            !itineraryForm.duration.num ||          
            itineraryForm.selectedPlaces.length === 0 
          }
        >
          {itineraryForm.isLoadingItinerary ? "Generating Itinerary..." : "Generate Itinerary"}
        </button>
      </div>
      <div className={`global-notification ${isVisible ? 'show' : ''} ${notification.type}`}>
        {notification.message}
      </div>
    </div>
  );
};

export default TripinaryMain;
