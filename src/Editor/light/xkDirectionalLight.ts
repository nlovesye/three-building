import { Color, DirectionalLight } from 'three';

import { DEFAULT_WORLD_RADIUS } from '../index';

// 创建DirectionalLight
export function createXKDirectionalLight() {
  const light = new DirectionalLight(new Color(0xffffff), 0.65);
  light.name = 'DIRECTIONAL_LIGHT';
  light.position.set(
    DEFAULT_WORLD_RADIUS * 0.5,
    DEFAULT_WORLD_RADIUS * 0.5,
    DEFAULT_WORLD_RADIUS * 0.7,
  );
  light.shadow.mapSize.width = 8192;
  light.shadow.mapSize.height = 8192;
  light.shadow.bias = -0.0001;
  const d = DEFAULT_WORLD_RADIUS;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;
  light.shadow.camera.near = 0;
  light.shadow.camera.far = DEFAULT_WORLD_RADIUS * 2;

  return light;
}
