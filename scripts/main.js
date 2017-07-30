var runState = new EventManager("run");
var deathState = new EventManager("death");
var horizon;
var wizard;
var monster;
var level;

function loadLevel(level, loader) {
  var pointHandlers = {
    "player": function(level, position, callback) {
      console.log("Spawning player at [%f, %f].", position.x, position.y);
      wizard = new Wizard(position);
      wizard.on("death", () => Game.switchState(deathState));
      level.add(wizard);
      level.target = wizard;
      level.cameraPosition = position;
      schedule(callback);
    },
    "monster": function(level, position, callback) {
      monster = new Monster(position);
      level.add(monster);
      schedule(callback);
    },
    "orb": function(level, position, callback) {
      level.add(new Item(Sprites.codes.items.orb, position, 10, 20));
      schedule(callback);
    },
  };
  return new Level(level, pointHandlers, loader.loaded("level"));
}

Game.startState.on("enter", function(event) {
  var loader = new Loader("loader");
  horizon = loader.loadImage("images/horizon.png");
  Sprites.load(loader.loaded("sprites"));
  level = loadLevel(Levels.demo, loader);
  loader.waitUntilLoaded(() => Game.switchState(runState));
  Game.switchState(loader);
});

var focus = new Vector(0, 0);

function update(event) {
  level.update(Config.updateDelay);
  var offset = wizard.position.x - monster.position.x;
  if (Math.abs(offset) > 100) {
    monster.movement = offset < 0 ? -1 : 1;
  } else {
    monster.movement = 0;
  }
}

runState.on("update", update);

var keyboard = new Keyboard(runState);
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

function draw(event) {
  var canvas = event.context.canvas;
  event.context.drawImage(horizon, 0, 0);
  level.draw(event.context);
}

runState.on("draw", draw);

var deathStateTimeout = 0;
deathState.on("enter", function(event) {
  deathStateTimeout = Config.deathScreenTimeout;
  setTimeout(function() {
  }, 1000 * Config.deathScreenTimeout);
});

deathState.on("update", function(event) {
  update(event);
  deathStateTimeout -= event.delta;
  if (deathStateTimeout < 0) {
    var loader = new Loader("loader");
    level = loadLevel(Levels.demo, loader);
    loader.waitUntilLoaded(() => Game.switchState(runState));
    Game.switchState(loader);
  }
});

deathState.on("draw", function(event) {
  draw(event);
  with (event.context) {
    save();
      font = "50pt sans-serif";
      fillStyle = "#ff0000";
      textAlign = "center";
      textBaseline = "bottom";
      fillText("You died", canvas.width * 0.5, canvas.height * 0.5 - 10);
      font = "20pt sans-serif";
      textBaseline = "top";
      fillText("Respawning in " + deathStateTimeout.toFixed(1) + " seconds...",
               canvas.width * 0.5, canvas.height * 0.5 + 10);
    restore();
  }
});
