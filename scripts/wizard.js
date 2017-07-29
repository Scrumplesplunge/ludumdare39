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
    this.items = [];
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
  give(item) {
    if (!(item instanceof Item)) throw Error("Only items can be given.");
    this.items.push(item);
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
      object.give(this);
      this.remove();
    }
  }
  draw(context) {
    var x = this.position.x, y = this.position.y, r = this.spriteRadius;
    Sprites.draw(context, this.sprite, x - r, y - r, 2 * r, 2 * r);
  }
}

// A reward is something that a wizard already earned, but they don't get it
// until it reaches them.
class RewardItem extends Item {
  constructor(owner, sprite, position, radius, spriteRadius) {
    super(sprite, position, radius, spriteRadius);
    this.owner = owner;
    this.on("update", event => this.update(event.delta));
  }
  update(delta) {
    var offset = this.owner.position.sub(this.position);
    var jump = delta * Config.rewardSpeed;
    if (offset.squareLength() < jump * jump) {
      this.position = this.owner.position;
    } else {
      offset = offset.normalized().mul(jump);
      this.position = this.position.add(offset);
    }
  }
  activate(object) {
    if (object != this.owner) return;
    this.owner.give(this);
    this.remove();
  }
}
