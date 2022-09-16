import { Vector3 } from 'three';

export function createVector3(x?: number, y?: number, z?: number): Vector3 {
  return new Vector3(x, y, z);
}
