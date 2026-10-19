// index.js
require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const MUSTACHE_MAIN_DIR = './main.mustache';

/**
 * DATA is the object that contains
 * the data to be provided to Mustache
 * (the refresh time and weather).
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
 * Weather of New Delhi (or configured city)
 */
async function setWeatherInformation() {
  if (!process.env.OPEN_WEATHER_MAP_KEY) {
    console.log('No OPEN_WEATHER_MAP_KEY provided, generating profile without weather widget.');
    return;
  }

  try {
    const cityName = process.env.WEATHER_CITY || 'New Delhi';
    const timeZone = process.env.TIME_ZONE || 'Asia/Kolkata';
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${process.env.OPEN_WEATHER_MAP_KEY}`
    );
    const r = await response.json();

    if (r && r.weather && r.weather[0] && r.main) {
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.feels_like_temp = Math.round(r.main.feels_like);
      DATA.city_weather = r.weather[0].description;
      DATA.weather_icon = 'https://openweathermap.org/img/w/' + r.weather[0].icon + '.png';
      DATA.humidity = r.main.humidity;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timeZone,
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timeZone,
      });
      console.log('Weather fetched successfully for:', cityName);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

/**
 * A - Read 'main.mustache'
 * B - Render with Mustache using DATA
 * C - Write output to README.md in UTF-8
 */
function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, 'utf8', (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data, DATA);
    fs.writeFileSync('README.md', output, 'utf8');
    console.log('README.md successfully updated!');
  });
}

async function action() {
  await setWeatherInformation();
  generateReadMe();
}

action();