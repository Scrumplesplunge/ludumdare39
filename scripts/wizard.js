class Wizard extends Creature {
  constructor(position) {
    super(position, "wizard");
    this.items = [];  // Things collected by the wizard.
    this.life = 100;  // Life force is consumed as the level progresses.
  }
  update(delta) {
    super.update(delta);
    this.life -= Config.creatures.wizard.lifeLostPerSecond * delta;
    if (this.life <= 0) {
      console.log("NOOOOOO!");
      this.trigger({type: "death"});
      this.remove();
    }
  }
  give(item) {
    if (!(item instanceof Item)) throw Error("Only items can be given.");
    this.items.push(item);
  }
}
