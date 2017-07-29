var canvas;
var context;

window.addEventListener("load", function() {
  canvas = document.getElementById("screen");
  context = canvas.getContext("2d");
  context.fillRect(10, 10, 10, 10);
});
