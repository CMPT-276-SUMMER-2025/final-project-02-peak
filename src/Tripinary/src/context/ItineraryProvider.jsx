import React, { useState, useCallback, useEffect } from 'react';
import ItineraryContext from './ItineraryContext.jsx';

// Define the initial state structure
const initialItineraryForm = {
  destination: {
    name: null, // ex. "Vancouver"
    address: null // ex. "Vancouver, B.C., Canada"
  },
  duration: {
    num: 0,
    timeType: null // could be "hours", "days", "weeks"
  },
  selectedPlaces: [],
  generatedItinerary: null,  
  isLoadingItinerary: false,  
  itineraryError: null,     
};

function ItineraryProvider({ children }) {
  const [itineraryForm, setItineraryForm] = useState(() => {
    try {
      const storedForm = sessionStorage.getItem('tripinaryItineraryForm');
      return storedForm ? JSON.parse(storedForm) : initialItineraryForm;
    } catch (error) {
      console.error("Failed to load itineraryForm from sessionStorage:", error);
      return initialItineraryForm;
    }
  });

  // Grab itiniraryForm from SessionStorage if it exists
  // Dependency on itineraryForm -> Run this useEffect everytime itineraryForm changes
  // Returns null
  useEffect(() => {
    try {
      sessionStorage.setItem('tripinaryItineraryForm', JSON.stringify(itineraryForm));
    } catch (error) {
      console.error("Failed to save itineraryForm to sessionStorage:", error);
    }
  }, [itineraryForm]);
  
  // Update destination name on the itineraryForm and keep the other attributes
  // Returns null
  const updateDestinationName = useCallback((name, address) => {
    setItineraryForm(prevForm => ({
      ...prevForm,
      destination: {
        name: name,
        address: address
      }
    }));
  }, []);

  // Update duration on the itineraryForm and keep the other attributes
  // Returns null
  const updateDuration = useCallback((num, timeType) => {
    setItineraryForm(prevForm => ({
      ...prevForm,
      duration: {
        num: num,
        timeType: timeType
      }
    }));
  }, []);

  // Add selected POIs from list to selectedPlaces on itineraryForm
  // If it already exists, return itineraryForm else add POI.
  // Returns null
  const addSelectedPlace = useCallback((place) => {
    setItineraryForm(prevForm => {
      if (prevForm.selectedPlaces.some(p => p.id === place.id)) {
        return prevForm;
      }
      return {
        ...prevForm,
        selectedPlaces: [...prevForm.selectedPlaces, place]
      };
    });
  }, []);

  // Remove POI from selectedPlaces based on their placeId.
  // Returns null
  const removeSelectedPlace = useCallback((placeId) => {
    setItineraryForm(prevForm => ({
      ...prevForm,
      selectedPlaces: prevForm.selectedPlaces.filter(place => place.id !== placeId)
    }));
  }, []);

  // Checks if a POI is in selectedPlaces
  // Returns True/False
  const isPlaceInForm = useCallback((placeId) => {
    return itineraryForm.selectedPlaces.some(place => place.id === placeId);
  }, [itineraryForm.selectedPlaces]);

  // Sets itineraryForm to initialItineraryForm and removes it from SessionStorage
  // Returns null
  const clearItineraryForm = useCallback(() => {
    setItineraryForm(initialItineraryForm); 
    sessionStorage.removeItem('tripinaryItineraryForm');
  }, []);

  // Store generated itinerary in itineraryForm
  const setGeneratedItinerary = useCallback((itineraryData) => { // for itinerary data
    setItineraryForm(prevForm => ({
      ...prevForm,
      generatedItinerary: itineraryData,
      isLoadingItinerary: false,
      itineraryError: null,   
    }));
  }, []);

  const setIsLoadingItinerary = useCallback((isLoading) => {
    setItineraryForm(prevForm => ({
      ...prevForm,
      isLoadingItinerary: isLoading,
      itineraryError: null,
    }));
  }, []);

  const setItineraryError = useCallback((error) => {
    setItineraryForm(prevForm => ({
      ...prevForm,
      itineraryError: error,
      isLoadingItinerary: false,
      generatedItinerary: null,
    }));
  }, []);

  const contextValue = {
    itineraryForm,
    setItineraryForm, 
    updateDestinationName,
    updateDuration,
    addSelectedPlace,
    removeSelectedPlace,
    isPlaceInForm,
    clearItineraryForm,
    setGeneratedItinerary,   
    setIsLoadingItinerary, 
    setItineraryError
  };

  return (
    <ItineraryContext.Provider value={contextValue}>
      {children}
    </ItineraryContext.Provider>
  );
}

export default ItineraryProvider;
