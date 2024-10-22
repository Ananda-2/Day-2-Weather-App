// API key for weather data
const API_KEY = "8e3edc304b58cc23d3a4456b68657b3c";
let currentUnit = "celsius"; // Default temperature unit
let currentWeatherData = null; // Holds current weather data
let forecastData = null; // Holds forecast data

// Convert Kelvin to Celsius
function kelvinToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(1);
}

// Convert Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
  return (((kelvin - 273.15) * 9) / 5 + 32).toFixed(1);
}

// Format a timestamp into a readable date
function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Update the displayed temperature based on the current unit
function updateTemperatureDisplay() {
  if (!currentWeatherData) return;

  // Choose the correct temperature converter based on the unit
  const converter =
    currentUnit === "celsius" ? kelvinToCelsius : kelvinToFahrenheit;
  const symbol = currentUnit === "celsius" ? "°C" : "°F";

  // Update the temperature display
  document.querySelector(".temperature").textContent = `${converter(
    currentWeatherData.main.temp
  )}${symbol}`;

  if (forecastData) {
    updateForecastDisplay();
  }
}

// Switch between Celsius and Fahrenheit
function setUnit(unit) {
  currentUnit = unit;

  // Update the active button for unit selection
  document.querySelectorAll(".unit-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.includes(unit === "celsius" ? "°C" : "°F")
    );
  });

  // Update temperature display with new unit
  updateTemperatureDisplay();
}

// Update the UI with current weather data
function updateCurrentWeather(data) {
  currentWeatherData = data;
  const weather = document.querySelector(".weather");
  const errorMsg = document.querySelector(".error-msg");

  weather.style.display = "block";
  errorMsg.style.display = "none";

  // Display city name, weather description, and other details
  document.querySelector(
    ".city"
  ).textContent = `${data.name}, ${data.sys.country}`;
  document.querySelector(".weather-description").textContent =
    data.weather[0].description;
  document.querySelector(".humidity").textContent = `${data.main.humidity}%`;
  document.querySelector(".wind").textContent = `${data.wind.speed.toFixed(
    1
  )} km/h`;
  document.querySelector(".pressure").textContent = `${data.main.pressure} hPa`;

  // Set the weather icon based on conditions
  if (data.weather[0].main == "Clouds") {
    document.querySelector(".weather-icon").src = "images/clouds.png";
  } else if (data.weather[0].main == "Clear") {
    document.querySelector(".weather-icon").src = "images/clear.png";
  } else if (data.weather[0].main == "Drizzle") {
    document.querySelector(".weather-icon").src = "images/drizzle.png";
  } else if (data.weather[0].main == "Rain") {
    document.querySelector(".weather-icon").src = "images/rain.png";
  } else if (data.weather[0].main == "Snow") {
    document.querySelector(".weather-icon").src = "images/snow.png";
  } else {
    document.querySelector(".weather-icon").src = "images/mist.png";
  }

  // Update the temperature display after new data is set
  updateTemperatureDisplay();
}

// Update the forecast display
function updateForecastDisplay() {
  if (!forecastData) return;

  const forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = "";

  const dailyData = {};

  // Group forecast data by date
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyData[date]) {
      dailyData[date] = {
        temps: [],
        icons: [],
        descriptions: [],
      };
    }
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].icons.push(item.weather[0].icon);
    dailyData[date].descriptions.push(item.weather[0].description);
  });

  // Display the forecast for the next 5 days
  Object.entries(dailyData)
    .slice(0, 5)
    .forEach(([date, data]) => {
      const avgTemp = data.temps.reduce((a, b) => a + b) / data.temps.length;
      const mostFrequentIcon = mode(data.icons);

      const converter =
        currentUnit === "celsius" ? kelvinToCelsius : kelvinToFahrenheit;
      const symbol = currentUnit === "celsius" ? "°C" : "°F";

      const dayElement = document.createElement("div");
      dayElement.className = "forecast-day";
      dayElement.innerHTML = `
            <div class="forecast-date">${formatDate(
              new Date(date).getTime() / 1000
            )}</div>
            <img class="forecast-icon" src="http://openweathermap.org/img/wn/${mostFrequentIcon}@2x.png">
            <div class="forecast-temp">${converter(avgTemp)}${symbol}</div>
        `;
      forecastContainer.appendChild(dayElement);
    });
}

// Find the most frequent element in an array
function mode(array) {
  return array
    .sort(
      (a, b) =>
        array.filter((v) => v === a).length -
        array.filter((v) => v === b).length
    )
    .pop();
}

