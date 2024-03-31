import { Observable,CoreTypes } from '@nativescript/core';
import * as geolocation from '@nativescript/geolocation';


export class HomeViewModel extends Observable {
  constructor() {
    super();
    this.weatherInfo = '';
  }

  convertUnixTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleString(); // Converts to local time in a readable format
  }

  onGetWeather() {
    console.log("start");
    geolocation.enableLocationRequest()
    .then(() => {
      console.log("step 1");
      geolocation.getCurrentLocation({ 
        desiredAccuracy: CoreTypes.Accuracy.high,
        maximumAge: 5000, 
        timeout: 20000 })
      .then((data)=>{
        console.log("step 2");
        return {latitude: data.latitude,longitude: data.longitude}
      })
      .then(location=>{
        console.log("step 3");
        const lat = location.latitude; // Latitude
        const lon = location.longitude	; // Longitude
        const apiKey = '672346e591b20d5d0b1e99dc21df440e'; // API Key
        
        console.log("step 4");
        fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            console.log("step 4.1");
            // Example: Extracting current temperature
            const temperature = data.current
              ? (data.current.temp - 273.15).toFixed(2)
              : 'N/A';
            const currentDateTime = this.convertUnixTimestamp(data.current.dt);
          
            console.log("step 4.2");
            this.set(
              'weatherInfo',
              `Current Temperature: ${temperature}°C, Time: ${currentDateTime}`
            );
          })
          .catch((err) => {
            console.log("Err step 4");
            console.log(err);
            this.set('weatherInfo', 'Error fetching data.');
          });
      })
    })
    .catch( e => {
      console.log("Err start");
      console.log(e)
    });
  }
}