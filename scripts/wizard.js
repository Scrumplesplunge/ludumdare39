class Wizard extends PhysicsObject {
  constructor(position) {
    super(position, 28);
    // -1 for left, 0 for stationary, 1 for right.
    this.movement = 0;
    this.previousMovement = 0;
    this.direction = Sprites.codes.creature.direction.right;
    this.state = Sprites.codes.creature.state.stationary;
    this.sprite = this.direction + this.state;
    this.animationTime = 0;
    this.currentlyOnGround = false;
    this.previouslyOnGround = false;
    this.items = [];
    this.bones = false;  // If true, show only the bones of the wizard.
    this.on("update", event => this.update(event.delta));
    this.on("collide", event => this.collide(event.boundary));
  }
  update(delta) {
    var codes = Sprites.codes.creature;
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
  jump() {
    if (this.onGround()) this.velocity.y = -Config.wizard.jumpSpeed;
  }
  give(item) {
    if (!(item instanceof Item)) throw Error("Only items can be given.");
    this.items.push(item);
  }
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
