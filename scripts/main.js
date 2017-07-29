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
    super(position, 32);
    // -1 for left, 0 for stationary, 1 for right.
    this.movement = 0;
    this.previousMovement = 0;
    this.direction = Sprites.wizard.direction.right;
    this.state = Sprites.wizard.state.stationary;
    this.sprite = this.direction + this.state;
    this.animationTime = 0;
    this.on("update", event => this.update(event.delta));
  }
  update(delta) {
    this.animationTime += delta;
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
    if (this.state instanceof Array) {
      var phase = Math.floor(Config.animationFrameRate * this.animationTime);
      this.sprite = this.direction + this.state[phase % this.state.length];
    } else {
      this.sprite = this.direction + this.state;
    }
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

var time = 0;
demoState.on("update", function(event) {
  time += event.delta;
  universe.update(event.delta);
});

demoState.on("draw", function(event) {
  var canvas = event.context.canvas;
  wizard.movement = Math.round(Math.sin(time));
  event.context.clearRect(0, 0, canvas.width, canvas.height);
  universe.draw(event.context);
});
