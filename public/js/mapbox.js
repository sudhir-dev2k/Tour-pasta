console.log('hellow from client');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoic3VkaGlyMjIiLCJhIjoiY2tteDZ2ZW05MDNlMzJzbXVyYXV2MWd0cyJ9.x-kFKbzO3kfBaP6wXDfSJw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sudhir22/ckmx7n09z0kbe17n231ec9w6g',
  center: [72.57007261025468, 23.024635941645666],
});
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day${loc.day}:${loc.description}</p>`)
    .addTo(map);
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 100,
  },
});
