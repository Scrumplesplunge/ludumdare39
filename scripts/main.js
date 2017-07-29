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

var universe = new Universe;
var wizard = new Wizard(new Vector(100, 100));
universe.add(wizard);

function addShape(boundaries) {
  if (boundaries.length < 2) return;
  for (var i = 1, n = boundaries.length; i < n; i++) {
    var a = boundaries[i - 1];
    var b = boundaries[i];
    universe.add(new Boundary(new Vector(a[0], a[1]), new Vector(b[0], b[1])));
  }
  var last = boundaries[boundaries.length - 1];
  var first = boundaries[0];
  universe.add(new Boundary(new Vector(last[0], last[1]),
                            new Vector(first[0], first[1])));
}

// Add the outer boundaries.
addShape([
  [10, 10],
  [500, 10],
  [500, 300],
  [400, 275],
  [300, 300],
  [200, 275],
  [100, 300],
  [10, 300],
]);
// Add a floating obstacle.
addShape([
  [300, 225],
  [400, 200],
  [200, 200],
]);

// Add an isolated boundary that can only be walked through in one direction.
universe.add(new Boundary(new Vector(400, 200), new Vector(400, 275)));

// An item is something a wizard can collect.
class Item extends Effect {
  constructor(sprite, position, radius, spriteRadius) {
    super(position, radius);
    this.sprite = sprite;
    this.spriteRadius = spriteRadius || radius;
  }
  activate(object) {
    console.log("Activated!");
    if (object instanceof Wizard) {
      this.remove();
    }
  }
  draw(context) {
    var x = this.position.x, y = this.position.y, r = this.spriteRadius;
    Sprites.draw(context, this.sprite, x - r, y - r, 2 * r, 2 * r);
  }
}

universe.add(new Item(Sprites.items.orb, new Vector(450, 230), 10, 20));

var time = 0;
demoState.on("update", function(event) {
  time += Config.updateDelay;
  universe.update(Config.updateDelay);
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
  event.context.clearRect(0, 0, canvas.width, canvas.height);
  universe.draw(event.context);
});
