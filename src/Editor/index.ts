import type { Intersection, Object3D, WebGLRendererParameters, Vector3 } from 'three';
import {
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
  AxesHelper,
  GridHelper,
  Plane,
} from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

import { createXKSky } from './sky/xkSky';
import { XKThreeOrbitControls } from './controls/XKThreeOrbitControls';
import { createXKAmbientLight } from './light/xkAmbientLight';
import { createXKDirectionalLight } from './light/xkDirectionalLight';
import { createXKPointLight } from './light/xkPointLight';
import { createXKOrthographicCamera, resizeOrthographicCamera } from './xkOrthographicCamera';
import { resizePerspectiveCamera } from './xkPerspectiveCamera';
import type { CameraTypeEnum } from './cameraController';
import CameraController from './cameraController';
import { disposeAll, disposeObject3D } from './util';

export const DEFAULT_WORLD_RADIUS = 5000;

export enum CursorTypeEnum {
  DEFAULT = 'default',
  POINTER = 'pointer',
  CROSSHAIR = 'crosshair',
  PICKER = 'picker',
  PLUS = 'plus',
  NOT_ALLOWED = 'not-allowed',
  GRAB = 'grab',
  ZOOM = 'zoom',
  ORBIT = 'orbit',
  MARKER = 'marker',
  ADDABLE = 'addable',
  REDUCIBLE = 'reducible',
  COPIABLE = 'copiable',
}

export default class Editor {
  container: HTMLDivElement;

  renderer: WebGLRenderer;

  css2DRenderer: CSS2DRenderer;

  scene: Scene;

  camera: PerspectiveCamera | OrthographicCamera;

  controls: XKThreeOrbitControls;

  history: any;

  private renderRequestId!: number | null;

  private mouse: Vector2;

  private raycaster: Raycaster;

  public cursorType: CursorTypeEnum;

  commandManager: any = null;

  constructor(container: HTMLDivElement, renderer?: WebGLRendererParameters) {
    this.container = container;
    this.renderer = Editor.getRenderer(container, renderer);
    this.container.appendChild(this.renderer.domElement);
    this.css2DRenderer = Editor.get2DRenderer(container);
    this.container.appendChild(this.css2DRenderer.domElement);
    this.scene = new Scene();
    this.camera = createXKOrthographicCamera(this.container);
    this.controls = new XKThreeOrbitControls(this.camera, this.css2DRenderer.domElement);
    // 开启选择的情况下，需要禁用镜头控制器的左键事件
    this.controls.mouseButtons.LEFT = -1 as any;
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.cursorType = CursorTypeEnum.DEFAULT;
    this.init();
    this.render();
    this.addEventListeners();
  }

  private init = () => {
    // 特效渲染器会改写 render 函数，所以这里不能直接绑定 render
    this.controls.addEventListener('change', () => this.render());

    const sky = createXKSky();
    this.scene.add(sky);

    const sunLight = createXKDirectionalLight();
    this.scene.add(sunLight);

    const ambientLight = createXKAmbientLight();
    this.scene.add(ambientLight);

    const pointLight = createXKPointLight();
    this.scene.add(pointLight);

    const size = 500;

    const axesHelper = new AxesHelper(size);
    this.scene.add(axesHelper);

    // gridHelper
    const divisions = size / 10;

    const gridHelper = new GridHelper(size, divisions);
    this.scene.add(gridHelper);
  };

