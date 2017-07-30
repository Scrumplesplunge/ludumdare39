class Wizard extends Creature {
  constructor(position) {
    super(position, "wizard");
    this.items = [];  // Things collected by the wizard.
    this.life = Config.creatures.wizard.maxLife;
  }
  update(delta) {
    super.update(delta);
    this.hurt(Config.creatures.wizard.lifeLostPerSecond * delta);
  }
  give(item) {
    if (!(item instanceof Item)) throw Error("Only items can be given.");
    this.items.push(item);
  }
  heal(amount) {
    this.life = Math.min(this.life + amount, Config.creatures.wizard.maxLife);
  }
  hurt(amount) {
    this.life -= amount;
    if (this.life <= 0) {
      console.log("Wizard died.");
      this.trigger({type: "death"});
      this.remove();
    }
  }
}
