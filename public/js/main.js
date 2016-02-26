var socket = io('http://localhost:3000');

socket.on('disconnect', function() {
  setTitle("Disconnected");
});

socket.on('connect', function() {
  setTitle("Connected to Discovering Discover Web App");
});

document.getElementById('button').addEventListener('click', function() {
  alert("Sending to API. . .");
  socket.emit('send to hod', '');
});

document.forms[0].onsubmit = function() {
  var input = document.getElementById('search');
  socket.emit('search', input.value);
};

function setTitle(title) {
  document.querySelector('h1').innerHTML = title;
}
