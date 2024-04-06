import { Observable,CoreTypes } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';


export class HomeViewModel extends Observable {
  constructor() {
    super();
    this.weatherInfo = '';
    this.mainPageVisible = "visible";
    this.searchLocationVisible = "collapsed";
    this.settingsLocationVisible = "collapsed";
    this.locationCheckBgColor = "transparent";
    this.settingsBgColor = "transparent";

    this.loadingWeather();
  }

  convertUnixTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleString(); // Converts to local time in a readable format
  }

  loadingWeather() {
    console.log("Loading Weather");
    geolocation.enableLocationRequest()
    .then(() => {
      geolocation.getCurrentLocation({ 
        desiredAccuracy: CoreTypes.Accuracy.high,
        maximumAge: 5000, 
        timeout: 20000 })
      .then((data)=>{
        return {latitude: data.latitude,longitude: data.longitude}
      })
      .then(location=>{

        const lat = location.latitude; // Latitude
        const lon = location.longitude	; // Longitude
        const apiKey = '672346e591b20d5d0b1e99dc21df440e'; // API Key
        
        fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            // Example: Extracting current temperature
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
            console.error(err);
            this.set('weatherInfo', 'Error fetching data.');
          });
      })
    })
    .catch( e => {
      console.log(e)
    });
  }

  onGetWeather() {
    console.log("Getting Weather");
    geolocation.enableLocationRequest()
    .then(() => {
      geolocation.getCurrentLocation({ 
        desiredAccuracy: CoreTypes.Accuracy.high,
        maximumAge: 5000, 
        timeout: 20000 })
      .then((data)=>{
        return {latitude: data.latitude,longitude: data.longitude}
      })
      .then(location=>{

        const lat = location.latitude; // Latitude
        const lon = location.longitude	; // Longitude
        const apiKey = '672346e591b20d5d0b1e99dc21df440e'; // API Key
        
        fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            // Example: Extracting current temperature
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
            console.error(err);
            this.set('weatherInfo', 'Error fetching data.');
          });
      })
    })
    .catch( e => {
      console.log(e)
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
