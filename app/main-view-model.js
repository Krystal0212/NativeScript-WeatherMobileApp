import { Observable,CoreTypes } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';


export class HomeViewModel extends Observable {
  constructor() {
    super();
    this.weatherInfo = '';
    this.mainPageVisible = "visible";
    this.searchLocationVisible = "collapsed";
    this.settingsLocationVisible = "collapsed";
  }

  convertUnixTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleString(); // Converts to local time in a readable format
  }

  onGetWeather() {
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

  showMainPage() {
    this.set("mainPageVisible", "visible");
    this.set("searchLocationVisible", "collapsed");
    this.set("settingsLocationVisible", "collapsed");
  }

  showSearchLocationPage() {
    this.set("mainPageVisible", "collapsed");
    this.set("searchLocationVisible", "visible");
    this.set("settingsLocationVisible", "collapsed");
  }

  showSettingsPage() {
    this.set("mainPageVisible", "collapsed");
    this.set("searchLocationVisible", "collapsed");
    this.set("settingsLocationVisible", "visible");
  }

  onMainPageTap() {
    this.set("mainPageVisible", "visible");
    this.set("searchLocationVisible", "collapsed");
    this.set("settingsLocationVisible", "collapsed");
  }
}
