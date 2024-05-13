import { Utils, Observable, CoreTypes, Application } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';
const LoadingIndicator =
  require('@nstudio/nativescript-loading-indicator').LoadingIndicator;
const Mode = require('@nstudio/nativescript-loading-indicator').Mode;

export class HomeViewModel extends Observable {
  constructor() {
    super();
    this.weatherInfo = '';
    this.mainPageVisible = 'visible';
    this.searchLocationVisible = 'collapsed';
    this.settingsLocationVisible = 'collapsed';
    this.locationCheckBgColor = 'transparent';
    this.settingsBgColor = 'transparent';
    this._celsiusTemperature = '';
    this._fahrenheitTemperature = '';

    this.titleName = 'SkySight';
    this.batteryLevel = '25%';
    this.iconPath = '';
    this.checkBatteryLevel();

    this.loadingIndicator = new LoadingIndicator();
    this.capitalsList = [
      { capitalName: 'London', latitude: 51.5074, longitude: -0.1278 },
      { capitalName: 'Paris', latitude: 48.8566, longitude: 2.3522 },
      { capitalName: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
      { capitalName: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
      { capitalName: 'Washington D.C.', latitude: 38.9072, longitude: -77.0369 }
    ];
    this.onSelectCapital = this.onSelectCapital.bind(this);
    console.log("ViewModel instantiated");
  }

  get celsiusTemperature() {
      return this._celsiusTemperature;
  }

  set celsiusTemperature(value) {
      if (this._celsiusTemperature !== value) {
          this._celsiusTemperature = value;
          this.updateFahrenheit();
      }
  }

  get fahrenheitTemperature() {
      return this._fahrenheitTemperature;
  }

  set fahrenheitTemperature(value) {
      this._fahrenheitTemperature = value;
      this.notifyPropertyChange('fahrenheitTemperature', value);
  }

  updateFahrenheit() {
      let celsius = parseFloat(this._celsiusTemperature);
      if (!isNaN(celsius)) {
          let fahrenheit = (celsius * 9 / 5) + 32;
          this.fahrenheitTemperature = fahrenheit.toFixed(2);
      } else {
          this.fahrenheitTemperature = ''; // Clear if input is not a number
      }
  }

  onSelectCapital(args) {
    console.log("Capitals List:", this.capitalsList);
    console.log("onSelectCapital called with:", args);
    const selectedItem = args;
    this.selectedCapitalName = selectedItem.capitalName;
    this.onGetWeather(selectedItem.latitude, selectedItem.longitude);
  }

loadingWeather() {
  console.log('Loading Weather');

  this.loadingIndicator.show(this.loadingOptions);

  geolocation
    .enableLocationRequest()
    .then(() => {
      console.log('Geolocation: Permission granted');
      geolocation
        .getCurrentLocation({
          desiredAccuracy: CoreTypes.Accuracy.high,
          maximumAge: 5000,
          timeout: 20000,
        })
        .then((data) => {
          // console.log("Geolocation: Received location");
          return { latitude: data.latitude, longitude: data.longitude };
        })
        .then((location) => {
          const lat = location.latitude; // Latitude
          const lon = location.longitude; // Longitude
          console.log(`Fetching weather data for lat: ${lat}, lon: ${lon}`);
          const apiKey = '672346e591b20d5d0b1e99dc21df440e'; // API Key

          return fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
          );
        })
        .then((response) => {
          // console.log("Weather data response received");
          return response.json();
        })
        .then(data => {
          console.log('Weather data converted');
          this.processWeatherData(data);
      })
        .catch((err) => {
          console.error('Error fetching weather data: ', err);
          this.set('weatherInfo', 'Error fetching data.');
        })
        .finally(() => {
          console.log('Loading Weather: Finished');
          this.loadingIndicator.hide();
        });
    })
    .catch((e) => {
      console.error('Geolocation error: ', e);
      this.loadingIndicator.hide();
    });
}

  processWeatherData(data) {
    const timezone = data.timezone; // "America/Chicago"
    this.set('titleName', timezone.split('/').pop().replace(/_/g, ' '));
    let weatherBackground = '~/assets/broken_cloud.jpg';    
    let weatherIcon = '~/assets/broken_cloud.png';
    const description = data.daily[0].weather[0].description.toLowerCase();
    
    if (description.includes('broken clouds')) {
      weatherBackground = '~/assets/broken_cloud.jpg';
      weatherIcon = '~/assets/broken_cloud.png';
  } else if (description.includes('clear sky')) {
      weatherBackground = '~/assets/clear_sky.jpg';
      weatherIcon = '~/assets/clear_sky.png';
  } else if (description.includes('few clouds')) {
      weatherBackground = '~/assets/few_cloud.jpg';
      weatherIcon = '~/assets/few_cloud.png';
  } else if (description.includes('mist')) {
      weatherBackground = '~/assets/mist.jpg';
      weatherIcon = '~/assets/mist.png';
  } else if (description.includes('rain')) { // Checks if description contains "rain"
    weatherBackground = '~/assets/rain.jpg';
      weatherIcon = '~/assets/rain.png';
  } else if (description.includes('scattered clouds')) {
      weatherBackground = '~/assets/scatter_cloud.jpg';
      weatherIcon = '~/assets/scatter_cloud.png';
  } else if (description.includes('shower')) {
      weatherBackground = '~/assets/shower_ic.png';
      weatherIcon = '~/assets/shower.png';
  } else if (description.includes('snow')) {
      weatherBackground = '~/assets/snow.jpg';
      weatherIcon = '~/assets/snow.png';
  } else if (description.includes('thunderstorm')) {
      weatherBackground = '~/assets/thunderstorm.jpg';
      weatherIcon = '~/assets/thunderstorm.png';
  }else{
    weatherBackground = '~/assets/mist.jpg';
    weatherIcon = '~/assets/mist.png';
  }

    this.set('weatherBackground', weatherBackground);
    this.set('weatherIcon', weatherIcon);

    const temperature = data.current
              ? (data.current.temp - 273.15).toFixed()
              : '0';
    const feelLikeTemperature = data.current
              ? (data.current.feels_like - 273.15).toFixed()
              : '0';
    const humidity = data.current
              ? data.current.humidity
              : '0';
    const wind_speed = data.current
              ? data.current.wind_speed
              : '0';

    const currentDateTime = this.convertUnixTimestamp(data.current.dt);
    this.set('dateValue',currentDateTime);
    this.set('temperatureValue',temperature);
    this.set('humidValue',humidity);
    this.set('temperatureValuePercent',temperature+"%");
    this.set('humidValuePercent',humidity+"%");
    this.set('feelLikeTemperatureValue',feelLikeTemperature);
    this.set('feelLikeTemperatureValuePercent',feelLikeTemperature+"%");
    this.set('speedValue',wind_speed);

    for (let i = 1; i < 6; i++) {  // Assuming 5 days forecast
        const dailyData = data.daily[i];
        this.set(`day${i}`, {
            date: this.convertUnixTimestamp(dailyData.dt).split(" - ")[1],
            temperature: `${(dailyData.temp.day - 273.15).toFixed(2)}°C`,
            humidity: `Humidity: ${dailyData.humidity}%`,
            windSpeed: `Wind speed ${dailyData.wind_speed} m/s`,
            description: `State: ${dailyData.weather[0].description}`
        });
    }
    console.log(`Day 1 ${this.day1.date}: Temperature - ${this.day1.temperature}, Humidity - ${this.day1.humidity}, Wind Speed - ${this.day1.windSpeed}, Description - ${this.day1.description}`);
  }

  onGetWeather(latitude, longitude) {
    console.log(`Fetching weather data for lat: ${latitude}, lon: ${longitude}`);
    this.loadingIndicator.show(this.loadingOptions);

    const apiKey = '672346e591b20d5d0b1e99dc21df440e'; 
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    fetch(url)
        .then((response) => {
            console.log("API Response:", response);
            return response.json();
        })
        .then((data) => {
          const iconCode = data.current.weather[0].icon; 
          const iconBaseUrl = "https://openweathermap.org/img/wn/";
          const weatherIconUrl = `${iconBaseUrl}${iconCode}@2x.png`;
          const temperature = data.current.temp - 272.15; // K to Celsius
          const weatherDescription = data.current.weather[0].description;
          const humidity = data.current.humidity;
          const windSpeed = data.current.wind_speed * 3.6;
          const formattedWeatherInfo = `${this.selectedCapitalName}\nTemperature: ${temperature.toFixed(0)}°C\nConditions: ${weatherDescription}\nHumidity: ${humidity}%\nWind Speed: ${windSpeed.toFixed(0)} km/h`;
          this.set('weatherInfo', formattedWeatherInfo);
          this.set('weatherIconL', weatherIconUrl);
      })
        .catch((err) => {
            console.error('Error fetching weather data:', err);
            this.set('weatherInfo', 'Error fetching data.');
        })
        .finally(() => {
            this.loadingIndicator.hide();
            console.log('Loading Weather: Finished');
        });
  }

  checkBatteryLevel() {
    if (Application.android) {
      // console.log(`Getting Current Battery Level`);
      try {
        const context = Utils.android.getApplicationContext();
        const BatteryManager = android.os.BatteryManager;
        const batteryManager = context.getSystemService(
          android.content.Context.BATTERY_SERVICE
        );

        if (batteryManager) {
          const batteryLevel = batteryManager.getIntProperty(
            BatteryManager.BATTERY_PROPERTY_CAPACITY
          );
          this.updateBatteryLevel(batteryLevel);
        } else {
          console.log('Unable to access Battery Manager');
        }
      } catch (error) {
        console.error('Error retrieving battery level:', error);
      }
    }
  }

  updateBatteryLevel(level) {
    console.log(`Battery level in ViewModel: ${level}%`);
    if (level < 25) {
      this.set('iconPath', '~/assets/low-battery.png');
    } else if (level < 50) {
      this.set('iconPath', '~/assets/half-battery.png');
    } else if (level < 75) {
      this.set('iconPath', '~/assets/battery.png');
    } else {
      this.set('iconPath', '~/assets/full-battery.png');
    }
    console.log(`${this.iconPath}`);

    this.set('batteryLevel', `${level}%`);
  }

  convertUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);

    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const dayOfWeek = weekdays[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();

    // Formatting the time part
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours % 12 || 12}:${minutes}:${seconds} ${
      hours < 12 ? 'AM' : 'PM'
    }`;

    // Removing 'AM/PM' part if not needed
    // const timeWithoutAmPm = formattedTime.replace(/AM|PM/, '').trim();

    // Adding ordinal suffix to the day
    const day = date.getDate();
    let suffix;
    if (day > 3 && day < 21) {
      suffix = 'th';
    } else {
      switch (day % 10) {
        case 1:
          suffix = 'st';
          break;
        case 2:
          suffix = 'nd';
          break;
        case 3:
          suffix = 'rd';
          break;
        default:
          suffix = 'th';
      }
    }

    const formattedDateWithOrdinal = `${dayOfWeek} - ${dayOfMonth}${suffix} ${month} ${year}`;
    // console.log(formattedDateWithOrdinal);

    return `${formattedTime} - ${formattedDateWithOrdinal}`;
  }

  // Loading indicator options
  get loadingOptions() {
    return {
      message: 'Loading...',
      details: 'Fetching weather data...',
      progress: 0.65,
      margin: 10,
      dimBackground: true,
      color: '#4B9ED6', // color of indicator and labels
      backgroundColor: 'yellow',
      userInteractionEnabled: false,
      hideBezel: true,
      mode: Mode.AnnularDeterminate,
      android: {
        cancelable: false,
        cancelListener: function (dialog) {
          console.log('Loading cancelled');
        },
      },
    };
  }

 

  onLocationCheckTap() {
    console.log('Location Check Tapped');
    this.showSearchLocationPage();
    this.highlightLocationCheck();
  }

  onMainPageTap() {
    console.log('Main Page Tapped');
    this.showMainPage();
    this.unhighlightAll();
  }

  onSettingsTap() {
    console.log('Settings Tapped');
    this.showSettingsPage();
    this.highlightSettings();
  }

  showMainPage() {
    this.set('mainPageVisible', 'visible');
    this.set('searchLocationVisible', 'collapsed');
    this.set('settingsLocationVisible', 'collapsed');
  }

  showSearchLocationPage() {
    this.set('mainPageVisible', 'collapsed');
    this.set('searchLocationVisible', 'visible');
    this.set('settingsLocationVisible', 'collapsed');
  }

  showSettingsPage() {
    this.set('mainPageVisible', 'collapsed');
    this.set('searchLocationVisible', 'collapsed');
    this.set('settingsLocationVisible', 'visible');
  }

  unhighlightAll() {
    this.set('locationCheckBgColor', 'transparent');
    this.set('settingsBgColor', 'transparent');
  }

  highlightLocationCheck() {
    this.set('locationCheckBgColor', 'gray');
    this.set('settingsBgColor', 'transparent');
  }

  // Method to highlight Settings icon
  highlightSettings() {
    this.set('locationCheckBgColor', 'transparent');
    this.set('settingsBgColor', 'gray');
  }
}
