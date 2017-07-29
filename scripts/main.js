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
  var stages = Sprites.wizard.state.running.length;
  var phase = Math.floor(3 * stages * time) % stages;
  var sprite = Sprites.wizard.direction.right +
               Sprites.wizard.state.running[phase];

  function drawPart(part) {
    Sprites.draw(event.context, sprite + part, 10, 10, 64, 64);
  }

  drawPart(Sprites.wizard.part.shoes);
  drawPart(Sprites.wizard.part.skin);
  drawPart(Sprites.wizard.part.robe);
});
