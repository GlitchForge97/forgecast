// Create particle system for global background
function createParticleSystem() {
  const particleSystem = document.getElementById('particleSystem');
  particleSystem.innerHTML = ''; // Clear existing particles

  const particleTypes = ['', 'triangle', 'square'];
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    particle.className = `particle ${type}`;

    if (type === '') {
      particle.style.width = Math.random() * 8 + 4 + 'px';
      particle.style.height = particle.style.width;
    }

    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 15 + 15) + 's';

    particleSystem.appendChild(particle);
  }
}

// Create weather-specific particles for the main weather card
function createWeatherCardParticles(weatherType = 'default') {
  const cardParticleSystem = document.getElementById('weatherCardParticles');
  cardParticleSystem.innerHTML = ''; // Clear existing particles

  let particleTypes, particleCount;

  switch(weatherType) {
    case 'sunny':
      particleTypes = ['sun-ray'];
      particleCount = 8;
      break;
    case 'rainy':
      particleTypes = ['rain-drop'];
      particleCount = 15;
      break;
    case 'snowy':
      particleTypes = ['snow-flake'];
      particleCount = 12;
      break;
    case 'cloudy':
    case 'partly-cloudy':
      particleTypes = ['cloud-puff'];
      particleCount = 6;
      break;
    case 'stormy':
      particleTypes = ['rain-drop', 'lightning-bolt'];
      particleCount = 18;
      break;
    default:
      return; // No particles for default
  }

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    particle.className = `card-particle ${type}`;

    particle.style.left = Math.random() * 90 + 5 + '%';
    particle.style.top = Math.random() * 20 + '%';

    if (type === 'lightning-bolt') {
      // Lightning particles flash randomly
      particle.style.animationDelay = Math.random() * 5 + 's';

      // Create random lightning flashes
      setInterval(() => {
        if (Math.random() < 0.15) { // 15% chance every interval
          particle.style.animation = 'none';
          setTimeout(() => {
            particle.style.animation = 'lightningFlicker 0.3s ease-in-out';
          }, 10);
        }
      }, 3000);
    } else {
      particle.style.animationDelay = Math.random() * 4 + 's';
    }

    cardParticleSystem.appendChild(particle);
  }
}

// Update weather card based on weather condition
function updateWeatherCard(weatherCondition) {
  const mainWeatherCard = document.getElementById('mainWeatherCard');

  // Remove existing weather classes
  mainWeatherCard.classList.remove('sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy', 'snowy');

  // Add appropriate weather class
  const weatherClass = weatherCondition.toLowerCase().replace(/\s+/g, '-');
  mainWeatherCard.classList.add(weatherClass);

  // Update weather card particle system
  createWeatherCardParticles(weatherCondition.toLowerCase().replace(/\s+/g, ''));
}

// Weather data generation and handling
async function initiateWeatherScan() {
  const loadingScreen = document.getElementById('loadingScreen');
  const heroSection = document.getElementById('heroSection');
  const weatherDashboard = document.getElementById('weatherDashboard');
  const analysisSection = document.getElementById('analysisSection');
  const loadingText = document.getElementById('loadingText');

  // Show loading screen
  loadingScreen.style.display = 'flex';

  const loadingSteps = [
    'INITIALIZING WEATHER SCAN...',
    'ACCESSING SATELLITE DATA...',
    'ANALYZING ATMOSPHERIC CONDITIONS...',
    'PROCESSING METEOROLOGICAL DATA...',
    'GENERATING DETAILED ANALYSIS...'
  ];

  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex < loadingSteps.length) {
      loadingText.textContent = loadingSteps[stepIndex];
      stepIndex++;
    } else {
      clearInterval(stepInterval);
    }
  }, 800);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const locationData = await getLocationName(lat, lon);
          const weatherData = await generateAdvancedWeatherData(lat, lon, locationData);

          setTimeout(() => {
            updateWeatherDisplay(weatherData);
            updateAnalysisCharts(weatherData);

            loadingScreen.style.display = 'none';
            heroSection.style.display = 'none';
            weatherDashboard.style.display = 'block';
            analysisSection.style.display = 'block';
          }, 4000);
        } catch (error) {
          const sampleData = generateAdvancedWeatherData(lat, lon);

          setTimeout(() => {
            updateWeatherDisplay(sampleData);
            updateAnalysisCharts(sampleData);

            loadingScreen.style.display = 'none';
            heroSection.style.display = 'none';
            weatherDashboard.style.display = 'block';
            analysisSection.style.display = 'block';
          }, 4000);
        }
      },
      (error) => {
        setTimeout(() => {
          const defaultData = generateAdvancedWeatherData(37.7749, -122.4194);
          updateWeatherDisplay(defaultData);
          updateAnalysisCharts(defaultData);

          loadingScreen.style.display = 'none';
          heroSection.style.display = 'none';
          weatherDashboard.style.display = 'block';
          analysisSection.style.display = 'block';
        }, 4000);
      }
    );
  }
}