  static getRenderer = (
    container: HTMLDivElement,
    config?: WebGLRendererParameters,
  ): WebGLRenderer => {
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      ...config,
    });
    const size = container.getBoundingClientRect();
    renderer.setSize(size.width, size.height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    return renderer;
  };

  static get2DRenderer = (container: HTMLDivElement) => {
    const renderer = new CSS2DRenderer();
    const size = container.getBoundingClientRect();
    renderer.setSize(size.width, size.height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.outline = 'none';
    renderer.domElement.style.userSelect = 'none';
    return renderer;
  };

  autoRender = (afterRender?: () => void) => {
    this.render();
    if (afterRender) {
      afterRender();
    }
    this.renderRequestId = requestAnimationFrame(() => {
      this.autoRender(afterRender);
    });
  };

  stopAutoRender(renderOnce = false) {
    if (this.renderRequestId) {
      cancelAnimationFrame(this.renderRequestId);
      this.renderRequestId = null;
    }
    // 停止后是否需要再渲染一次
    if (renderOnce) {
      this.render();
    }
  }

  autoRotate(open: boolean): void {
    if (open) {
      this.startAutoRotate();
    } else {
      this.stopAutoRotate();
    }
  }

  render = (): void => {
    this.renderer.render(this.scene, this.camera);
    this.css2DRenderer.render(this.scene, this.camera);
  };

  getIntersections = (point: Vector2, object3Ds: Object3D[] | null | undefined): Intersection[] => {
    if (!object3Ds) {
      return [];
    }
    this.updateRaycaster(point);
    return this.raycaster.intersectObjects(object3Ds, true);
  };

  intersectPlane = (plane: Plane, targetVector: Vector3) => {
    this.raycaster.ray.intersectPlane(plane, targetVector);
  };

  addObject3D = (...object: Object3D[]): void => {
    this.scene.add(...object);
  };

  removeObject3D = (object3D: Object3D | null | undefined): void => {
    if (object3D && object3D.parent) {
      object3D.parent.remove(object3D);
    }
    disposeObject3D(object3D);
  };

  changeCameraType(cameraType: CameraTypeEnum): void {
    const cameraController = new CameraController(this.camera);
    const newCamera = cameraController.createCameraByType(this.container, cameraType);
    this.camera = newCamera;
    this.controls.object = newCamera;
    this.controls.update();
    this.render();
  }

  animateCameraPositionTo(phi: number, theta: number, scale: number) {
    this.changeCameraZoomIfIsOrthographic(scale);
    const cameraController = new CameraController(this.camera);
    const newPosition = cameraController.getPositionBySphericalParams(phi, theta, scale);
    this.autoRender(() => {
      this.controls.update();
    });
    return cameraController
      .animatePositionTo(newPosition.x, newPosition.y, newPosition.z)
      .finally(() => {
        this.controls.update();
        this.stopAutoRender(true);
      });
  }

  setCameraPosition(phi: number, theta: number, scale: number) {
    this.changeCameraZoomIfIsOrthographic(scale);
    const cameraController = new CameraController(this.camera);
    const newPosition = cameraController.getPositionBySphericalParams(phi, theta, scale);
    this.camera.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.controls.update();
    this.render();
  }

  private onMouseWheel = (event: WheelEvent) => {
    this.controls.handleMouseWheel(event);
  };

  destroy = (): void => {
    this.removeEventListeners();
    disposeAll(this.scene, this.renderer);
    this.controls.dispose();
  };

  setCursorType = (cursorType: CursorTypeEnum): void => {
    this.cursorType = cursorType;
    this.updateCursorClassName(cursorType);
  };

  updateCursorClassName = (cursorType: CursorTypeEnum): void => {
    this.container.className = `cursor-${cursorType}`;
  };

  updateRaycaster = (point: Vector2) => {
    this.mouse.set(point.x * 2 - 1, -point.y * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera);
  };

  private addEventListeners = () => {
    const domElement = this.container;
    domElement.addEventListener('wheel', this.onMouseWheel);
    window.addEventListener('resize', this.resize);
  };

  private removeEventListeners = () => {
    const domElement = this.container;
    domElement.removeEventListener('wheel', this.onMouseWheel);
    window.removeEventListener('resize', this.resize);
  };

  private startAutoRotate() {}

  private stopAutoRotate() {}

  private resize = () => {
    const size = this.container.getBoundingClientRect();
    if (this.camera instanceof PerspectiveCamera) {
      resizePerspectiveCamera(this.camera, size);
    } else if (this.camera instanceof OrthographicCamera) {
      resizeOrthographicCamera(this.camera, size);
    }
    this.renderer.setSize(size.width, size.height);
    this.css2DRenderer.setSize(size.width, size.height);
    this.render();
  };

  private changeCameraZoomIfIsOrthographic(scale: number) {
    if (this.camera instanceof OrthographicCamera) {
      this.camera.zoom = scale;
      this.camera.updateProjectionMatrix();
    }
  }
}
