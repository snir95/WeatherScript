// src/index.ts
const apiKey = 'b9f2ff7ebfc299723cc81f38223b72ef'; 

// Function to fetch weather data
async function fetchWeatherData(location: string): Promise<any> {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
}

// Function to calculate the average temperature for each day of the week for the next 2 weeks
function calculateAverageTemperatures(data: any): { [key: string]: number } {
  const weeklyData: { [key: string]: number[] } = {};
  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!weeklyData[day]) {
      weeklyData[day] = [];
    }
    weeklyData[day].push(item.main.temp - 273.15); // Convert from Kelvin to Celsius
  });

  const averageTemperatures: { [key: string]: number } = {};
  for (const day in weeklyData) {
    const temps = weeklyData[day];
    const averageTemp = temps.reduce((acc, curr) => acc + curr, 0) / temps.length;
    averageTemperatures[day] = averageTemp;
  }
  return averageTemperatures;
}

// Function to create the weather div and append to the specified container
function createWeatherDiv(containerId?: string) {
  const container = containerId ? document.getElementById(containerId) : document.body;
  if (!container) return;

  const div = document.createElement('div');
  div.id = 'weatherDiv';
  container.appendChild(div);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter city name';
  div.appendChild(input);

  const button = document.createElement('button');
  button.innerText = 'Get Weather';
  div.appendChild(button);

  const output = document.createElement('div');
  output.id = 'weatherOutput';
  div.appendChild(output);

  button.addEventListener('click', async () => {
    const location = input.value;
    if (!location) return;

    const data = await fetchWeatherData(location);
    if (!data) {
      output.innerHTML = 'Failed to fetch weather data. Please try again.';
      return;
    }

    const averageTemperatures = calculateAverageTemperatures(data);

    output.innerHTML = '';
    for (const day in averageTemperatures) {
      const p = document.createElement('p');
      p.innerText = `${day}: ${averageTemperatures[day].toFixed(2)}°C`;
      output.appendChild(p);
    }
  });
}

// Expose the createWeatherDiv function to the global window object
(window as any).createWeatherDiv = createWeatherDiv;