async function getLocationName(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
    const data = await response.json();

    const address = data.address || {};
    const city = address.city || address.town || address.village || 'Unknown City';
    const country = address.country || 'Unknown Country';
    const state = address.state || '';

    return {
      fullAddress: state ? `${city}, ${state}` : `${city}, ${country}`
    };
  } catch (error) {
    return {
      fullAddress: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
    };
  }
}

function generateAdvancedWeatherData(lat, lon, locationData = null) {
  const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy', 'stormy', 'snowy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

  // Temperature based on latitude
  const baseTemp = Math.max(30, Math.min(90, 70 - Math.abs(lat - 25) * 0.8));
  const tempVariation = Math.floor(Math.random() * 20) - 10;
  const currentTemp = Math.round(baseTemp + tempVariation);

  const location = locationData ? locationData.fullAddress : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

  return {
    location: location,
    temperature: currentTemp,
    description: randomCondition,
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    feelsLike: currentTemp + Math.floor(Math.random() * 10) - 5,
    visibility: Math.floor(Math.random() * 10) + 5,
    pressure: Math.floor(Math.random() * 50) + 1000,
    uvIndex: Math.floor(Math.random() * 11),
    aqi: Math.floor(Math.random() * 150) + 50,
    forecast: generateForecast(),
    hourlyData: generateHourlyData(currentTemp),
    analysis: generateDetailedAnalysis(randomCondition, currentTemp)
  };
}

function generateForecast() {
  const conditions = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️'];
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];

  return days.map(day => ({
    day: day,
    icon: conditions[Math.floor(Math.random() * conditions.length)],
    temp: `${Math.floor(Math.random() * 15) + 65}°/${Math.floor(Math.random() * 15) + 45}°`
  }));
}

function generateHourlyData(baseTemp) {
  return {
    pressure: Array.from({length: 8}, () => Math.floor(Math.random() * 50) + 1000),
    uv: Array.from({length: 8}, () => Math.floor(Math.random() * 11)),
    aqi: Array.from({length: 8}, () => Math.floor(Math.random() * 150) + 50),
    precipitation: Array.from({length: 8}, () => Math.floor(Math.random() * 100)),
    wind: Array.from({length: 8}, () => Math.floor(Math.random() * 25) + 5),
    temperature: Array.from({length: 8}, (_, i) => {
      const variation = Math.sin((i / 8) * Math.PI) * 8;
      return Math.round(baseTemp + variation + (Math.random() * 4 - 2));
    })
  };
}

