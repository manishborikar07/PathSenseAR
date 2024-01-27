document.addEventListener('DOMContentLoaded', function () {
    const destinationSelectInput = document.getElementById('select-destination');
    const destinationSelectButton = document.getElementById('get-direction-button');
    const mapContainer = document.getElementById('map');
    const sceneEl = document.querySelector('a-scene');
    let map;

    // Function to initialize the map and get the user's current location
    const initMapAndLocation = async () => {
        try {
            // Initialize the map with Mapbox
            mapboxgl.accessToken = 'pk.eyJ1IjoicHJhbmtpdGEiLCJhIjoiY2xydnFjZzBoMG11eTJsbXJwNzZ5YW0ycyJ9.l4xfJem8x103cBLHcw1PLQ';
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0],
                zoom: 15,
            });

            // Get the user's current location
            const userLocation = await getCurrentLocation();

            // Update map with user's current location
            updateMapCenter(userLocation.latitude, userLocation.longitude);
        } catch (error) {
            console.error('Error initializing map and getting initial location:', error);
        }
    };

    // Function to get the user's current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
                error => {
                    console.error('Error in retrieving position', error);
                    reject(error);
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
            );
        });
    };

    // Function to update the map center
    const updateMapCenter = (latitude, longitude) => {
        map.setCenter([longitude, latitude]);
    };

    // Function to update the map with the route (replace with Mapbox routing service)
    const updateMapWithRoute = (origin, destination) => {
        // Use Mapbox routing service here
        // ...
    };

    // Function to get directions from an API
    const getDirections = async (origin, destination) => {
        const apiKey = 'pk.eyJ1IjoicHJhbmtpdGEiLCJhIjoiY2xydnFjZzBoMG11eTJsbXJwNzZ5YW0ycyJ9.l4xfJem8x103cBLHcw1PLQ'; // Replace with Mapbox API key
        const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?access_token=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data.routes[0].legs[0].steps;
        } catch (error) {
            console.error('Error fetching directions:', error);
            throw error;
        }
    };

    // Function to update AR elements based on directions
    const updateARDirections = (waypoints) => {
        // Remove existing AR markers and path
        removeExistingARMarkers();
        removeExistingARPath();

        // Create AR path element
        const path = document.createElement('a-entity');
        path.setAttribute('line', {
            color: 'blue',
            path: waypoints.map(waypoint => `${waypoint.maneuver.location[0]} ${waypoint.maneuver.location[1]} 0.5`).join(','),
        });
        sceneEl.appendChild(path);

        // Create AR markers for each waypoint
        waypoints.forEach(waypoint => {
            const marker = document.createElement('a-marker');
            marker.setAttribute('preset', 'hiro');
            marker.setAttribute('position', `${waypoint.maneuver.location[0]} ${waypoint.maneuver.location[1]} 0.5`);
            marker.setAttribute('text', `value: ${waypoint.maneuver.instruction}`);
            sceneEl.appendChild(marker);
        });
    };

    // Function to handle destination selection and initiate directions
const selectDestination = async () => {
    const selectedDestination = destinationSelectInput.value;
    const destination = places.find(place => place.name === selectedDestination);

    if (destination) {
        try {
            const userLocation = await getCurrentLocation();
            // Update map with user's current location
            updateMapCenter(userLocation.latitude, userLocation.longitude);

            const directionsData = await getDirections(userLocation, destination);
            // Update AR elements
            updateARDirections(directionsData);

            // Update map with route
            updateMapWithRoute(userLocation, destination);

            // Disable AR.js debug UI
            AR.debugUIEnabled = false;
        } catch (error) {
            console.error('Error in retrieving position', error);
        }
    } else {
        console.log('Destination not found:', selectedDestination);
        // Handle case when the selected destination is not found
    }
};

    // Populate the dropdown with places from places.js
    places.forEach(place => {
        const option = document.createElement('option');
        option.value = place.name;
        option.text = place.name;
        destinationSelectInput.appendChild(option);
    });

    destinationSelectButton.addEventListener('click', selectDestination);

    // End of the 'DOMContentLoaded' event listener
    initMapAndLocation(); // Call the function to initialize map and location
});