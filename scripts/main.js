var demoState = new EventManager("demo");

Game.startState.on("enter", function(event) {
  var barrier = new AsyncBarrier;
  Sprites.load(barrier.increment());
  barrier.wait(() => Game.switchState(demoState));
});

var time = 0;
demoState.on("update", function(event) {
  time += event.delta;
});

demoState.on("draw", function(event) {
  var canvas = event.context.canvas;
  event.context.clearRect(0, 0, canvas.width, canvas.height);
  var stages = Sprites.State.RUNNING.length;
  var phase = Math.floor(3 * stages * time) % stages;
  var sprite = Sprites.Direction.RIGHT + Sprites.State.RUNNING[phase];

  Sprites.draw(event.context, sprite + Sprites.Part.SHOES, 10, 10, 64, 64);
  Sprites.draw(event.context, sprite + Sprites.Part.SKIN, 10, 10, 64, 64);
  Sprites.draw(event.context, sprite + Sprites.Part.ROBE, 10, 10, 64, 64);
});