function generateDetailedAnalysis(condition, temp) {
  return {
    pressure: `Current atmospheric pressure shows ${Math.random() > 0.5 ? 'stable' : 'fluctuating'} conditions with ${Math.random() > 0.5 ? 'high' : 'low'} pressure system influence affecting regional weather patterns.`,
    uv: `UV radiation levels are ${temp > 75 ? 'elevated' : 'moderate'} today. ${temp > 80 ? 'Sun protection recommended' : 'Normal outdoor activities safe'} with current atmospheric conditions.`,
    aqi: `Air quality analysis indicates ${Math.random() > 0.5 ? 'good' : 'moderate'} conditions with particle concentrations within ${Math.random() > 0.5 ? 'acceptable' : 'elevated'} ranges for the region.`,
    precipitation: `Precipitation probability analysis shows ${condition.includes('rain') ? 'high likelihood' : 'low probability'} of rainfall with moisture levels ${Math.random() > 0.5 ? 'increasing' : 'stable'} throughout the day.`,
    wind: `Wind pattern analysis reveals ${Math.random() > 0.5 ? 'consistent' : 'variable'} directional flow with gusts potentially reaching elevated speeds during peak hours.`,
    temperature: `Temperature variance tracking shows ${Math.abs(temp - 70) > 10 ? 'significant' : 'moderate'} deviation from seasonal averages with thermal stability ${Math.random() > 0.5 ? 'maintained' : 'fluctuating'}.`
  };
}

function updateWeatherDisplay(data) {
  document.getElementById('locationText').textContent = data.location;
  document.getElementById('temperatureDisplay').textContent = `${data.temperature}°`;
  document.getElementById('weatherCondition').textContent = data.description.toUpperCase();

  document.getElementById('humidityValue').textContent = `${data.humidity}%`;
  document.getElementById('windValue').textContent = `${data.windSpeed} mph`;
  document.getElementById('feelsLikeValue').textContent = `${data.feelsLike}°`;
  document.getElementById('visibilityValue').textContent = `${data.visibility} mi`;

  // Update weather card based on weather condition
  updateWeatherCard(data.description);

  // Update forecast
  const forecastList = document.getElementById('forecastList');
  forecastList.innerHTML = '';
  data.forecast.forEach(item => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    forecastItem.innerHTML = `
                    <span class="forecast-day">${item.day}</span>
                    <span class="forecast-icon">${item.icon}</span>
                    <span class="forecast-temp">${item.temp}</span>
                `;
    forecastList.appendChild(forecastItem);
  });

  // Update quick stats
  document.getElementById('quickStatsText').textContent = 
    `Pressure: ${data.pressure} hPa • UV Index: ${data.uvIndex} • AQI: ${data.aqi}`;
}

function updateAnalysisCharts(data) {
  const charts = ['pressureChart', 'uvChart', 'aqiChart', 'precipChart', 'windChart', 'tempChart'];
  const dataKeys = ['pressure', 'uv', 'aqi', 'precipitation', 'wind', 'temperature'];
  const progressBars = ['pressureProgress', 'uvProgress', 'aqiProgress', 'precipProgress', 'windProgress', 'tempProgress'];
  const analysisTexts = ['pressureAnalysis', 'uvAnalysis', 'aqiAnalysis', 'precipAnalysis', 'windAnalysis', 'tempAnalysis'];
  const labels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM', '3AM'];

  charts.forEach((chartId, index) => {
    const chart = document.getElementById(chartId);
    const progressBar = document.getElementById(progressBars[index]);
    const analysisText = document.getElementById(analysisTexts[index]);

    chart.innerHTML = '';

    const chartData = data.hourlyData[dataKeys[index]];
    const maxValue = Math.max(...chartData);

    chartData.forEach((value, i) => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      const height = (value / maxValue) * 150;
      bar.style.setProperty('--bar-height', height + 'px');
      bar.style.height = height + 'px';
      bar.innerHTML = `<div class="chart-label">${labels[i]}</div>`;
      chart.appendChild(bar);
    });

    // Animate progress bars
    setTimeout(() => {
      const progressValue = Math.floor(Math.random() * 100) + 1;
      progressBar.style.width = progressValue + '%';
    }, index * 200);

    // Update analysis text
    analysisText.textContent = data.analysis[dataKeys[index]];
  });
}

// Event listeners
document.getElementById('scanButton').addEventListener('click', initiateWeatherScan);

// Initialize
window.addEventListener('load', () => {
  createParticleSystem();
});
