document.addEventListener('DOMContentLoaded', function () {
    // Get HTML elements
    const destinationSelectInput = document.getElementById('select-destination');
    const destinationSelectButton = document.getElementById('get-direction-button');
    const mapContainer = document.getElementById('map');
    let map;
    let compass;
    let currentLocationMarker; // To keep track of the marker at the current location
    let destinationMarker; // Define a global variable to keep track of the current destination marker
    let userLocation = { latitude: 0, longitude: 0 }; // Initialize with default values

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
                bearing: 0, // Initial bearing
                pitch: 0, // Initial pitch
            });
    
            // Enable map controls (zoom, pan, rotate)
            map.addControl(new mapboxgl.NavigationControl());
    
            // Create and append compass element
            compass = document.createElement('div');
            compass.className = 'compass';
            compass.innerHTML = '<img src="../models/compass.png" alt="Compass Icon">';

            // Add compass to the compass container
            const compassContainer = document.getElementById('compass-container');
            compassContainer.appendChild(compass);

            // Watch for changes in the device's orientation
            window.addEventListener('deviceorientation', handleOrientation);
    
            // Watch for changes in the user's location
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userLocation = { latitude, longitude }; // Update global userLocation
                    updateMapCenter(latitude, longitude);
    
                    // Update or create the current location marker
                    currentLocationMarker
                        ? updateMarker(currentLocationMarker, latitude, longitude, 'You are here!')
                        : (currentLocationMarker = addMarker(latitude, longitude, 'You are here!', '../models/current1.png'));
                },
                (error) => console.error('Error in retrieving position', error),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
            );
    
        } catch (error) {
            console.error('Error initializing map and getting initial location:', error);
        }
    };

    // Function to update the 2D map center
    const updateMapCenter = (latitude, longitude) => {
        map.setCenter([longitude, latitude]); // Update to Mapbox coordinates
    };

    // Function to handle changes in device orientation
    const handleOrientation = (event) => {
        const compassRotation = 360 - event.alpha; // Rotation in degrees
        compass.style.transform = `rotate(${360 - compassRotation}deg)`;
        
        // Set the bearing of the Mapbox map to achieve rotation
        //map.setBearing(compassRotation);

        // Update or create the current location marker
        if (currentLocationMarker) {
            // Update the marker's rotation
            currentLocationMarker.setRotation(compassRotation);
        } else {
            // If the marker doesn't exist, create a new one with the updated rotation
            currentLocationMarker = addMarker(userLocation.latitude, userLocation.longitude, 'You are here!', '../models/current1.png');
            currentLocationMarker.setRotation(compassRotation);
        }
    };

    // Function to update the marker on the map
    const updateMarker = (marker, latitude, longitude, title) => {
        marker.setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML(title));
    };

    // Function to add a marker on the map
    const addMarker = (latitude, longitude, title, markerImage) => {
        const markerOptions = {};
    
        // Check if a custom marker image is provided
        if (markerImage) {
            markerOptions.element = createCustomMarker(markerImage);
        } else {
            // Use the default Mapbox marker with a red color
            markerOptions.color = '#FF0000'; // Red color
        }
    
        return new mapboxgl.Marker(markerOptions)
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML(title))
            .addTo(map);
    };
    
    // Function to create a custom marker element
    const createCustomMarker = (markerImage) => {
        const element = document.createElement('div');
        element.className = 'custom-marker';
        element.style.backgroundImage = `url(${markerImage})`;
        element.style.width = '30px';  // Set the width of your custom marker
        element.style.height = '30px'; // Set the height of your custom marker
        return element;
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

    // Function to add AR label for the selected destination
    const addDestinationARLabel = (latitude, longitude, name) => {
        // Remove existing text entities
        const existingLabels = document.querySelectorAll('#ar-destination-label a-text');
        
        if (existingLabels.length > 0) {
            console.log('Removing existing text entities:', existingLabels.length);
            existingLabels.forEach(label => label.remove());
        } else {
            console.log('No existing text entities to remove.');
        }
    
        console.log('Adding AR label for:', name, 'at', latitude, longitude);
        
        // Create a new A-Frame entity (a-text) for the destination label
        const arLabel = document.createElement('a-text');

        // Set attributes for the label
        arLabel.setAttribute('value', name);
        arLabel.setAttribute('look-at', '[gps-new-camera]'); // Make the text face the camera
        arLabel.setAttribute('gps-new-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        arLabel.setAttribute('color', '#0100ff'); // Set the text color
        arLabel.setAttribute('scale', '5 5 5'); // Adjust scale as needed

        // Append the label to the A-Frame scene
        document.querySelector('#ar-destination-label').appendChild(arLabel);
    };

    // Function to update AR elements based on Mapbox directions
    const updateARDirections = (directionsData) => {
        // Add an AR route that shows a blue conveyor belt on the route.
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

    // Function to handle destination selection and initiate directions
    const selectDestination = async () => {
        const selectedDestination = destinationSelectInput.value;
        const destination = places.find(place => place.name === selectedDestination);
    
        if (destination) {
            try {
                // Update 2D map with user's current location
                updateMapCenter(userLocation.latitude, userLocation.longitude);
    
                const directionsData = await getDirections(userLocation, destination);
    
                // If the destination marker exists, update its position; otherwise, create a new marker
                const destinationMarker = addDestinationMarker(destination.latitude, destination.longitude, destination.name);

                // Add AR label for the selected destination
                addDestinationARLabel(destination.latitude, destination.longitude, destination.name);

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