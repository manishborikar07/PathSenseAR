document.addEventListener('DOMContentLoaded', function () {
    // Get HTML elements
    const destinationSelectInput = document.getElementById('select-destination');
    const destinationSelectButton = document.getElementById('get-direction-button');
    const mapContainer = document.getElementById('map');
    let map;
    // To keep track of the marker at the current location
    let currentLocationMarker; 
    // Define a global variable to keep track of the current destination marker
    let destinationMarker;

    // Function to initialize the map and get the user's current location
    const initMapAndLocation = async () => {
        try {
            // Initialize the map with Mapbox
            mapboxgl.accessToken = 'pk.eyJ1IjoicHJhbmtpdGEiLCJhIjoiY2xydnB6aXQzMHZqejJpdGV1NnByYW1kZyJ9.OedTGDqNQXNv-DJOV2HXuw';
            map = new mapboxgl.Map({
                container: mapContainer,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0], // Default center
                zoom: 15,
            });

            // Get and update the user's current location
            navigator.geolocation.watchPosition(
                (position) => {
                    const userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    updateMapCenter(userLocation.latitude, userLocation.longitude);

                    // If the current location marker exists, update its position; otherwise, create a new marker
                    if (currentLocationMarker) {
                        updateMarker(currentLocationMarker, userLocation.latitude, userLocation.longitude, 'You are here!');
                    } else {
                        currentLocationMarker = addMarker(userLocation.latitude, userLocation.longitude, 'You are here!');
                    }
                },
                (error) => {
                    console.error('Error in retrieving position', error);
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
            );
        } catch (error) {
            console.error('Error initializing map and getting initial location:', error);
        }
    };

    // Function to update the marker on the map
    const updateMarker = (marker, latitude, longitude, title) => {
        marker.setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML(title));
    };

    // Function to add a marker on the map
    const addMarker = (latitude, longitude, title) => {
        return new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML(title))
            .addTo(map);
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
        map.setCenter([longitude, latitude]); // Update to Mapbox coordinates
    };

    // Function to calculate the distance between two points using the Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in kilometers
        const dLat = degToRad(lat2 - lat1);
        const dLon = degToRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    };

    // Function to convert degrees to radians
    const degToRad = (degrees) => {
        return degrees * (Math.PI / 180);
    };

    // Function to calculate the total length of the route
    const calculateRouteLength = (coordinates) => {
        let length = 0;

        for (let i = 1; i < coordinates.length; i++) {
            const prevCoord = coordinates[i - 1];
            const currentCoord = coordinates[i];
            const segmentLength = calculateDistance(prevCoord[0], prevCoord[1], currentCoord[0], currentCoord[1]);
            length += segmentLength;
        }

        return length;
    };

   // Function to update AR elements based on Mapbox directions
    const updateARDirections = (directionsData) => {
        // Ensure A-Frame is initialized
        const aFrameInitialized = AFRAME.scenes.length > 0;

        if (!aFrameInitialized) {
            console.error('A-Frame not initialized. Unable to update AR directions.');
            return;
        }

        // Clear existing AR route entities
        const existingARRouteEntities = document.querySelectorAll('.ar-route');
        existingARRouteEntities.forEach(entity => entity.parentNode.removeChild(entity));

        console.log('Existing AR route entities cleared.');

        // Check if directionsData is defined and contains route information
        if (directionsData && directionsData.routes && directionsData.routes.length > 0) {
            // Extract route coordinates from Mapbox directions data
            const routeCoordinates = directionsData.routes[0].geometry.coordinates;

            console.log('Route coordinates:', routeCoordinates);

            // Create AR route entity
            const arRouteEntity = document.createElement('a-entity');
            arRouteEntity.classList.add('ar-route');

            // Create a colored plane (representing the road)
            const roadPlane = document.createElement('a-plane');
            roadPlane.setAttribute('material', {
                color: '#3882f6', // Replace with your desired color
                side: 'double',
                opacity: 0.7, // Adjust transparency if needed
            });

            // Calculate the midpoint of the route for positioning
            const midpointIndex = Math.floor(routeCoordinates.length / 2);
            const midpoint = routeCoordinates[midpointIndex];

            // Set the position and rotation of the AR route entity
            arRouteEntity.setAttribute('position', {
                x: midpoint[0],
                y: -0.5, // Adjust the height as needed
                z: midpoint[1],
            });
            arRouteEntity.setAttribute('rotation', { x: 0, y: -90, z: 0 }); // Adjust rotation for alignment

            // Set the scale of the road plane based on the length of the route
            const routeLength = calculateRouteLength(routeCoordinates);
            roadPlane.setAttribute('scale', { x: routeLength, y: 1, z: 2 }); // Adjust scale for better visibility

            // Append the plane to the AR route entity
            arRouteEntity.appendChild(roadPlane);

            // Append the AR route entity to the A-Frame scene
            document.querySelector('a-scene').appendChild(arRouteEntity);

            console.log('AR route entity added to the A-Frame scene. Route displayed in AR.');
        } else {
            console.error('Invalid directionsData or missing route coordinates. Route not displayed in AR.');
        }
    };

    // Function to update the 2D map with the route
    const updateMapWithRoute = (directionsData) => {
        // Ensure the map is initialized
        if (!map) {
            console.error('Map not initialized. Unable to update route.');
            return;
        }
    
        // Log directionsData to identify the structure
        console.log('Directions Data:', directionsData);
    
        // Check if directionsData is defined and contains route information
        if (directionsData && directionsData.routes && directionsData.routes.length > 0) {
            // Extract route coordinates from Mapbox directions data
            const routeCoordinates = directionsData.routes[0].geometry.coordinates;
    
            // Log route coordinates to identify any issues
            console.log('Route Coordinates:', routeCoordinates);
    
            const sourceId = 'route';
    
            // Check if the 'route' source already exists
            if (map.getSource(sourceId)) {
                try {
                    // If it exists, remove the existing source and layer
                    map.removeLayer(sourceId);
                    map.removeSource(sourceId);
                } catch (error) {
                    console.error('Error removing existing route:', error);
                }
            }
    
            // Add a new source and layer
            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: routeCoordinates,
                    },
                },
            });
    
            map.addLayer({
                id: sourceId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#3882f6',
                    'line-width': 3,
                },
            });
        } else {
            console.error('Invalid directionsData or missing route coordinates.');
        }
    };

    // Function to get directions from the Mapbox API
    const getDirections = async (origin, destination) => {
        const apiKey = 'pk.eyJ1IjoicHJhbmtpdGEiLCJhIjoiY2xydnB6aXQzMHZqejJpdGV1NnByYW1kZyJ9.OedTGDqNQXNv-DJOV2HXuw';
        const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?access_token=${apiKey}&geometries=geojson`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching directions:', error);
            throw error;
        }
    };

    // Function to add a marker for a location on the map
    const addDestinationMarker = (latitude, longitude, title) => {
        // Remove the previous destination marker if it exists
        if (destinationMarker) {
            destinationMarker.remove();
        }
    
        // Add a new marker at the destination with a popup
        destinationMarker = addMarker(latitude, longitude, title);
        return destinationMarker;
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
    
                // If the destination marker exists, update its position; otherwise, create a new marker
                const destinationMarker = addDestinationMarker(destination.latitude, destination.longitude, destination.name);

                // Update AR elements
                updateARDirections(directionsData);
    
                // Update 2D map with route
                updateMapWithRoute(directionsData);
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