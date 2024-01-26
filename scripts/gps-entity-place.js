AFRAME.registerComponent('gps-entity-place', {
    schema: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
    },

    init: function () {
        const { latitude, longitude } = this.data;
        console.log(`Entity placed at latitude: ${latitude}, longitude: ${longitude}`);
    },
});