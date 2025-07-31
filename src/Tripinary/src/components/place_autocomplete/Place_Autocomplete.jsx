import React, { useRef, useCallback } from "react";
import { LoadScript, Autocomplete, GoogleMap } from "@react-google-maps/api";

const libraries = ["places"];

const options = {
  types: ["(cities)"],
};

const Place_AutoComplete = ({ onPlaceSelected }) => {
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      console.log(place)
      onPlaceSelected?.(place);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      version="beta"
    >
      <Autocomplete
        onLoad={(auto) => (autocompleteRef.current = auto)}
        onPlaceChanged={handlePlaceChanged}
        options={options}
      >
        <input
          type="text"
          placeholder="Enter a city"
          style={{
            width: "200px",
            padding: "5px",
            fontSize: "14px",
          }}
        />
      </Autocomplete>
    </LoadScript>
  );
};

export default Place_AutoComplete;
