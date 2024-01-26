AFRAME.registerComponent('gps-camera-debug', {
    init: function () {
        const camera = this.el;

        // Debug component to display camera position
        setInterval(() => {
            const position = camera.getAttribute('position');
            console.log('Camera Position:', position);
        }, 5000);
    },
});