// An item is something a wizard can collect.
class Item extends Effect {
  constructor(sprite, position, radius, spriteRadius) {
    super(position, radius);
    this.sprite = sprite;
    this.spriteRadius = spriteRadius || radius;
  }
  activate(object) {
    console.log("Item collected.");
    if (object instanceof Wizard) {
      object.give(this);
      this.remove();
    }
  }
  draw(context) {
    var x = this.position.x, y = this.position.y, r = this.spriteRadius;
    Sprites.sheet.items.draw(context, this.sprite, x - r, y - r, 2 * r, 2 * r);
  }
}

class Health extends Effect {
  constructor(position, amount) {
    super(position, 10);
    this.amount = amount;
  }
  activate(object) {
    if (object instanceof Wizard) {
      console.log("Health +" + this.amount);
      object.heal(this.amount);
      this.remove();
    }
  }
  draw(context) {
    var x = this.position.x, y = this.position.y, r = 20;
    Sprites.sheet.items.draw(
        context, Sprites.codes.items.orb, x - r, y - r, 2 * r, 2 * r);
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
