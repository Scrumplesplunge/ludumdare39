class Creature extends PhysicsObject {
  constructor(position, config) {
    super(position, 28);

    this.config = config;

    // These properties are expected to be set by external code.
    this.movement = 0;  // -1 for left, 0 for stationary, 1 for right.
    this.bones = false;  // Set to true to only show the skeleton.

    // These properties are maintained internally.
    this.previousMovement = 0;  // Used to detect if movement changed.
    this.currentlyOnGround = false;  // Is creature on the ground this frame?
    this.previouslyOnGround = false;  // Was creature on the ground last frame?

    // These properties control the current sprite for the creature.
    this.direction = Sprites.codes.creature.direction.right;
    this.state = Sprites.codes.creature.state.stationary;
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

    // Update the creature sprite.
    var codes = Sprites.codes.creature;
    this.animationTime += delta;
    // Update the sprite config if necessary.
    if (this.movement != this.previousMovement) {
      this.animationTime = 0;
      switch (this.movement) {
        case -1:
          this.direction = codes.direction.left;
          this.state = codes.state.running;
          break;
        case 0:
          // Leave the direction untouched.
          this.state = codes.state.stationary;
          break;
        case 1:
          this.direction = codes.direction.right;
          this.state = codes.state.running;
          break;
      }
    }
    this.previousMovement = this.movement;
    // Select the appropriate sprite from the animation.
    if (!this.onGround()) {
      this.sprite = this.direction + codes.state.jumping;
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
  jump() { if (this.onGround()) this.velocity.y = this.config.jumpSpeed; }
  draw(context) {
    var part = Sprites.codes.creature.part;
    var parts = this.bones ? [part.bones] : [part.shoes, part.skin, part.robe];
    parts.forEach(part => {
      Sprites.sheet.wizard.draw(
          context, this.sprite + part,
          this.position.x - 32, this.position.y - 32, 64, 64);
    });
  }
}
