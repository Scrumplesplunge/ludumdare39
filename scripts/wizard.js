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
