Game.startState.on("draw", function(event) {
  var canvas = event.context.canvas;
  event.context.clearRect(0, 0, canvas.width, canvas.height);
  event.context.fillRect(10, 10, 10, 10);
});
