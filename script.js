const apiKey = 'YOUR_API_KEY'; //Replace with your OpenWeatherMap API key

let utterance; // Declare a variable to hold the SpeechSynthesisUtterance

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    try {
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const currentWeatherData = await currentWeatherResponse.json();

        // Fetch 5-day forecast (3-hour intervals)
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentWeatherData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please check the city name or try again later.');
    }
}

function displayCurrentWeather(data) {
    const weatherDiv = document.getElementById('currentWeather');
    const weatherInfo = `
        <h2>Current Weather in ${data.name}</h2>
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    weatherDiv.innerHTML = weatherInfo;

    // Speak the weather information
    speakWeatherInfo(data); // Pass the data instead of weatherInfo
}


function speakWeatherInfo(data) {
    // Prepare the text to be spoken
    const weatherText = `
        Current Weather in ${data.name}.
        Description: ${data.weather[0].description}.
        Temperature: ${data.main.temp} degrees Celsius.
        Humidity: ${data.main.humidity} percent.
        Wind Speed: ${data.wind.speed} meters per second.
    `.replace(/\n/g, ' '); // Replace line breaks with spaces

    // Stop previous speech if it's already speaking
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    utterance = new SpeechSynthesisUtterance(weatherText);
    window.speechSynthesis.speak(utterance);
}


function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '<h3>Hourly Forecast</h3>';
    
    const hourlyForecasts = data.list.slice(0, 8); // Show next 8 (24 hours)
    hourlyForecasts.forEach(hour => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hourly');
        hourDiv.innerHTML = `
            <span>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>${hour.main.temp}°C, ${hour.weather[0].description}</span>
        `;
        forecastDiv.appendChild(hourDiv);
    });

    // Display daily forecast
    const dailyForecasts = [];
    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        if (!dailyForecasts.some(day => day.date === date)) {
            dailyForecasts.push({
                date: date,
                temp: entry.main.temp,
                description: entry.weather[0].description
            });
        }
    });

    forecastDiv.innerHTML += '<h3>Daily Forecast</h3>';
    dailyForecasts.slice(0, 5).forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('daily');
        dayDiv.innerHTML = `
            <span>${day.date}</span>
            <span>${day.temp}°C, ${day.description}</span>
        `;
        forecastDiv.appendChild(dayDiv);
    });
}

function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const city = event.results[0][0].transcript.trim();
        const mappedCity = mapCityName(city);
        document.getElementById('cityInput').value = mappedCity;
        getWeather();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('Unable to regonize your voice. Please try again');
    };

    recognition.start();
}

function mapCityName(city) {
    // Define mappings for common mispronunciations
    const cityMapping = {
        "Sophia": "Sofia",  
        "Sophi": "Sofia",  
        "Sofia": "Sofia", 
        "Positive": "Plovdiv",
        "Vanna": "Varna",
        "Verna": "Varna",
        "Burgas": "Burgas",
        "Russ": "Ruse",
        "Ruth": "Ruse",
        "Stara Zagora": "Stara Zagora",
        "Satus Zagora": "Stara Zagora",
        "Start a agora": "Stara Zagora",
        "Status ago": "Stara Zagora",
        "Start Zagora": "Stara Zagora",
        "Status of agora": "Stara Zagora",
        "Pleven": "Pleven",
        "11": "Pleven",
        "Slaven": "Sliven",
        "Dobrich": "Dobrich",
        "Showman": "Shumen",
        "High school": "Haskovo",
        "Yambo": "Yambol",
        "Borat": "Blagoevgrad",
        "Vel": "Veliko Tarnovo", 
        "Montana": "Montana",
        "Rara": "Razgrad",
        "Vision": "Vidin",
        "Video": "Vision",
        "Woolwich": "Lovech",
        "Kristen": "Kjustendil",
        "Smaller": "Smolyan",
        "Small": "Smolyan",
        // Add other common city name mappings as needed
    };

    // Return the mapped city name or the original if not found
    return cityMapping[city] || city;
}

// Function to stop the speech synthesis
function stopSpeech() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
}
