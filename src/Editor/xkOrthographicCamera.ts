import { OrthographicCamera } from 'three';

import { DEFAULT_WORLD_RADIUS } from './index';

const DEFAULT_CAMERA_ZOOM = 5;

// 创建XKOrthographicCamera
export function createXKOrthographicCamera(container: HTMLDivElement) {
  const size = container.getBoundingClientRect();
  const aspect = size.width / size.height;
  const frustumSize = DEFAULT_WORLD_RADIUS;
  const frustumWidth = frustumSize * aspect;
  const frustumHeight = frustumSize;

  const camera = new OrthographicCamera(
    -frustumWidth / 2,
    frustumWidth / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0,
    DEFAULT_WORLD_RADIUS * 2,
  );
  camera.name = 'ORTHOGRAPHIC_CAMERA';
  camera.position.set(DEFAULT_WORLD_RADIUS / 2, DEFAULT_WORLD_RADIUS, DEFAULT_WORLD_RADIUS);
  camera.zoom = DEFAULT_CAMERA_ZOOM;
  camera.updateProjectionMatrix();

  return camera;
}

export function resizeOrthographicCamera(target: OrthographicCamera, size: DOMRect) {
  const aspect = size.width / size.height;
  const frustumSize = DEFAULT_WORLD_RADIUS;
  const frustumWidth = frustumSize * aspect;
  const frustumHeight = frustumSize;
  target.left = -frustumWidth / 2;
  target.right = frustumWidth / 2;
  target.top = frustumHeight / 2;
  target.bottom = -frustumHeight / 2;
  target.updateProjectionMatrix();
}