// Search for weather data based on user input
async function searchWeather() {
  const city = document.getElementById("searchInput").value;
  if (!city) return;

  try {
    // Fetch current weather data
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
    );
    const currentData = await currentResponse.json();

    // Handle error for city not found
    if (currentData.cod === "404") {
      throw new Error("City not found");
    }

    // Fetch forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`
    );
    const forecastJson = await forecastResponse.json();

    currentWeatherData = currentData;
    forecastData = forecastJson;

    updateCurrentWeather(currentData);
    updateForecastDisplay();
  } catch (error) {
    // Show error message if city is not found or fetch fails
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error-msg").style.display = "block";
  }
}

// Listen for "Enter" key press to trigger the search
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWeather();
});

// Default thresholds for alerts
let thresholds = {
  highTemp: 30,
  lowTemp: 10,
  windSpeed: 20,
};

// Holds active weather alerts
let activeAlerts = new Set();

// Open the modal to set weather alert thresholds
function openThresholdModal() {
  const modal = document.getElementById("thresholdModal");
  document.getElementById("highTempThreshold").value = thresholds.highTemp;
  document.getElementById("lowTempThreshold").value = thresholds.lowTemp;
  document.getElementById("windSpeedThreshold").value = thresholds.windSpeed;
  modal.style.display = "flex";
}

// Close the thresholds modal
function closeThresholdModal() {
  document.getElementById("thresholdModal").style.display = "none";
}

// Save the updated threshold values and check for alerts
function saveThresholds(event) {
  event.preventDefault();
  thresholds = {
    highTemp: parseFloat(document.getElementById("highTempThreshold").value),
    lowTemp: parseFloat(document.getElementById("lowTempThreshold").value),
    windSpeed: parseFloat(document.getElementById("windSpeedThreshold").value),
  };
  closeThresholdModal();
  if (currentWeatherData) {
    checkThresholds(currentWeatherData);
  }
}

// Add an alert to the display
function addAlert(type, message, severity = "info") {
  const alertKey = `${type}-${message}`;
  if (activeAlerts.has(alertKey)) return;

  activeAlerts.add(alertKey);
  const alertsContainer = document.querySelector(".alerts-container");
  const alertElement = document.createElement("div");
  alertElement.className = `alert-item ${severity}`;
  alertElement.innerHTML = `
      <div class="alert-content">
          <div class="alert-type">${type}</div>
          <div class="alert-message">${message}</div>
      </div>
      <button class="alert-close" onclick="dismissAlert(this, '${alertKey}')">✕</button>
  `;
  alertsContainer.appendChild(alertElement);
}

// Dismiss an alert
function dismissAlert(button, alertKey) {
  const alertElement = button.parentElement;
  alertElement.remove();
  activeAlerts.delete(alertKey);
}

// Check weather data against the defined thresholds
function checkThresholds(data) {
  const temp = parseFloat(kelvinToCelsius(data.main.temp));
  const windSpeed = data.wind.speed;

  // Clear existing alerts
  document.querySelector(".alerts-container").innerHTML = "";
  activeAlerts.clear();

  // Check if temperature exceeds thresholds
  if (temp >= thresholds.highTemp) {
    addAlert(
      "High Temperature",
      `Current temperature (${temp}°C) exceeds threshold of ${thresholds.highTemp}°C`,
      "danger"
    );
  }

  if (temp <= thresholds.lowTemp) {
    addAlert(
      "Low Temperature",
      `Current temperature (${temp}°C) is below threshold of ${thresholds.lowTemp}°C`,
      "warning"
    );
  }

  // Check if wind speed exceeds threshold
  if (windSpeed >= thresholds.windSpeed) {
    addAlert(
      "High Wind Speed",
      `Current wind speed (${windSpeed.toFixed(1)} km/h) exceeds threshold of ${
        thresholds.windSpeed
      } km/h`,
      "warning"
    );
  }

  // Check for severe weather conditions
  const severeConditions = ["thunderstorm", "tornado", "hurricane"];
  const currentCondition = data.weather[0].main.toLowerCase();
  if (severeConditions.includes(currentCondition)) {
    addAlert(
      "Severe Weather",
      `Severe weather condition detected: ${data.weather[0].description}`,
      "danger"
    );
  }
}

// Extend the updateCurrentWeather function to include threshold checking
const originalUpdateCurrentWeather = updateCurrentWeather;
updateCurrentWeather = function (data) {
  originalUpdateCurrentWeather(data);
  checkThresholds(data);
};
