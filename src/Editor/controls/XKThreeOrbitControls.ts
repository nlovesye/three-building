import type { Camera, OrthographicCamera, PerspectiveCamera } from 'three';
import { MOUSE, Quaternion, Spherical, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { DEFAULT_WORLD_RADIUS } from '../index';

const changeEvent = { type: 'change', target: null };

export const OrbitControlsMouseButtons = {
  LEFT: MOUSE.PAN,
  MIDDLE: MOUSE.DOLLY,
  RIGHT: MOUSE.ROTATE,
};

export class XKThreeOrbitControls extends OrbitControls {
  private zoomToCursor: boolean;

  private scale: number;

  private zoomFactor: number;

  private mouse3D: Vector3;

  private offset: Vector3;

  private quat: Quaternion;

  private quatInverse: Quaternion;

  private spherical: Spherical;

  private mousedownPosition: Vector2;

  private startZoom: boolean;

  constructor(object: Camera, domElement?: HTMLElement) {
    super(object, domElement);
    this.maxPolarAngle = Math.PI * 0.499;
    this.mouseButtons = { ...OrbitControlsMouseButtons };

    // PerspectiveCamera only
    this.maxDistance = DEFAULT_WORLD_RADIUS * 0.6;
    // OrthographicCamera only
    this.minZoom = 2;

    // disable default zoom
    this.enableZoom = false;
    // set zoom to cursor
    this.zoomToCursor = true;

    this.mouse3D = new Vector3();
    this.scale = 1;
    this.zoomFactor = 1;
    this.offset = new Vector3();
    // so camera.up is the orbit axis
    this.quat = new Quaternion().setFromUnitVectors(this.object.up, new Vector3(0, 1, 0));
    this.quatInverse = this.quat.clone().invert();
    this.spherical = new Spherical();

    this.mousedownPosition = new Vector2();
    this.startZoom = false;
  }

  handleMouseWheel(event: WheelEvent) {
    if (!this.zoomToCursor) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    this.updateMouse3D(event);

    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }

    this.updateByWheel();
  }

  handleMouseDown(event: MouseEvent) {
    // zoom by ctrl + mouse right
    if (event.button === 2 && (event.ctrlKey || event.metaKey)) {
      this.startZoom = true;
      this.mousedownPosition.set(event.clientX, event.clientY);
      this.updateMouse3D(event as any);
    }
  }

  handleMouseMove(event: MouseEvent) {
    if (!this.startZoom) {
      return;
    }

    const deltaY = event.clientY - this.mousedownPosition.y;
    if (deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }

    this.updateByWheel();
  }

  handleMouseUp() {
    this.startZoom = false;
  }

  private updateMouse3D(event: WheelEvent) {
    const element =
      this.domElement === document ? this.domElement.body : (this.domElement as HTMLElement);
    const v1 = new Vector3();
    const v2 = new Vector3();
    const rect = element.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
      v1.set(mouseX, mouseY, 0.5);

      v1.unproject(this.object);

      v1.sub(this.object.position).normalize();

      const distance =
        v2.copy(this.target).sub(this.object.position).dot(this.object.up) / v1.dot(this.object.up);

      this.mouse3D.copy(this.object.position).add(v1.multiplyScalar(distance));
    } else if ((this.object as OrthographicCamera).isOrthographicCamera) {
      const { near, far } = this.object as OrthographicCamera;
      v1.set(mouseX, mouseY, (near + far) / (near - far));

      v1.unproject(this.object);

      v2.set(0, 0, -1).applyQuaternion(this.object.quaternion);

      const distance = -v1.dot(this.object.up) / v2.dot(this.object.up);

      this.mouse3D.copy(v1).add(v2.multiplyScalar(distance));
    } else {
      // camera neither orthographic nor perspective
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type.');
    }
  }

  private getZoomScale() {
    return 0.95 ** this.zoomSpeed;
  }

  private dollyOut(dollyScale: number) {
    this.dolly(dollyScale);
  }

  private dollyIn(dollyScale: number) {
    this.dolly(1 / dollyScale);
  }

  private dolly(dollyScale: number) {
    if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
      this.scale *= dollyScale;
    } else if ((this.object as OrthographicCamera).isOrthographicCamera) {
      const object = this.object as OrthographicCamera;
      this.zoomFactor = object.zoom;
      object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, object.zoom / dollyScale));
      this.zoomFactor /= object.zoom;
      object.updateProjectionMatrix();
    } else {
      console.warn(
        'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.',
      );
      this.zoomToCursor = false;
    }
  }

  private updateByWheel() {
    const { position } = this.object;

    this.offset.copy(position).sub(this.target);

    // rotate offset to "y-axis-is-up" space
    this.offset.applyQuaternion(this.quat);

    // angle from z-axis around y-axis
    this.spherical.setFromVector3(this.offset);

    // restrict theta to be between desired limits
    this.spherical.theta = Math.max(
      this.minAzimuthAngle,
      Math.min(this.maxAzimuthAngle, this.spherical.theta),
    );

    // restrict phi to be between desired limits
    this.spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.spherical.phi),
    );

    this.spherical.makeSafe();

    const prevRadius = this.spherical.radius;
    this.spherical.radius *= this.scale;

    // restrict radius to be between desired limits
    this.spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.spherical.radius),
    );

    // support zoomToCursor (mouse only)
    if (this.zoomToCursor) {
      if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
        this.target.lerp(this.mouse3D, 1 - this.spherical.radius / prevRadius);
      } else if ((this.object as OrthographicCamera).isOrthographicCamera) {
        this.target.lerp(this.mouse3D, 1 - this.zoomFactor);
      }
    }

    this.offset.setFromSpherical(this.spherical);

    // rotate offset back to "camera-up-vector-is-up" space
    this.offset.applyQuaternion(this.quatInverse);

    position.copy(this.target).add(this.offset);

    this.object.lookAt(this.target);

    this.scale = 1;
    this.zoomFactor = 1;

    this.dispatchEvent(changeEvent);
  }
}
