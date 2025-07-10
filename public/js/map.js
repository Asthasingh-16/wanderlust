document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");
  if (mapContainer && window.listingCoords) {
    const { lat, lng } = window.listingCoords;

    const map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup("This property is here!")
      .openPopup();
  }
});
