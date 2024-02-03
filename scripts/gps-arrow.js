AFRAME.registerComponent('gps-arrow', {
    schema: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      color: { default: '#ff0000' },
    },
  
    init: function () {
      const { latitude, longitude, color } = this.data;
  
      const arrow = document.createElement('a-entity');
      arrow.setAttribute('gps-arrow', { latitude, longitude, color });
      arrow.setAttribute('geometry', { primitive: 'cone', radius: 0.2, height: 0.5 });
      arrow.setAttribute('material', { color });
  
      this.el.appendChild(arrow);
    },
  });
  