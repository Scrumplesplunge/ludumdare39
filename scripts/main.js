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

class Wizard extends PhysicsObject {
  constructor(position) {
    super(position, 28);
    // -1 for left, 0 for stationary, 1 for right.
    this.movement = 0;
    this.previousMovement = 0;
    this.direction = Sprites.wizard.direction.right;
    this.state = Sprites.wizard.state.stationary;
    this.sprite = this.direction + this.state;
    this.animationTime = 0;
    this.currentlyOnGround = false;
    this.previouslyOnGround = false;
    this.on("update", event => this.update(event.delta));
    this.on("collide", event => this.collide(event.boundary));
  }
  update(delta) {
    this.previouslyOnGround = this.currentlyOnGround;
    this.currentlyOnGround = false;
    this.animationTime += delta;
    this.velocity =
        new Vector(this.movement * Config.wizard.speed, this.velocity.y);
    // Update the sprite config if necessary.
    if (this.movement != this.previousMovement) {
      this.animationTime = 0;
      switch (this.movement) {
        case -1:
          this.direction = Sprites.wizard.direction.left;
          this.state = Sprites.wizard.state.running;
          break;
        case 0:
          // Leave the direction untouched.
          this.state = Sprites.wizard.state.stationary;
          break;
        case 1:
          this.direction = Sprites.wizard.direction.right;
          this.state = Sprites.wizard.state.running;
          break;
      }
    }
    this.previousMovement = this.movement;
    // Select the appropriate sprite from the animation.
    if (!this.onGround()) {
      this.sprite = this.direction + Sprites.wizard.state.jumping;
    } else if (this.state instanceof Array) {
      var phase = Math.floor(Config.animationFrameRate * this.animationTime);
      this.sprite = this.direction + this.state[phase % this.state.length];
    } else {
      this.sprite = this.direction + this.state;
    }
  }
  collide(boundary) {
    if (boundary.allowedDirection().y < 0) this.currentlyOnGround = true;
  }
  onGround() { return this.previouslyOnGround || this.currentlyOnGround; }
  jump() {
    if (this.onGround()) this.velocity.y = -Config.wizard.jumpSpeed;
  }
  draw(context) {
    Sprites.draw(context, this.sprite + Sprites.wizard.part.shoes,
                 this.position.x - 32, this.position.y - 32, 64, 64);
    Sprites.draw(context, this.sprite + Sprites.wizard.part.skin,
                 this.position.x - 32, this.position.y - 32, 64, 64);
    Sprites.draw(context, this.sprite + Sprites.wizard.part.robe,
                 this.position.x - 32, this.position.y - 32, 64, 64);
  }
}

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
