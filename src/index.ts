async function fetchWeatherData(location: string): Promise<any> {
  const apiKey = "9d90761ff55a4fada43191931242206";
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=14&aqi=no&alerts=no`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

function createWeatherDiv(containerId?: string) {
  if (!containerId) return;
  let container = document.getElementById(containerId);

  if (!container) {
    // Create a container div if it doesn't exist
    container = document.createElement("div");
    container.id = containerId || "weatherContainer"; // Use provided ID or a default ID
    document.body.appendChild(container);
  }

  // Check if #weatherDiv already exists, if so, return
  if (document.getElementById("weatherDiv")) {
    return;
  }

  const div = document.createElement("div");
  div.id = "weatherDiv";
  container.appendChild(div);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter city name";
  div.appendChild(input);

  const button = document.createElement("button");
  button.innerText = "Get Weather";
  div.appendChild(button);

  const output = document.createElement("div");
  output.id = "weatherOutput";
  div.appendChild(output);

  const styles = `
    #weatherDiv {
      font-family: Arial, sans-serif;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      margin-bottom: 20px;
      overflow-x: scroll;
      white-space: nowrap;
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
      flex-wrap: wrap;
      gap: 10px;
    }
    .weatherCard {
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
      padding: 10px;
      width: 150px;
    }
    .weatherCard h4, .weatherCard p {
      margin: 5px 0;
    }
  `;

  // Create a style element and append it to the head
  const styleElement = document.createElement("style");
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);

  button.addEventListener("click", async () => {
    const location = input.value;
    if (!location) return;

    const data = await fetchWeatherData(location);
    if (!data) {
      output.innerHTML = "Failed to fetch weather data. Please try again.";
      return;
    }

    output.innerHTML = "";
    data.forecast.forecastday.forEach((day: any) => {
      const date = new Date(day.date);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
      const fullDate = date.toLocaleDateString("en-US");
      const temperature = day.day.avgtemp_c.toFixed(2);
      const condition = day.day.condition.text; 

      const card = document.createElement("div");
      card.className = "weatherCard";

      const dayElement = document.createElement("h4");
      dayElement.innerText = dayOfWeek;
      card.appendChild(dayElement);

      const dateElement = document.createElement("p");
      dateElement.innerText = fullDate;
      card.appendChild(dateElement);

      const conditionElement = document.createElement("p");
      conditionElement.innerText = condition;
      card.appendChild(conditionElement);

      const tempElement = document.createElement("p");
      tempElement.innerText = `${temperature}°C`;
      card.appendChild(tempElement);

      output.appendChild(card);
    });
  });
}

const containerDiv = document.querySelector(".container");
if (!containerDiv) {
  const container = document.createElement("div");
  container.className = "container";
  document.body.appendChild(container);
}

// Initialize the weather div
createWeatherDiv("container");


// todo : 
//  1.make the div affected by its given size - width +height
//    a.make the scroll-x again 
//  2.add a picture to each condition?
//  3.disable or do nothing when form isnt dirty.
//  4.add warning for wrong city name 
//    a.maybe make an enum of possible city names 
//  5.make a defense for the option of other divs overlaps