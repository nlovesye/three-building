import type { OrthographicCamera, PerspectiveCamera } from 'three';
import { Spherical, Vector3 } from 'three';
import { customAnimation } from '@xkool/utils';

import { createXKOrthographicCamera } from './xkOrthographicCamera';
import { createXKPerspectiveCamera } from './xkPerspectiveCamera';
import { DEFAULT_WORLD_RADIUS } from './index';

type XKThreeCamera = OrthographicCamera | PerspectiveCamera;

export enum CameraTypeEnum {
  PERSPECTIVE,
  ORTHOGRAPHIC,
}

export default class CameraController {
  private camera: XKThreeCamera;

  constructor(camera: XKThreeCamera) {
    this.camera = camera;
  }

  animatePositionTo(x: number, y: number, z: number) {
    return new Promise<void>((resolve, reject) => {
      let needChangeAttributeCount = 3;
      try {
        customAnimation.to(
          0.5,
          this.camera.position,
          {
            x,
            y,
            z,
          },
          null,
          null,
          () => {
            needChangeAttributeCount -= 1;
            if (needChangeAttributeCount <= 0) {
              resolve();
            }
          },
        );
      } catch (e) {
        reject();
      }
    });
  }

  rotate(speed = 0.001) {
    const relativeX = this.camera.position.x;
    const relativeZ = this.camera.position.z;
    let angle = Math.atan2(relativeX, relativeZ);
    angle += speed;
    // eslint-disable-next-line no-mixed-operators
    const r = Math.sqrt(relativeX ** 2 + relativeZ ** 2);
    this.camera.position.x = Math.sin(angle) * r;
    this.camera.position.z = Math.cos(angle) * r;
    this.camera.updateProjectionMatrix();
  }

  createCameraByType(container: HTMLDivElement, cameraType: CameraTypeEnum) {
    const spherical = new Spherical().setFromVector3(this.camera.position);
    let camera: XKThreeCamera;
    if (cameraType === CameraTypeEnum.PERSPECTIVE) {
      spherical.radius /= this.camera.zoom;
      camera = createXKPerspectiveCamera(container);
    } else {
      camera = createXKOrthographicCamera(container);
      camera.zoom = DEFAULT_WORLD_RADIUS / spherical.radius;
      spherical.radius = DEFAULT_WORLD_RADIUS;
    }
    camera.position.copy(new Vector3().setFromSpherical(spherical));
    return camera;
  }

  getPositionBySphericalParams(phi: number, theta: number, scale: number) {
    const spherical = new Spherical(DEFAULT_WORLD_RADIUS, phi, theta);

    if (this.camera.name === 'PERSPECTIVE_CAMERA') {
      spherical.radius /= scale;
    }
    return new Vector3().setFromSpherical(spherical);
  }
}
