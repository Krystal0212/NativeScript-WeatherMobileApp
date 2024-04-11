import { Utils, Observable,CoreTypes, Application } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';
const LoadingIndicator = require('@nstudio/nativescript-loading-indicator').LoadingIndicator;
const Mode = require('@nstudio/nativescript-loading-indicator').Mode;

export class HomeViewModel extends Observable {
  constructor() {
    super();
    this.weatherInfo = '';
    this.mainPageVisible = "visible";
    this.searchLocationVisible = "collapsed";
    this.settingsLocationVisible = "collapsed";
    this.locationCheckBgColor = "transparent";
    this.settingsBgColor = "transparent";

    this.titleName = "SkySight";
    this.batteryLevel = '25%';
    this.iconPath = "";
    this.checkBatteryLevel();

    this.loadingIndicator = new LoadingIndicator();
    this.loadingWeather();
  
  }

  checkBatteryLevel() {
    if (Application.android) {
      // console.log(`Getting Current Battery Level`);
      try {
        const context = Utils.android.getApplicationContext();;
        const BatteryManager = android.os.BatteryManager;
        const batteryManager = context.getSystemService(android.content.Context.BATTERY_SERVICE);

        if (batteryManager) {
          const batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
          this.updateBatteryLevel(batteryLevel);
        } else {
          console.log("Unable to access Battery Manager");
        }
      } catch (error) {
        console.error("Error retrieving battery level:", error);
      }
      
    }
  }

  updateBatteryLevel(level) {
    console.log(`Battery level in ViewModel: ${level}%`);
    if (level < 25) {
      this.set('iconPath', "~/assets/battery-status/low-battery.png");
    } else if (level < 50) {
      this.set('iconPath', "~/assets/battery-status/half-battery.png");
    } else if (level < 75) {
      this.set('iconPath', "~/assets/battery-status/battery.png");
    } else {
      this.set('iconPath', "~/assets/battery-status/full-battery.png");
    }
    console.log(`${this.iconPath}`);

    this.set('batteryLevel', `${level}%`);
  }

  convertUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const dayOfWeek = weekdays[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();

    // Formatting the time part
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours % 12 || 12}:${minutes}:${seconds} ${hours < 12 ? 'AM' : 'PM'}`;

    // Removing 'AM/PM' part if not needed
    // const timeWithoutAmPm = formattedTime.replace(/AM|PM/, '').trim();
  
    // Adding ordinal suffix to the day
    const day = date.getDate();
    let suffix;
    if (day > 3 && day < 21) {
      suffix = 'th';
    } else {
      switch (day % 10) {
        case 1:  suffix = 'st'; break;
        case 2:  suffix = 'nd'; break;
        case 3:  suffix = 'rd'; break;
        default: suffix = 'th';
      }
    }
    
    const formattedDateWithOrdinal = `${dayOfWeek} - ${dayOfMonth}${suffix} ${month} ${year}`;
    // console.log(formattedDateWithOrdinal);
  
    return `Time : ${formattedTime}\nDate : ${formattedDateWithOrdinal}`;
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

  loadingWeather() {
    console.log("Loading Weather");

    this.loadingIndicator.show(this.loadingOptions);

    geolocation.enableLocationRequest()
    .then(() => {
      console.log("Geolocation: Permission granted");
      geolocation.getCurrentLocation({ 
        desiredAccuracy: CoreTypes.Accuracy.high,
        maximumAge: 5000, 
        timeout: 20000 
      })
      .then((data) => {
        // console.log("Geolocation: Received location");
        return {latitude: data.latitude, longitude: data.longitude};
      })
      .then(location => {
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
      .then((data) => {
        console.log("Weather data converted");

        const timezone = data.timezone; // "Asia/Ho_Chi_Minh"
        this.set('titleName', timezone.split('/').pop().replace(/_/g, ' '));

        const temperature = data.current
          ? (data.current.temp - 273.15).toFixed(2)
          : 'N/A';
        const currentDateTime = this.convertUnixTimestamp(data.current.dt);
        this.set(
          'weatherInfo',
          `Current Temperature: ${temperature}°C\n${currentDateTime}`
        );
      })
      .catch((err) => {
        console.error("Error fetching weather data: ", err);
        this.set('weatherInfo', 'Error fetching data.');
      })
      .finally(() => {
        console.log("Loading Weather: Finished");
        this.loadingIndicator.hide();
      });
    })
    .catch(e => {
      console.error("Geolocation error: ", e);
      this.loadingIndicator.hide();
    });

  }

  onGetWeather() {
    console.log("Getting Inserted Location's Weather");

    this.loadingIndicator.show(this.loadingOptions);

    geolocation.enableLocationRequest()
    .then(() => {
      console.log("Geolocation: Permission granted");
      geolocation.getCurrentLocation({ 
        desiredAccuracy: CoreTypes.Accuracy.high,
        maximumAge: 5000, 
        timeout: 20000 
      })
      .then((data) => {
        console.log("Geolocation: Received location", data);
        return {latitude: data.latitude, longitude: data.longitude};
      })
      .then(location => {
        const lat = location.latitude; // Latitude
        const lon = location.longitude; // Longitude
        console.log(`Fetching weather data for lat: ${lat}, lon: ${lon}`);
        const apiKey = '672346e591b20d5d0b1e99dc21df440e'; // API Key
        
        return fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
      })
      .then((response) => {
        console.log("Weather data response received");
        return response.json();
      })
      .then((data) => {
        console.log("Weather data processed");

        const timezone = data.timezone; // "Asia/Ho_Chi_Minh"
        this.set('titleName', timezone.split('/').pop().replace(/_/g, ' '));

        const temperature = data.current
          ? (data.current.temp - 273.15).toFixed(2)
          : 'N/A';
        const currentDateTime = this.convertUnixTimestamp(data.current.dt);
        this.set(
          'weatherInfo',
          `Current Temperature: ${temperature}°C, Time: ${currentDateTime}`
        );
      })
      .catch((err) => {
        console.error("Error fetching weather data: ", err);
        this.set('weatherInfo', 'Error fetching data.');
      })
      .finally(() => {
        console.log("Loading Weather: Finished");
        this.loadingIndicator.hide();
      });
    })
    .catch(e => {
      console.error("Geolocation error: ", e);
      this.loadingIndicator.hide();
    });
  }

  onLocationCheckTap() {
    console.log("Location Check Tapped");
    this.showSearchLocationPage();
    this.highlightLocationCheck();
  }
  
  onMainPageTap() {
    console.log("Main Page Tapped");
    this.showMainPage();
    this.unhighlightAll();
  }

  onSettingsTap() {
    console.log("Settings Tapped");
    this.showSettingsPage();
    this.highlightSettings();
  }

  showMainPage() {
    this.set("mainPageVisible", "visible");
    this.set("searchLocationVisible", "collapsed");
    this.set("settingsLocationVisible", "collapsed");
  }

  showSearchLocationPage() {
    console.log("Showing Settings Page");
    this.set("mainPageVisible", "collapsed");
    this.set("searchLocationVisible", "visible");
    this.set("settingsLocationVisible", "collapsed");
  }

  showSettingsPage() {
    this.set("mainPageVisible", "collapsed");
    this.set("searchLocationVisible", "collapsed");
    this.set("settingsLocationVisible", "visible");
  }

  unhighlightAll() {
    this.set("locationCheckBgColor", "transparent");
    this.set("settingsBgColor", "transparent");
  }

  highlightLocationCheck() {
    this.set("locationCheckBgColor", "gray");
    this.set("settingsBgColor", "transparent");
  }

  // Method to highlight Settings icon
  highlightSettings() {
    this.set("locationCheckBgColor", "transparent");
    this.set("settingsBgColor", "gray");
  }
}