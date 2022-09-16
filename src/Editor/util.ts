import type { Object3D, Scene, WebGLRenderer } from 'three';
import { Material, Texture } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

export function disposeObject3D(object: any) {
  if (!object) {
    return;
  }
  const tempObj = object;
  if (tempObj.children && tempObj.children.length > 0) {
    for (let i = 0; i < tempObj.children.length; i += 1) {
      disposeObject3D(tempObj.children[i]);
      tempObj.children[i] = null;
    }
    tempObj.children = [];
  }
  if (tempObj.geometry && tempObj.geometry.dispose) {
    tempObj.geometry.dispose();
    tempObj.geometry = null;
  }
  if (tempObj.material && tempObj.material.dispose) {
    tempObj.material = null;
  }
  tempObj.userData = null;
  try {
    if (tempObj instanceof CSS2DObject && tempObj.parent?.children.includes(tempObj)) {
      tempObj.parent?.remove(tempObj);
    }
  } catch (e) {
    //
  }
}

export function disposeAll(scene: Scene, renderer: WebGLRenderer) {
  if (!scene) {
    return;
  }

  scene.traverse((child) => {
    const { geometry, material } = child as any;
    if (geometry) {
      geometry.dispose();
    }
    if (material instanceof Material) {
      material.dispose();
    } else if (material instanceof Array) {
      material.forEach((currMaterial) => {
        currMaterial.dispose();
      });
    }
  });
  // disposeScene(scene);
  renderer.clear();
  // renderer.dispose();
  // renderer.forceContextLoss();
}

export function disposeScene(scene: Scene) {
  // 会清理自身，因此无需调用 scene.dispose
  deleteObject(scene);
}

function deleteObject(object: Object3D, withDispose = true) {
  if (!(object && object.isObject3D)) {
    return;
  }
  if (withDispose) {
    disposeObject(object);
  }
  if (object.parent && object.parent.isObject3D) {
    object.parent.remove(object);
  }
}

function disposeObject(object: Object3D) {
  // 清理自身、以及子子孙孙
  object.traverse((object3D) => {
    disposeData(object3D);
  });
}

function disposeData(object: any) {
  if (object.geometry) {
    object.geometry.dispose();
    // eslint-disable-next-line no-param-reassign
    delete object.geometry;
  }
  // material 可能是数组
  if (object.material instanceof Material) {
    object.material.dispose();
    disposeTexture(object.material);
    // eslint-disable-next-line no-param-reassign
    delete object.material;
  }
  if (object.material instanceof Array) {
    object.material.forEach((material: Material) => {
      material.dispose();
      disposeTexture(object.material);
    });
    // eslint-disable-next-line no-param-reassign
    delete object.material;
  }
  if (object.dispose) {
    object.dispose();
  }
}

function disposeTexture(resource: Material) {
  if (resource instanceof Material) {
    // We have to check if there are any textures on the material
    const keys = Object.keys(resource);
    for (let i = 0; i < keys.length; i += 1) {
      const value = resource[keys[i]];
      if (value instanceof Texture) {
        value.dispose();
        // eslint-disable-next-line no-param-reassign
        delete resource[keys[i]];
      }
    }
    // We also have to check if any uniforms reference textures or arrays of textures
    if ((resource as any).uniforms) {
      const uniformsKeys = Object.keys((resource as any).uniforms);
      for (let i = 0; i < uniformsKeys.length; i += 1) {
        const value = (resource as any).uniforms[uniformsKeys[i]];
        if (value) {
          const uniformValue = value.value;
          if (uniformValue instanceof Texture) {
            uniformValue.dispose();
            delete value.value;
          }
          if (Array.isArray(uniformValue)) {
            for (let j = uniformValue.length - 1; j >= 0; j -= 1) {
              const uniformValueItem = uniformValue[j];
              if (uniformValueItem instanceof Texture) {
                uniformValueItem.dispose();
                uniformValue.splice(j, 1);
              }
            }
          }
        }
      }
    }
  }
}
