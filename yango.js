let map, geocoder, distanceService, directionsService, directionsRenderer;
let latestFare = 0;

function initMap() {
  geocoder = new google.maps.Geocoder();
  distanceService = new google.maps.DistanceMatrixService();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  geocoder.geocode({ address: 'Luanshya District, Zambia' }, (results, status) => {
    if (status === 'OK') {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: results[0].geometry.location
      });
      directionsRenderer.setMap(map);

      map.addListener('dblclick', (e) => {
        const latLng = e.latLng;
        if (!document.getElementById('start').value) {
          document.getElementById('start').value = `${latLng.lat().toFixed(5)}, ${latLng.lng().toFixed(5)}`;
        } else {
          document.getElementById('end').value = `${latLng.lat().toFixed(5)}, ${latLng.lng().toFixed(5)}`;
        }
      });

      new google.maps.places.Autocomplete(document.getElementById('start'));
      new google.maps.places.Autocomplete(document.getElementById('end'));
    }
  });

  checkExistingBooking();
}

function estimateFare() {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const passengers = parseInt(document.getElementById('passengers').value) || 1;
  const hasLuggage = document.getElementById('has-luggage').checked;
  if (!start || !end) return alert("Enter both start and end locations");

  distanceService.getDistanceMatrix({
    origins: [start],
    destinations: [end],
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status === 'OK') {
      const element = response.rows[0].elements[0];
      const km = element.distance.value / 1000;
      const eta = element.duration.text;
      latestFare = (km / 4) * 20;
      const extraPassengers = passengers - 1;
      const extraCharge = extraPassengers * (latestFare / 2);
      const luggageCharge = hasLuggage ? 10 : 0;
      const totalFare = latestFare + extraCharge + luggageCharge;

      document.getElementById('cart-total').innerHTML = `<strong>Estimated Fare:</strong> K${totalFare.toFixed(2)}${hasLuggage ? ' (Includes luggage)' : ''}`;
      document.getElementById('eta').innerText = `Distance: ${km.toFixed(1)} km, ETA: ${eta}`;

      directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
      }, (result, status) => {
        if (status === 'OK') directionsRenderer.setDirections(result);
      });
    }
  });
}

function confirmBooking() {
  const phone = document.getElementById('phone').value.trim();
  const time = document.getElementById('pickup-time').value.trim();
  const start = document.getElementById('start').value.trim();
  const end = document.getElementById('end').value.trim();
  const passengers = parseInt(document.getElementById('passengers').value) || 1;
  const hasLuggage = document.getElementById('has-luggage').checked;

  if (!start || !end || !phone || !time || !latestFare)
    return alert("Fill all fields and estimate fare first");

  const existing = localStorage.getItem('activeBooking');
  if (existing && !confirm('You already have an active booking. Do you want to proceed with a new one?')) return;

  const extraPassengers = passengers - 1;
  const extraCharge = extraPassengers * (latestFare / 2);
  const luggageCharge = hasLuggage ? 10 : 0;
  const totalFare = latestFare + extraCharge + luggageCharge;

  const booking = { phone, start, end, time, fare: totalFare.toFixed(2), passengers, hasLuggage };
  localStorage.setItem('activeBooking', JSON.stringify(booking));

  // SEND TO GOOGLE SHEET
  fetch("YOUR_WEB_APP_URL", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(booking)
  }).then(response => response.text())
    .then(data => console.log("Sent to Google Sheet:", data))
    .catch(error => console.error("Error sending to Google Sheet:", error));

  document.getElementById('booking-msg').innerText = 'Booking Confirmed!';
  document.getElementById('active-booking').innerText = `Active Booking: ${phone}, ${start} to ${end} at ${time}`;
  document.getElementById('cancel-booking').style.display = 'inline-block';
}

function cancelBooking() {
  localStorage.removeItem('activeBooking');
  document.getElementById('booking-msg').innerText = '';
  document.getElementById('active-booking').innerText = 'Booking cancelled.';
  document.getElementById('cancel-booking').style.display = 'none';
}

function checkExistingBooking() {
  const booking = JSON.parse(localStorage.getItem('activeBooking') || 'null');
  if (booking) {
    document.getElementById('active-booking').innerText = `Active Booking: ${booking.phone}, ${booking.start} to ${booking.end} at ${booking.time}`;
    document.getElementById('cancel-booking').style.display = 'inline-block';
  }
}
