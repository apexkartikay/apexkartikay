// index.js
require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const MUSTACHE_MAIN_DIR = './main.mustache';

/**
  * DATA is the object that contains
  * the data to be provided to Mustache
  * (the refresh time).
*/
let DATA = {
  refreshTime: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Asia/Kolkata',
  }),
};

/**
  * Here is the temperature
  * of New Delhi city
*/
async function setWeatherInformation() {
  if (!process.env.OPEN_WEATHER_MAP_KEY) {
    return;
  }
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=New%20Delhi&units=metric&appid=${process.env.OPEN_WEATHER_MAP_KEY}`
    );
    const r = await response.json();
    if (r && r.weather && r.weather[0] && r.main) {
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.feels_like_temp = Math.round(r.main.feels_like);
      DATA.city_weather = r.weather[0].description;
      DATA.weather_icon = 'http://openweathermap.org/img/w/' + r.weather[0].icon + '.png';
      DATA.humidity = r.main.humidity;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      });
    }
  } catch (err) {
    console.error('Failed to fetch weather information:', err.message);
  }
}

/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  /**
   * Fetch weather
   */
  await setWeatherInformation();
  
  /**
   * Generate README
   */
  generateReadMe();
}
action();