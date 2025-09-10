import React, { useState, useEffect } from "react";
import "./Landing.css";
import { useNavigate } from "react-router-dom";

function Landing() {
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMethod, setLocationMethod] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  const navigate = useNavigate();

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        fetchLocations(query);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchLocations = async (text) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&apiKey=7eba5dd3b8dc4e28bf0d65986e96d262`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        setSuggestions(
          data.features.map((f) => ({
            name: f.properties.formatted,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          }))
        );
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported");
      return;
    }
    setLocationStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=7eba5dd3b8dc4e28bf0d65986e96d262`
          );
          const data = await res.json();
          if (data.features?.length > 0) {
            const addr = data.features[0].properties.formatted;
            setSelectedLocation({ name: addr, lat: latitude, lng: longitude });
            setLocationStatus(`📍 Your Location: ${addr}`);
          } else {
            setLocationStatus("Unable to get location name");
          }
        } catch (err) {
          console.error(err);
          setLocationStatus("Failed to get location");
        }
      },
      (err) => {
        setLocationStatus("Location error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const canProceed = selectedLanguage && selectedLocation;

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (!canProceed) {
      alert("Please select both language and location before continuing.");
      return;
    }
    // Save to localStorage
    localStorage.setItem("farmAssistLanguage", selectedLanguage);
    localStorage.setItem("farmAssistLocation", JSON.stringify(selectedLocation));
    // Navigate
    navigate("/home");
  };

  return (
    <div className="container">
      <div className="main-wrapper">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo">
            <span className="logo-text">FA</span>
          </div>
          <h1 className="title">Farm Assist</h1>
        </div>

        {/* Main Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Welcome to Farm Assist</h2>
            <p className="card-description">
              Get instant agricultural advice tailored for you.
            </p>
          </div>
          <div className="card-content">
            {/* Language */}
            <div className="form-group">
              <label htmlFor="language">Choose Language:</label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="select"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="bengali">Bengali</option>
                <option value="marathi">Marathi</option>
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Select Location:</label>
              <div className="button-group">
                <button
                  className={`btn btn-outline ${
                    locationMethod === "search" ? "active" : ""
                  }`}
                  onClick={() => setLocationMethod("search")}
                >
                  Search Location
                </button>
                <button
                  className={`btn btn-outline ${
                    locationMethod === "live" ? "active" : ""
                  }`}
                  onClick={() => setLocationMethod("live")}
                >
                  Use Live Location
                </button>
              </div>

              {/* Search Section */}
              {locationMethod === "search" && (
                <div className="location-section">
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        placeholder="Type to search for your location..."
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      {loading && <div className="loader">Loading...</div>}
                    </div>
                    {suggestions.length > 0 && (
                      <div className="suggestions">
                        {suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="suggestion-item"
                            onClick={() => {
                              setSelectedLocation(s);
                              setQuery(s.name);
                              setSuggestions([]);
                            }}
                          >
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Section */}
              {locationMethod === "live" && (
                <div className="location-section">
                  <div className="location-status">
                    <button
                      className="btn btn-outline full-width"
                      onClick={handleLiveLocation}
                    >
                      Get My Current Location
                    </button>
                    {locationStatus && <p>{locationStatus}</p>}
                  </div>
                </div>
              )}

              {/* Selected Location */}
              {selectedLocation && (
                <div className="selected-location">
                  <p className="location-label">Selected Location:</p>
                  <p className="location-name">{selectedLocation.name}</p>
                </div>
              )}
            </div>

            {/* Get Started */}
            <button
              className={`btn btn-primary full-width ${
                !canProceed ? "disabled" : ""
              }`}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
