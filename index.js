// https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=8e3edc304b58cc23d3a4456b68657b3c
var city;
var apiKey = "8e3edc304b58cc23d3a4456b68657b3c";
var apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric";

async function checkWeather() {
  const response = await fetch(apiUrl + `&appid=${apiKey}`);

  if (response.status == 404) {
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error-msg").style.display = "block";
  }
    else {
    var data = await response.json();
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".tempare").innerHTML =
      Math.round(data.main.temp) + " °C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + " %";
    document.querySelector(".wind").innerHTML = data.wind.speed + " Km/h";

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
    } else document.querySelector(".weather-icon").src = "images/mist.png";

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error-msg").style.display = "none";
  }
}

function getCity() {
  city = document.getElementById("searchSpace").value;
  apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric";

  checkWeather();

  console.log(city);
}
