var demoState = new EventManager("demo");
var horizon;
var wizard;

var pointHandlers = {
  "player": function(level, position, callback) {
    console.log("Spawning player at [%f, %f].", position.x, position.y);
    wizard = new Wizard(position);
    level.add(wizard);
    level.target = wizard;
    level.cameraPosition = position;
    schedule(callback);
  },
  "orb": function(level, position, callback) {
    level.add(new Item(Sprites.items.orb, position, 10, 20));
    schedule(callback);
  },
};

Game.startState.on("enter", function(event) {
  var barrier = new AsyncBarrier;
  level = new Level(Levels.demo, pointHandlers, barrier.increment());
  Sprites.load(barrier.increment());
  horizon = loadImage("horizon.png", barrier.increment());
  barrier.wait(() => Game.switchState(demoState));
});

var time = 0;
demoState.on("update", function(event) {
  time += event.delta;
});

var time = 0;
var focus = new Vector(0, 0);
demoState.on("update", function(event) {
  time += Config.updateDelay;
  level.update(Config.updateDelay);
});

var keyboard = new Keyboard(demoState);
keyboard.on("keydown", function(event) {
  switch (event.key) {
    case "a": wizard.movement -= 1; break;
    case "d": wizard.movement += 1; break;
    case "w": wizard.jump(); break;
  }
});

keyboard.on("keyup", function(event) {
  switch (event.key) {
    case "a": wizard.movement += 1; break;
    case "d": wizard.movement -= 1; break;
  }
});

demoState.on("draw", function(event) {
  var canvas = event.context.canvas;
  event.context.drawImage(horizon, 0, 0);
  level.draw(event.context);
});
