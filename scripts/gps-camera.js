AFRAME.registerComponent('gps-camera', {
    schema: {
        minDistance: { type: 'number', default: 20 },
    },

    init: function () {
        this.el.addEventListener('loaded', () => {
            console.log('GPS Camera Component Loaded');
        });

        const scene = document.querySelector('a-scene');
        const camera = this.el;

        // Access user's current location
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Set camera's position based on user's location
                camera.setAttribute('gps-entity-place', { latitude, longitude });

                // Create a 3D marker at the user's location (optional)
                const marker = document.createElement('a-box');
                marker.setAttribute('gps-entity-place', { latitude, longitude });
                marker.setAttribute('material', 'color: #00ff00');
                marker.setAttribute('scale', '5 5 5');
                scene.appendChild(marker);
            },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    },
});