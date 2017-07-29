var canvas;
var context;

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function main() {
  canvas = document.getElementById("screen");
  context = canvas.getContext("2d");
  onResize();
  window.addEventListener("resize", onResize);
}

window.addEventListener("load", main);
