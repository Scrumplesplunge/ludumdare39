class Creature extends PhysicsObject {
  constructor(position, type) {
    super(position, 28);

    if (!Config.creatures.hasOwnProperty(type))
      throw Error("No creatures configuration for " + type);
    if (!Sprites.codes.creatures.hasOwnProperty(type))
      throw Error("No sprite codes for " + type);
    this.config = Config.creatures[type];
    this.sprites = Sprites.codes.creatures[type];

    // These properties are expected to be set by external code.
    this.movement = 0;  // -1 for left, 0 for stationary, 1 for right.

    // These properties are maintained internally.
    this.previousMovement = 0;  // Used to detect if movement changed.
    this.currentlyOnGround = false;  // Is creature on the ground this frame?
    this.previouslyOnGround = false;  // Was creature on the ground last frame?

    // These properties control the current sprite for the creature.
    this.direction = this.sprites.direction.right;
    this.state = this.sprites.state.stationary;
    this.sprite = this.direction + this.state;
    this.animationTime = 0;  // Used to progress animated sprites.

    this.on("update", event => this.update(event.delta));
    this.on("collide", event => this.collide(event.boundary));
  }
  update(delta) {
    // Cycle the ground state. If the creature is on the ground this frame,
    // a subsequent collision event will reset currentlyOnGround.
    this.previouslyOnGround = this.currentlyOnGround;
    this.currentlyOnGround = false;

    // Set the creature's velocity based on the movement instruction.
    this.velocity =
        new Vector(this.movement * this.config.speed, this.velocity.y);

    // Update the creatures sprite.
    this.animationTime += delta;
    // Update the sprite config if necessary.
    if (this.movement != this.previousMovement) {
      this.animationTime = 0;
      switch (this.movement) {
        case -1:
          this.direction = this.sprites.direction.left;
          this.state = this.sprites.state.running;
          break;
        case 0:
          // Leave the direction untouched.
          this.state = this.sprites.state.stationary;
          break;
        case 1:
          this.direction = this.sprites.direction.right;
          this.state = this.sprites.state.running;
          break;
      }
    }
    this.previousMovement = this.movement;
    // Select the appropriate sprite from the animation.
    if (!this.onGround()) {
      this.sprite = this.direction + this.sprites.state.jumping;
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
  moveRandomly(delta) {
    var p = Math.pow(0.1, delta);
    if (Math.random() > p)
      this.movement = Math.floor(3 * Math.random()) - 1;
  }
  jumpRandomly(delta) {
    var p = Math.pow(0.5, delta);
    if (Math.random() > p) this.jump();
  }
  onGround() { return this.previouslyOnGround || this.currentlyOnGround; }
  jump() { if (this.onGround()) this.velocity.y = -this.config.jumpSpeed; }
  draw(context) {
    Sprites.sheet.animals.draw(
        context, this.sprite,
        this.position.x - 32, this.position.y - 32, 64, 64);
  }
}

class Pig extends Creature {
  constructor(position) {
    super(position, "pig");

    this.on("update", event => {
      this.moveRandomly(event.delta);
      this.jumpRandomly(event.delta);
    });
  }
}
