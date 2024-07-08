import express from 'express';
import axios from 'axios';

const app = express();
const GIPHY_API_KEY = 'mwQawOJPrgJGDQANxkN5ZSbTP4mFmabk'; // Replace with your Giphy API key

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).send('Latitude and Longitude are required');
    }

    try {
        const weatherResponse = await axios.get(`http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`);
        const weatherData = weatherResponse.data;

        // console.log(`@@@@@@@@`,weatherData);
        // console.log(`@@@@@@@@`,weatherData.dataseries[0].temp2m);
        // console.log(`@@@@@@@@`,weatherData.dataseries[0].temp2m.min);
        const weatherForecast = [];

        if (weatherData.dataseries && weatherData.dataseries.length > 0) {
            weatherData.dataseries.slice(0, 7).forEach((day, index) => {
                const weatherType = day.weather || 'Unknown';
                const temperature = day.temp2m;

                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + index);

                const date = currentDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                weatherForecast.push({ date, weatherType, temperature});
            });
        }

        let weatherType = 'clear';
        if (weatherForecast.length > 0) {
            const firstDayWeather = weatherForecast[0].weatherType.toLowerCase();
            if (firstDayWeather.includes('cloud')) weatherType = 'cloudy';
            if (firstDayWeather.includes('rain')) weatherType = 'rainy';
            if (firstDayWeather.includes('snow')) weatherType = 'snowy';
            if (firstDayWeather.includes('storm')) weatherType = 'stormy';
        }

        const gifResponse = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${weatherType}&limit=5`);
        const gifs = gifResponse.data.data;

        res.render('weather', { weatherForecast, gifs });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
