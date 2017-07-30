class Wizard extends Creature {
  constructor(position) {
    super(position, "wizard");
    this.items = [];  // Things collected by the wizard.
  }
  give(item) {
    if (!(item instanceof Item)) throw Error("Only items can be given.");
    this.items.push(item);
  }
}
