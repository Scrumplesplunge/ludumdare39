class Monster extends Creature {
  constructor(position) {
    super(position, "monster");
    this.target = null;
  }
  update(delta) {
    super.update(delta);

    if (this.target != null && this.target.life > 0) {
      var offset = this.target.position.sub(this.position);
      var distance = offset.length();
      if (distance < 20) {
        // We are within attack range.
        if (this.onGround()) {
          this.jump();
          this.target.hurt(Config.creatures.monster.attackDamage);
        }
        return;
      } else if (distance < Config.creatures.monster.chaseRange) {
        // Follow the target.
        this.movement = offset.x < 0 ? -1 : 1;
        return;
      }
    }
    // Move randomly.
    var p = Math.pow(0.1, delta);
    if (Math.random() > p) this.movement = Math.floor(3 * Math.random()) - 1;
  }
}
