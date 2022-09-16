import { SphereBufferGeometry } from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky';

import { DEFAULT_WORLD_RADIUS } from '../index';

// 创建Sky
export function createXKSky() {
  const sky = new Sky();
  sky.name = 'SKY';
  sky.geometry = new SphereBufferGeometry(1, 32, 32) as any;
  (sky.material as any).name = 'skyMaterial';
  (sky.material as any).uniforms.sunPosition.value.set(
    DEFAULT_WORLD_RADIUS,
    DEFAULT_WORLD_RADIUS,
    DEFAULT_WORLD_RADIUS,
  );
  sky.scale.setScalar(DEFAULT_WORLD_RADIUS);

  return sky;
}
