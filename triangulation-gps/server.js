const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json()); // Pour traiter les données JSON

// Fonction de filtrage de Kalman
function kalmanFilter(values) {
    let estimate = values[0];
    let error = 1.0;
    const processNoise = 1.0;
    const measurementNoise = 2.0;

    values.forEach(value => {
        // Prévision
        estimate = estimate;
        error = error + processNoise;

        // Mise à jour
        const gain = error / (error + measurementNoise);
        estimate = estimate + gain * (value - estimate);
        error = (1 - gain) * error;
    });

    return estimate;
}

app.post('/triangulate', (req, res) => {
    const { latitude1, longitude1, latitude2, longitude2, latitude3, longitude3, filterType } = req.body;

    // Logique de triangulation avec filtrage
    function triangulationGPS(lat1, long1, lat2, long2, lat3, long3, filter) {
        let lat, long;
        switch(filter) {
            case 'flat':
                lat = (parseFloat(lat1) + parseFloat(lat2) + parseFloat(lat3)) / 3;
                long = (parseFloat(long1) + parseFloat(long2) + parseFloat(long3)) / 3;
                break;
            case 'hilly':
                lat = (parseFloat(lat1) * 0.5 + parseFloat(lat2) * 0.3 + parseFloat(lat3) * 0.2);
                long = (parseFloat(long1) * 0.5 + parseFloat(long2) * 0.3 + parseFloat(long3) * 0.2);
                break;
            case 'mountainous':
                lat = Math.max(parseFloat(lat1), parseFloat(lat2), parseFloat(lat3));
                long = Math.max(parseFloat(long1), parseFloat(long2), parseFloat(long3));
                break;
            case 'kalman':
                lat = kalmanFilter([parseFloat(lat1), parseFloat(lat2), parseFloat(lat3)]);
                long = kalmanFilter([parseFloat(long1), parseFloat(long2), parseFloat(long3)]);
                break;
            default:
                lat = (parseFloat(lat1) + parseFloat(lat2) + parseFloat(lat3)) / 3;
                long = (parseFloat(long1) + parseFloat(long2) + parseFloat(long3)) / 3;
        }
        return { lat, long };
    }

    const result = triangulationGPS(latitude1, longitude1, latitude2, longitude2, latitude3, longitude3, filterType);

    res.json(result);
});

app.listen(port, () => {
    console.log(`Serveur écoute sur le port ${port}`);
});
