var deathState = new EventManager("death");
var successState = new EventManager("success");
var pauseState = new EventManager("pause");
var endState = new EventManager("end");
var horizon;
var wizard;
var monster;
var level;
var portal;

// This is the sequence of levels that occur after the demo level.
var levelSequence = [
  Levels.demo,
];

class Portal extends Effect {
  constructor(position) {
    super(position, 10);
    this.animationTime = 0;
    this.on("update", event => this.animationTime += event.delta);
  }
  activate(object) {
    if (object instanceof Wizard) {
      console.log("Portal reached.");
      object.remove();
      Game.switchState(successState);
    }
  }
  draw(context) {
    var portal = Sprites.codes.items.portal;
    var phase = Math.floor(Config.animationFrameRate * this.animationTime);
    var sprite = portal[phase % portal.length];
    var x = this.position.x, y = this.position.y, r = 50;
    Sprites.sheet.items.draw(context, sprite, x - r, y - r, 2 * r, 2 * r);
  }
}

function drawStatus(event) {
  with (event.context) {
    save();
      // Write the level name at the top.
      font = "20pt sans-serif";
      textBaseline = "top";
      fillStyle = "#000000";
      fillText("Level: " + level.name, 10, 10);

      if (!wizard.removed) {
        // Render the life bar.
        var fraction = wizard.life / Config.creatures.wizard.maxLife;
        var maxWidth = Config.screen.width - 20;
        fillStyle = "#ff0000";
        fillRect(10, Config.screen.height - 30, fraction * maxWidth, 20);
        if (wizard.selectedItem < wizard.items.length) {
          Sprites.sheet.items.draw(
              event.context, Sprites.codes.items.selection,
              10 + 64 * wizard.selectedItem, Config.screen.height - 94, 64, 64);
        }
        for (var i = 0, n = wizard.items.length; i < n; i++) {
          Sprites.sheet.items.draw(event.context, wizard.items[i].sprite,
                                   10 + 64 * i, Config.screen.height - 94,
                                   64, 64);
        }
      }
    restore();
  }
}

function configureLevel(level) {
  level.on("enter", () => monster.target = wizard);
  level.keyboard.on("keydown", function(event) {
    if (event.key == "Escape") Game.switchState(pauseState);
  });
  level.on("draw", drawStatus);
}

function loadLevel(levelData, loader) {
  var pointHandlers = {
    "player": function(level, position, callback) {
      console.log("Spawning player at [%f, %f].", position.x, position.y);
      wizard = new Wizard(position);
      wizard.on("death", function(event) {
        level.randomParticles(wizard.position, 30, 50, 200, 0.5);
        Game.switchState(deathState);
      });
      level.keyboard.on("keydown", function(event) {
        switch (event.key) {
          case "a": wizard.movement -= 1; break;
          case "d": wizard.movement += 1; break;
          case "w": wizard.jump(); break;
        }
        if (event.key.length == 1 && "0" <= event.key && event.key <= "9")
          wizard.trySelectItem(+event.key);
      });
      level.keyboard.on("keyup", function(event) {
        switch (event.key) {
          case "a": wizard.movement += 1; break;
          case "d": wizard.movement -= 1; break;
        }
      });
      level.on("mousedown", function(event) {
        wizard.tryCast(level.mousePosition);
      });
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
    "health": function(level, position, callback) {
      level.add(new Health(position, 50));
      schedule(callback);
    },
    "transformSpell": function(level, position, callback) {
      level.add(new TransformSpell(position));
      schedule(callback);
    },
    "portal": function(level, position, callback) {
      portal = new Portal(position);
      level.add(portal);
      schedule(callback);
    },
  };
  var level = new Level(levelData, pointHandlers, loader.loaded("level"));
  configureLevel(level);
  return level;
}

Game.startState.on("enter", function(event) {
  var loader = new Loader("loader");
  horizon = loader.loadImage("images/horizon.png");
  Sprites.load(loader.loaded("sprites"));
  level = loadLevel(Levels.demo, loader);
  loader.waitUntilLoaded(() => Game.switchState(level));
  Game.switchState(loader);
});

function drawOverlay(context, color, title, subtitle) {
  with (context) {
    save();
      globalAlpha = 0.5;
      fillStyle = "#000000";
      fillRect(0, 0, canvas.width, canvas.height);
      globalAlpha = 1;
      fillStyle = color;
      textAlign = "center";
      font = "50pt sans-serif";
      textBaseline = "bottom";
      fillText(title, canvas.width * 0.5, canvas.height * 0.5 - 10);
      font = "20pt sans-serif";
      textBaseline = "top";
      fillText(subtitle, canvas.width * 0.5, canvas.height * 0.5 + 10);
    restore();
  }
}

var deathStateTimeout = 0;
deathState.on("enter", function(event) {
  level.trigger(event);
  deathStateTimeout = Config.deathScreenTimeout;
});

deathState.on("update", function(event) {
  level.trigger(event);
  deathStateTimeout -= event.delta;
  if (deathStateTimeout < 0) {
    var loader = new Loader("loader");
    level = loadLevel(Levels.demo, loader);
    loader.waitUntilLoaded(() => Game.switchState(level));
    Game.switchState(loader);
  }
});

deathState.on("draw", function(event) {
  level.trigger(event);
  drawOverlay(event.context, "#ff0000", "You died",
              "Respawning in " + deathStateTimeout.toFixed(1) + " seconds...");
});

var successStateTimeout = 0;
successState.on("enter", function(event) {
  if (levelSequence.length == 0) Game.switchState(endState);
  successStateTimeout = Config.successScreenTimeout;
});

successState.on("update", function(event) {
  level.trigger(event);
  successStateTimeout -= event.delta;
  if (successStateTimeout < 0) {
    var nextLevel = levelSequence.shift();
    var loader = new Loader("loader");
    level = loadLevel(nextLevel, loader);
    loader.waitUntilLoaded(() => Game.switchState(level));
    Game.switchState(loader);
  }
});

successState.on("draw", function(event) {
  level.trigger(event);
  drawOverlay(event.context, "#00ff00", "Success!",
              "Continuing in " + successStateTimeout.toFixed(1) +
              " seconds...");
});

var previousState;  // Stores the state that we paused from.
pauseState.on("enter", function(event) {
  previousState = event.from;
});

pauseState.on("keydown", function(event) {
  if (event.key == "Escape") Game.switchState(previousState);
});

pauseState.on("draw", function(event) {
  level.trigger(event);
  drawOverlay(event.context, "#ffffff", "Paused", "Press ESC to resume.");
});

endState.on("update", function(event) {
  level.trigger(event);
});

endState.on("draw", function(event) {
  level.trigger(event);
  drawOverlay(event.context, "#00ff00", "Game Complete!",
              "Thanks for playing!");
});
