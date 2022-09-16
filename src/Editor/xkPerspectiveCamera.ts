import { PerspectiveCamera } from 'three';

import { DEFAULT_WORLD_RADIUS } from './index';

const DEFAULT_CAMERA_NEAR = 0.1;

// 创建XKPerspectiveCamera
export function createXKPerspectiveCamera(container: HTMLDivElement) {
  const camera = new PerspectiveCamera();
  camera.name = 'PERSPECTIVE_CAMERA';

  camera.fov = 75;
  camera.near = DEFAULT_CAMERA_NEAR * 100; // 透视模式下，near取默认0.1会出现材质交错闪烁情况，这里取默认的100倍解决。
  camera.far = DEFAULT_WORLD_RADIUS * 2;
  camera.position.set(0, 500, 0);
  const size = container.getBoundingClientRect();
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  return camera;
}

export function resizePerspectiveCamera(target: PerspectiveCamera, size: DOMRect) {
  target.aspect = size.width / size.height;
  target.updateProjectionMatrix();
}
