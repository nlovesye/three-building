import { Color, AmbientLight } from 'three';

// 创建PointLight
export function createXKAmbientLight() {
  const light = new AmbientLight(new Color(0xffffff), 0.85);
  light.name = 'AMBIENT_LIGHT';

  return light;
}
