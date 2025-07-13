import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Weather() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  const API_KEY = '760d1ad2846911ae8877a7e08d8634eb';

  // ✅ Fetch weather by city name
  const fetchWeatherByCity = async (rawCity = city) => {
    const cityName = rawCity.trim().toLowerCase();
    if (!cityName) {
      setError('Please enter a valid city name.');
      setWeatherData(null);
      return;
    }

    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;

    try {
      setLoading(true);
      const response = await axios.get(URL);
      setWeatherData(response.data);
      setError('');
      localStorage.setItem('lastCity', cityName);
      updateBackgroundColor(response.data.weather[0].main);
    } catch (err) {
      setError('City not found or API error.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
      setLoading(true);
      const response = await axios.get(URL);
      setWeatherData(response.data);
      setCity(response.data.name); // set city input box too
      localStorage.setItem('lastCity', response.data.name.toLowerCase());
      updateBackgroundColor(response.data.weather[0].main);
      setError('');
    } catch (err) {
      setError('Location error or API failure.');
    } finally {
      setLoading(false);
    }
  };

  const updateBackgroundColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        setBgColor('#ffe57f');
        break;
      case 'clouds':
        setBgColor('#d3d3d3');
        break;
      case 'rain':
        setBgColor('#a3c0f7');
        break;
      case 'thunderstorm':
        setBgColor('#9b59b6');
        break;
      case 'snow':
        setBgColor('#f0f8ff');
        break;
      default:
        setBgColor('#ffffff');
    }
  };

  // ✅ Auto detect location or use lastCity
  useEffect(() => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
      fetchWeatherByCity(savedCity);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          setError('Unable to access location. Please search manually.');
        }
      );
    }
  }, []);

  // ✅ Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchWeatherByCity(city);
    }
  };

  return (
    <div className="weather-container" style={{ backgroundColor: bgColor }}>
      <h1>🌤️ Weather App</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => fetchWeatherByCity(city)}>Get Weather</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weatherData && (
        <div className="result">
          <h2>{weatherData.name}, {weatherData.sys.country}</h2>
          <img
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
          <p><strong>{weatherData.weather[0].main}</strong> — {weatherData.weather[0].description}</p>
          <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
          <p><strong>Humidity:</strong> {weatherData.main.humidity}%</p>
        </div>
      )}
    </div>
  );
}

export default Weather;
