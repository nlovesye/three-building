import { Color, PointLight } from 'three';

// 创建PointLight
export function createXKPointLight() {
  const light = new PointLight(new Color(0x000000), 0.01);
  light.name = 'POINT_LIGHT';
  light.position.multiplyScalar(30);

  return light;
}
