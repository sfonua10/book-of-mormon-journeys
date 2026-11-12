// A soft light seen in the air: the aura round the angel (1 Nephi 3:29), and the light that leads Nephi in the night
// (4:6). A round glow that always faces the eye, brightest at its heart, with faint slow rays. It adds light to what is
// behind it and leaves the frame's alpha alone, so the paint finish and the ink line round a figure (src/lib/frame.js)
// are not disturbed by it.
import * as THREE from 'three';

const vertex = /* glsl */ `
uniform vec3 uCentre;
uniform vec2 uSize;
uniform float uBack;
out vec2 vUv;
void main() {
  vUv = position.xy;
  vec4 c = viewMatrix * vec4(uCentre, 1.0);
  c.xy += position.xy * uSize;
  // (set back from the eye, so a figure in front of it is not covered by it)
  c.z -= uBack;
  gl_Position = projectionMatrix * c;
}
`;

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
uniform float uTime;
uniform float uRays;
in vec2 vUv;
layout(location = 0) out vec4 outC;
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  float core = exp(-r * r * 9.0);
  float soft = (1.0 - r) * (1.0 - r);
  float a = atan(vUv.y, vUv.x);
  float rays = uRays * (0.55 + 0.45 * sin(a * 9.0 + uTime * 0.25) * sin(a * 5.0 - uTime * 0.17)) * soft * smoothstep(0.08, 0.4, r);
  vec3 c = uColor * (core * 1.4 + soft * 0.55 + rays * 0.7) * uStrength;
  outC = vec4(c, 0.0);
}
`;

/**
 * @param scene where it is drawn
 * @param options color (linear rgb), width and height in metres, back: metres it is set behind its centre from the
 *   eye, rays: 0 to 1
 */
export function createHalo(scene, { color = [1.6, 1.5, 1.25], width = 3, height = 3, back = 0, rays = 0 } = {}) {
  const uniforms = {
    uCentre: { value: new THREE.Vector3() },
    uSize: { value: new THREE.Vector2(width / 2, height / 2) },
    uBack: { value: back },
    uColor: { value: new THREE.Color(...color) },
    uStrength: { value: 0 },
    uTime: { value: 0 },
    uRays: { value: rays },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;
  mesh.visible = false;
  scene.add(mesh);
  return {
    mesh,
    /** Puts it at (x, y, z), this bright (0 hides it). */
    set(x, y, z, strength) {
      uniforms.uCentre.value.set(x, y, z);
      uniforms.uStrength.value = strength;
      mesh.visible = strength > 0.002;
    },
    update(time) {
      uniforms.uTime.value = time;
    },
  };
}
