// A boundary is a one-way forcefield. The player may move through in one
// direction, but will not pass through in the other direction. If the first
// point is to the left, and the second point is to the right, then the player
// may move upwards through the boundary but not downwards.
class Boundary {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.removed = false;
  }
  allowedDirection() { return this.b.sub(this.a).rotate90(); }
  disallowedDirection() { return this.allowedDirection().neg(); }
  draw(context) {
    context.beginPath();
    context.moveTo(this.a.x, this.a.y);
    context.lineTo(this.b.x, this.b.y);
    context.stroke();
  }
  remove() { this.removed = true; }
}

// An effect is like a boundary, except that an intersection does not result in
// collision resolution. Instead, it activates custom effects.
class Effect {
  constructor(position, radius) {
    this.position = position;
    this.radius = radius;
    this.removed = false;
  }
  activate(object) {
    throw new Error("No activate function provided for effect.");
  }
  draw(context) {}
  remove() { this.removed = true; }
}

// A physics object is something which collides with the world. They are
// modelled as circles for simplicity.
class PhysicsObject extends EventManager {
  constructor(position, radius) {
    super("physicsobject");
    this.position = position;
    this.velocity = new Vector(0, 0);
    this.radius = radius;
    this.removed = false;
  }
  draw(context) { throw new Error("No draw function provided for object."); }
  remove() { this.removed = true; }
}

class Universe {
  constructor() {
    this.boundaries = [];
    this.effects = [];
    this.objects = [];
  }
  add(x) {
    if (x instanceof Boundary) {
      this.boundaries.push(x);
    } else if (x instanceof Effect) {
      this.effects.push(x);
    } else if (x instanceof PhysicsObject) {
      this.objects.push(x);
    } else {
      throw Error("Invalid type to add to universe.");
    }
  }
  update(delta) {
    // Perform independent updates for all objects.
    var gravity = new Vector(0, Config.gravity);
    for (var i = 0, n = this.objects.length; i < n; i++) {
      var object = this.objects[i];
      object.trigger({type: "update", delta: delta});
      object.velocity = object.velocity.add(gravity);
      object.position = object.position.add(object.velocity.mul(delta));
    }
    this.resolveCollisions();
    this.activateEffects();
    removeIf(boundary => boundary.removed, this.boundaries);
    removeIf(effect => effect.removed, this.effects);
    removeIf(object => object.removed, this.objects);
  }
  resolveCollisions() {
    for (var i = 0, n = this.objects.length; i < n; i++) {
      var object = this.objects[i];
      if (object.removed) continue;
      var radius = object.radius;
      for (var j = 0, m = this.boundaries.length; j < m; j++) {
        var boundary = this.boundaries[j];
        if (boundary.removed) continue;
        // Compute where the object is relative to the boundary.
        var lineDirection = boundary.b.sub(boundary.a);
        var offsetA = object.position.sub(boundary.a);
        var locationOnLine =
            lineDirection.dot(offsetA) / lineDirection.squareLength();
        if (locationOnLine < 0) {
          if (offsetA.squareLength() < radius * radius) {
            // Collision with endpoint a.
            this.resolve(object, boundary, offsetA);
          }
          continue;
        }
        var offsetB = object.position.sub(boundary.b);
        if (locationOnLine > 1) {
          if (offsetB.squareLength() < radius * radius) {
            // Collision with endpoint b.
            this.resolve(object, boundary, offsetB);
          }
          continue;
        }
        var boundaryNormal = lineDirection.rotate90().normalized();
        var surfaceDistance = boundaryNormal.dot(offsetA);
        if (-radius < surfaceDistance && surfaceDistance < radius) {
          // Collision with surface.
          var offset = boundaryNormal.mul(surfaceDistance);
          this.resolve(object, boundary, offset);
          continue;
        }
      }
    }
  }
  resolve(object, boundary, offset) {
    var disallowedDirection = boundary.disallowedDirection().normalized();
    var disallowedComponent = object.velocity.dot(disallowedDirection);
    if (disallowedComponent < 0) return;  // Direction of movement is allowed.

    object.velocity =
        object.velocity.sub(disallowedDirection.mul(disallowedComponent));

    // Move the object along the offset vector until it is no longer
    // intersecting.
    var offsetLength = offset.length();
    var adjustment = offset.mul((object.radius - offsetLength) / offsetLength);
    object.position = object.position.add(adjustment);
    object.trigger({type: "collide", boundary: boundary, offset: offset});
  }
  activateEffects() {
    for (var i = 0, n = this.objects.length; i < n; i++) {
      var object = this.objects[i];
      if (object.removed) continue;
      for (var j = 0, m = this.effects.length; j < m; j++) {
        var effect = this.effects[i];
        if (effect.removed) continue;
        var offset = effect.position.sub(object.position);
        var combinedRadius = object.radius + effect.radius;
        if (offset.squareLength() < combinedRadius * combinedRadius)
          effect.activate(object);
      }
    }
  }
  draw(context) {
    if (Config.showBoundaries)
      this.boundaries.forEach(boundary => boundary.draw(context));
    this.effects.forEach(effect => effect.draw(context));
    this.objects.forEach(object => object.draw(context));
  }
}
