async function fetchWeatherData(location: string): Promise<any> {
  const apiKey = '9d90761ff55a4fada43191931242206'; // would be hidden on real production.
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=14&aqi=no&alerts=no`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
}

function calculateAverageTemperatures(data: any): { [key: string]: { avgTemp: number, fullDate: string, condition: string, icon: string } } {
  const dailyTemperatures: { [key: string]: number[] } = {};
  const dailyConditions: { [key: string]: string[] } = {};
  const dailyIcons: { [key: string]: string[] } = {};
  const fullDates: { [key: string]: string[] } = {};

  data.forecast.forecastday.forEach((day: any) => {
    const date = new Date(day.date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    if (!dailyTemperatures[dayOfWeek]) {
      dailyTemperatures[dayOfWeek] = [];
      dailyConditions[dayOfWeek] = [];
      dailyIcons[dayOfWeek] = [];
      fullDates[dayOfWeek] = [];
    }
    dailyTemperatures[dayOfWeek].push(day.day.avgtemp_c);
    dailyConditions[dayOfWeek].push(day.day.condition.text);
    dailyIcons[dayOfWeek].push(day.day.condition.icon);
    fullDates[dayOfWeek].push(day.date);
  });

  const averageTemperatures: { [key: string]: { avgTemp: number, fullDate: string, condition: string, icon: string } } = {};
  for (const day in dailyTemperatures) {
    const temperatures = dailyTemperatures[day];
    const conditions = dailyConditions[day];
    const icons = dailyIcons[day];
    const dates = fullDates[day];

    const avgTemp = temperatures.reduce((acc, curr) => acc + curr, 0) / temperatures.length;
    averageTemperatures[day] = {
      avgTemp,
      fullDate: dates[0],
      condition: conditions[0], // Assuming the condition of the first date to display
      icon: icons[0] // Assuming the icon of the first date to display
    };
  }

  return averageTemperatures;
}

function createWeatherDiv(containerId?: string) {
  const id = containerId || 'weatherContainer';
  let container = document.getElementById(id);

  if (!container) {
    // Create a container div if it doesn't exist
    container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
  }

  // Check if #weatherDiv already exists, if so, return
  if (document.getElementById('weatherDiv')) {
    return;
  }

  const div = document.createElement('div');
  div.id = 'weatherDiv';
  container.appendChild(div);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter city name or coordinates (lat,lon)';
  div.appendChild(input);

  const button = document.createElement('button');
  button.innerText = 'Get Weather';
  button.disabled = true; // Initially disable the button
  div.appendChild(button);

  const output = document.createElement('div');
  output.id = 'weatherOutput';
  div.appendChild(output);

  const styles = `
    #weatherDiv {
      font-family: Arial, sans-serif;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      margin-bottom: 20px;
      width: 90%;
      height: inherit;
    }
    #weatherDiv input[type="text"] {
      padding: 5px;
      margin-right: 10px;
      width: 200px;
    }
    #weatherDiv button {
      padding: 5px 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    }
    #weatherOutput {
      margin-top: 10px;
      display: flex;
      gap: 10px;
      overflow-y: auto;

    }
    .weatherCard {
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      padding: 10px;
      width: 100%; 
      min-width: 200px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .weatherCard h4, .weatherCard p {
      margin: 5px 0;
    }
    .weatherCard img {
      width: 50px;
      height: 50px;
    }
  `;

  // Create a style element and append it to the head
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);

  let lastSubmittedLocation: string | null = null;

  input.addEventListener('input', () => {
    const location = input.value;
    button.disabled = !location || location === lastSubmittedLocation;
  });

  button.addEventListener('click', async () => {
    const location = input.value.trim();
    if (!location || location === lastSubmittedLocation) return;

    const data = await fetchWeatherData(location);
    if (!data) {
      output.innerHTML = 'Failed to fetch weather data. Please try again.';
      return;
    }

    lastSubmittedLocation = location;

    const averageTemperatures = calculateAverageTemperatures(data);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    output.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const day = daysOfWeek[(today + i) % 7];
      const avgTemp = averageTemperatures[day].avgTemp.toFixed(2);
      const fullDate = averageTemperatures[day].fullDate;
      const condition = averageTemperatures[day].condition;
      const icon = averageTemperatures[day].icon;

      const card = document.createElement('div');
      card.className = 'weatherCard';

      const dayElement = document.createElement('h4');
      dayElement.innerText = day;
      card.appendChild(dayElement);

      const dateElement = document.createElement('p');
      dateElement.innerText = fullDate;
      card.appendChild(dateElement);

      const iconElement = document.createElement('img');
      iconElement.src = `https:${icon}`;
      card.appendChild(iconElement);

      const conditionElement = document.createElement('p');
      conditionElement.innerText = condition;
      card.appendChild(conditionElement);

      const tempElement = document.createElement('p');
      tempElement.innerText = `${avgTemp}°C`;
      card.appendChild(tempElement);

      output.appendChild(card);
    }
  });
}

const containerDiv = document.querySelector('.container');
if (!containerDiv) {
  const container = document.createElement('div');
  container.className = 'container';
  document.body.appendChild(container);
}

// Initialize the weather div
createWeatherDiv('container');