// Initialiser la carte sur le Cameroun
const map = L.map('map').setView([7.3697, 12.3547], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([7.3697, 12.3547]).addTo(map);
marker.bindPopup('Position initiale : Cameroun').openPopup();

document.getElementById('gpsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const latitude1 = document.getElementById('latitude1').value;
    const longitude1 = document.getElementById('longitude1').value;
    const latitude2 = document.getElementById('latitude2').value;
    const longitude2 = document.getElementById('longitude2').value;
    const latitude3 = document.getElementById('latitude3').value;
    const longitude3 = document.getElementById('longitude3').value;
    const filterType = document.getElementById('filterType').value;

    function kalmanFilter(values) {
        let estimate = values[0];
        let error = 1.0;
        const processNoise = 1.0;
        const measurementNoise = 2.0;

        values.forEach(value => {
            estimate = estimate;
            error = error + processNoise;

            const gain = error / (error + measurementNoise);
            estimate = estimate + gain * (value - estimate);
            error = (1 - gain) * error;
        });

        return estimate;
    }

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

    document.getElementById('result').innerText = 
        `Coordonnées triangulées : Latitude ${result.lat}, Longitude ${result.long}`;
    
    // Mise à jour de la carte avec la nouvelle position
    map.setView([result.lat, result.long], 13);
    marker.setLatLng([result.lat, result.long]);
    marker.bindPopup('Position triangulée').openPopup();
});
