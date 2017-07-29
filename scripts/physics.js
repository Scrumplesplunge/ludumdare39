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
  disallowedDirection() { return allowedDirection().neg(); }
  draw(context) {
    context.beginPath();
    context.moveTo(this.a.x, this.a.y);
    context.lineTo(this.b.x, this.b.y);
    context.stroke();
  }
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
    this.objects = [];
  }
  add(objectOrBoundary) {
    if (objectOrBoundary instanceof Boundary) {
      this.boundaries.push(objectOrBoundary);
    } else if (objectOrBoundary instanceof PhysicsObject) {
      this.objects.push(objectOrBoundary);
    } else {
      throw Error("Only objects or boundaries can be added to a universe.");
    }
  }
  update(delta) {
    // Perform independent updates for all objects.
    for (var i = 0, n = this.objects.length; i < n; i++) {
      var object = this.objects[i];
      object.trigger({type: "update", delta: delta});
      object.position = object.position.add(object.velocity.mul(delta));
    }
    // Resolve collisions.
    for (var i = 0, n = this.objects.length; i < n; i++) {
      var object = this.objects[i];
      var radius = object.radius;
      for (var j = 0, m = this.boundaries.length; j < m; j++) {
        var boundary = this.boundaries[j];
        // Compute where the object is relative to the boundary.
        var lineDirection = boundary.b.sub(boundary.a);
        var offsetA = object.position.sub(boundary.a);
        var locationOnLine =
            lineDirection.dot(offsetA).div(lineDirection.squareLength());
        if (locationOnLine < 0 && offsetA.squareLength() < radius * radius) {
          // Collision with endpoint a.
          this.resolve(object, boundary, offsetA);
          continue;
        }
        var offsetB = object.position.sub(boundary.b);
        if (locationOnLine > 1 && offsetB.squareLength() < radius * radius) {
          // Collision with endpoint b.
          this.resolve(object, boundary, offsetB);
          continue;
        }
        var boundaryNormal = lineDirection.rotate90().normalized();
        var surfaceDistance = boundaryNormal.dot(offsetA);
        if (-radius < surfaceDistance && surfaceDistance < radius) {
          // Collision with surface.
          var offset = object.position.sub(boundaryNormal.mul(surfaceDistance));
          this.resolve(object, boundary, offset);
          continue;
        }
      }
    }
    removeIf(object => object.removed, this.objects);
    removeIf(boundary => boundary.removed, this.boundaries);
  }
  resolve(object, boundary, offset) {
    // Move the object along the offset vector until it is no longer
    // intersecting.
    var offsetLength = offset.length();
    var adjustment = offset.mul((object.radius - offsetLength) / offsetLength);
    object.position = object.position.add(adjustment);

    var disallowedDirection = boundary.disallowedDirection().normalized();
    var disallowedComponent = object.velocity.dot(disallowedDirection);
    if (disallowedComponent < 0) return;  // Direction of movement is allowed.

    object.velocity =
        object.velocity.sub(disallowedDirection.mul(disallowedComponent));
    object.trigger({type: "collide", boundary: boundary, offset: offset});
  }
  draw(context) {
    if (Config.showBoundaries)
      this.boundaries.forEach(boundary => boundary.draw(context));
    this.objects.forEach(object => object.draw(context));
  }
}
