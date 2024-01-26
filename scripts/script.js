document.addEventListener('DOMContentLoaded', function () {
    const destinationSelectInput = document.getElementById('select-destination');
    const destinationSelectButton = document.getElementById('get-direction-button');
    const mapContainer = document.getElementById('map');
    const sceneEl = document.querySelector('a-scene');
    let map;

    // Function to initialize the map and get the user's current location
    const initMapAndLocation = async () => {
        try {
            // Initialize the map
            map = new google.maps.Map(mapContainer, {
                center: { lat: 0, lng: 0 },
                zoom: 15,
            });

            // Get the user's current location
            const userLocation = await getCurrentLocation();

            // Update 2D map with user's current location
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

    // Function to update the 2D map center
    const updateMapCenter = (latitude, longitude) => {
        map.setCenter(new google.maps.LatLng(latitude, longitude));
    };

    // Function to update the 2D map with the route
    const updateMapWithRoute = (origin, destination) => {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

        directionsService.route(
            {
                origin: new google.maps.LatLng(origin.latitude, origin.longitude),
                destination: new google.maps.LatLng(destination.latitude, destination.longitude),
                travelMode: 'WALKING', // Adjust as needed (WALKING, DRIVING, etc.)
            },
            (response, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(response);

                    // Place a marker at the user's current location
                    const userMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(origin.latitude, origin.longitude),
                        map: map,
                        title: 'You are here!',
                        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Customize the marker icon
                    });
                } else {
                    console.error('Directions request failed:', status);
                }
            }
        );
    };

    // Function to get directions from an API
    const getDirections = async (origin, destination) => {
        const apiKey = 'AIzaSyCon-2SzFPlJuaKIg4lO55zhUgTJXeNNjM';
        const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data;
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
            path: waypoints.map(waypoint => `${waypoint.start_location.lng()} ${waypoint.start_location.lat()} 0.5`).join(','),
        });
        sceneEl.appendChild(path);
    
        // Create AR markers for each waypoint
        waypoints.forEach(waypoint => {
            const marker = document.createElement('a-marker');
            marker.setAttribute('position', `${waypoint.start_location.lng()} ${waypoint.start_location.lat()} 0.5`);
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
                // Update 2D map with user's current location
                updateMapCenter(userLocation.latitude, userLocation.longitude);

                const directionsData = await getDirections(userLocation, destination);
                // Update AR elements
                updateARDirections(directionsData);

                // Update 2D map with route
                updateMapWithRoute(userLocation, destination);
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