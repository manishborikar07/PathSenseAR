AFRAME.registerComponent('gps-path', {
    schema: {
      coordinates: { type: 'array' },
      color: { default: '#00ff00' },
    },
  
    init: function () {
      const { coordinates, color } = this.data;
  
      const path = document.createElement('a-entity');
      path.setAttribute('gps-path', { coordinates, color });
  
      const line = document.createElement('a-entity');
      line.setAttribute('line', {
        path: coordinates.map(coord => `${coord.longitude} ${coord.latitude} 0.1`).join(','),
        color,
      });
  
      path.appendChild(line);
      this.el.appendChild(path);
    },
  });
  