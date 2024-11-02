const apiKey = 'c0c131a463483ec3eb7a57ca10f52ea2';  // Replace with your OpenWeatherMap API key

function getWeather() {
    const city = document.getElementById('cityInput').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {  // API success response
                document.getElementById('city').innerText = `Weather in ${data.name}`;
                document.getElementById('description').innerText = `Conditions: ${data.weather[0].description}`;
                document.getElementById('temperature').innerText = `Temperature: ${data.main.temp} °C`;
                document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}
