import { Vector3 } from 'three';

export function createVector3(x?: number, y?: number, z?: number): Vector3 {
  return new Vector3(x, y, z);
}

type Point = [number, number, number];

export function createRectVertices(
  [ax, ay, az]: Point,
  [bx, by, bz]: Point,
  height: number,
): number[] {
  const [cx, cy, cz] = [ax, ay + height, az];
  const [dx, dy, dz] = [bx, by + height, bz];
  const vertices = [cx, cy, cz, ax, ay, az, bx, by, bz, bx, by, bz, cx, cy, cz, dx, dy, dz];
  return vertices;
}
