// Arms that hold something: both hands brought to the sides of a thing carried before the body, the elbows bent
// and down. Worked out from where the bones are (shoulder, elbow, wrist), not from any clip, so it sits on top of
// whatever the figure is doing: standing, walking, running.
import * as THREE from 'three';

const S = new THREE.Vector3();
const E = new THREE.Vector3();
const W = new THREE.Vector3();
const T = new THREE.Vector3();
const axis = new THREE.Vector3();
const pole = new THREE.Vector3();
const elbow = new THREE.Vector3();
const from = new THREE.Vector3();
const to = new THREE.Vector3();
const turn = new THREE.Quaternion();
const world = new THREE.Quaternion();
const parent = new THREE.Quaternion();
const want = new THREE.Quaternion();

/** Turns a bone (by `k` of the way) so that the line from it to `tip` (a point in the world) lies towards `target`. */
function aim(bone, tip, target, k) {
  bone.getWorldPosition(from);
  to.copy(target).sub(from).normalize();
  from.subVectors(tip, from).normalize();
  turn.setFromUnitVectors(from, to);
  bone.getWorldQuaternion(world);
  bone.parent.getWorldQuaternion(parent);
  want.copy(parent).invert().multiply(turn).multiply(world);
  bone.quaternion.slerp(want, k);
  bone.updateWorldMatrix(false, true);
}

/**
 * Brings both hands to a thing held before him. `object` is the figure (its matrices up to date), facing `yaw`
 * (0 looks along +z); the thing is `out` metres before him and `up` metres from his feet, and `wide` is half its
 * width. `k` is how far into the pose he is, 0 to 1.
 */
export function holdArms(bones, object, yaw, { out = 0.3, up = 1, wide = 0.2 }, k = 1) {
  if (k <= 0.001) return;
  const fx = Math.sin(yaw);
  const fz = Math.cos(yaw);
  for (const side of ['l', 'r']) {
    const upper = bones[`upperarm_${side}`];
    const lower = bones[`lowerarm_${side}`];
    const hand = bones[`hand_${side}`];
    if (!upper || !lower || !hand) return;
    upper.getWorldPosition(S);
    lower.getWorldPosition(E);
    hand.getWorldPosition(W);
    // which side of him this shoulder is on: across him is (fz, 0, -fx), one way or the other
    const s = Math.sign((S.x - object.position.x) * fz - (S.z - object.position.z) * fx) || 1;
    // the wrist goes to the side of the thing, at its foot, a little short of it (the hand reaches on under it)
    T.set(object.position.x + fx * (out - 0.07) + fz * s * wide, object.position.y + up + 0.03, object.position.z + fz * (out - 0.07) - fx * s * wide);
    const a = S.distanceTo(E);
    const b = E.distanceTo(W);
    axis.subVectors(T, S);
    const d = Math.min(axis.length(), (a + b) * 0.985);
    axis.normalize();
    // the elbow: off the line from shoulder to wrist, down and out to his side and a little back
    pole.set(fz * s * 0.55 - fx * 0.35, -1, -fx * s * 0.55 - fz * 0.35);
    pole.addScaledVector(axis, -pole.dot(axis)).normalize();
    const along = (a * a + d * d - b * b) / (2 * d);
    const off = Math.sqrt(Math.max(0, a * a - along * along));
    elbow.copy(S).addScaledVector(axis, along).addScaledVector(pole, off);
    T.copy(S).addScaledVector(axis, d);
    aim(upper, E, elbow, k);
    lower.getWorldPosition(E);
    hand.getWorldPosition(W);
    aim(lower, W, T, k);
  }
}
