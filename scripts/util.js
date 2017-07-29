// When writing async interfaces, it is easier to reason about them if you know
// for certain that the callback will not run until the caller has finished
// executing. By scheduling the callback using setTimeout, we guarantee this.
function schedule(callback) {
  setTimeout(callback, 0);
}
