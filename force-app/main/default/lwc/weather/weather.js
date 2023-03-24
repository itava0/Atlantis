import { LightningElement, api, track, wire } from 'lwc';
import getPropertyGeo from '@salesforce/apex/getProperties.getPropertyGeo';
import getWeather from '@salesforce/apex/FindWeather.getWeather';

export default class Weather extends LightningElement {
    // Property and weather data
    @api propertyId;
    @track weather;
    @track error;
    lat;
    lon;

    // Track which measurement scales to use and from that, what to display
    isF = true;
    isC = false;
    fVariant;
    cVariant;

    // Labels for current weather
    temperatureLabel;
    windLabel;
    humidityLabel;
    pressureLabel;
    precipitationLabel;
    visibilityLabel;
    uvsLabel;

    // Label lists for weather forecast
    forecastTemp = [];
    forecastPrecip = [];
    forecastVis = [];
    forecastHum = [];
    forecastUvs = [];
    forecastRain = [];
    forecastSnow = [];

    // Dates for weather forecast
    date1;
    date2;
    date3;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    // Get geolocation of property for API parameters
    @wire (getPropertyGeo, {propId: "$propertyId"}) getPropertyGeo(result) {
        if (result.data) {
            this.lat = result.data[0].Geolocation__Latitude__s;
            this.lon = result.data[0].Geolocation__Longitude__s;
            this.retrieveWeather();
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.lat = null;
            this.lon = null;
        }
    }

    // Call API to get weather data given property latitude and longitude
    retrieveWeather() {
        getWeather({ lat: this.lat, lon: this.lon })
        .then((result) => {
            this.weather = result;

            // Set labels to default (Fahrenheit/imperial), and update date information
            this.updateLabels();
            this.updateDates();
        })
        .catch((error) => {
            this.error = error;
        });
    }

    // Toggle scales for temperature (other metrics will match appropriate scale)
    handleSwitch(event) {
        // Switch between Fahrenheit and Celsius
        if (event.target.value == 'f') {
            this.isC = false;
            this.isF = true;
        } else if (event.target.value == 'c') {
            this.isF = false;
            this.isC = true;
        }

        // Update text labels based on selection
        this.updateLabels();
    }

    // Based on current scale, update labels accordingly
    updateLabels() {
        // Button styles
        this.fVariant = this.isF ? 'brand' : 'brand-outline';
        this.cVariant = this.isC ? 'brand' : 'brand-outline';

        // Data labels for current weather
        this.temperatureLabel = this.changingLabel(this.weather.cur_temp_f, this.weather.cur_temp_c, ' °F', ' °C');
        this.windLabel = this.changingLabel(this.weather.cur_wind_mph, this.weather.cur_wind_kph, ' mph', ' km/h');
        this.humidityLabel = this.weather.cur_humidity + '%';
        this.pressureLabel = this.changingLabel(Math.trunc(this.weather.cur_precip_in), Math.trunc(this.weather.cur_precip_mm), ' in', ' mb');
        this.visibilityLabel = this.changingLabel(Math.trunc(this.weather.cur_vis_mi), Math.trunc(this.weather.cur_vis_km), ' mi', ' km');
        this.uvsLabel = Math.trunc(this.weather.cur_uvs);

        // Data labels for 3-day forecast
        this.forecastTemp = this.forecastLabel(' °F', ' °C', this.weather.cast_avgtemp_f_1, this.weather.cast_avgtemp_c_1,
                            this.weather.cast_avgtemp_f_2, this.weather.cast_avgtemp_c_2, this.weather.cast_avgtemp_f_3, this.weather.cast_avgtemp_c_3);
        this.forecastPrecip = this.forecastLabel(' in', ' mm', this.weather.cast_totalprecip_in_1, this.weather.cast_totalprecip_mm_1,
                            this.weather.cast_totalprecip_in_2, this.weather.cast_totalprecip_mm_2, this.weather.cast_totalprecip_in_3, this.weather.cast_totalprecip_mm_3);
        this.forecastVis = this.forecastLabel(' mi', 'km', this.weather.cast_avgvis_mi_1, this.weather.cast_avgvis_km_1,
                            this.weather.cast_avgvis_mi_2, this.weather.cast_avgvis_km_2, this.weather.cast_avgvis_mi_3, this.weather.cast_avgvis_km_3);
        this.forecastHum = [Math.trunc(this.weather.cast_avghumidity_1) + '%', Math.trunc(this.weather.cast_avghumidity_2) + '%', Math.trunc(this.weather.cast_avghumidity_3) + '%'];
        this.forecastUvs = [Math.trunc(this.weather.cast_uvs_1), Math.trunc(this.weather.cast_uvs_2), Math.trunc(this.weather.cast_uvs_3)];
        this.forecastRain = [this.weather.cast_rainchance_1 + '%', this.weather.cast_rainchance_2 + '%', this.weather.cast_rainchance_3 + '%'];
        this.forecastSnow = [this.weather.cast_snowchance_1 + '%', this.weather.cast_snowchance_2 + '%', this.weather.cast_snowchance_3 + '%'];
    }

    // Formula to update labels with two possible values
    changingLabel(fLabel, cLabel, fMetric, cMetric) {
        let newLabel = this.isF ? fLabel + fMetric : cLabel + cMetric;
        return newLabel;
    }

    // Formula to update labels for weather forecast (three labels, each with two possible values)
    forecastLabel(fMetric, cMetric, fLabel1, cLabel1, fLabel2, cLabel2, fLabel3, cLabel3) {
        let value1 = this.changingLabel(fLabel1, cLabel1, fMetric, cMetric);
        let value2 = this.changingLabel(fLabel2, cLabel2, fMetric, cMetric);
        let value3 = this.changingLabel(fLabel3, cLabel3, fMetric, cMetric);
        return [value1, value2, value3];
    }

    // Get date information
    updateDates() {
        
        let day1 = new Date();
        let day2 = new Date();
        let day3 = new Date();

        day2.setDate(day1.getDate() + 1);
        day3.setDate(day1.getDate() + 2);

        this.date1 = day1.toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
        this.date2 = day2.toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
        this.date3 = day3.toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
        
    }
}