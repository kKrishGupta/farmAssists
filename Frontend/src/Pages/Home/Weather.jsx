import { useState } from "react";
import axios from "axios";

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    setLoading(true);
    try {
      // hardcoded location for now; you can replace with geolocation
      const res = await axios.get("/api/weather?lat=10.85&lon=76.27");
      setWeather(res.data.weather);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">🌦 Weather</h2>
      <button
        onClick={getWeather}
        className="px-3 py-1 bg-green-600 text-white rounded-md"
      >
        {loading ? "Loading..." : "Get Weather"}
      </button>
      {weather && (
        <div className="mt-3">
          <p>Temp: {weather.temperature}°C</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>{weather.description}</p>
          <p className="text-xs text-gray-500">Provider: {weather.provider}</p>
        </div>
      )}
    </div>
  );
}
