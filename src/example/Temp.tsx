import { memo, useEffect, useCallback } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Line,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  LineBasicMaterial,
  Shape,
  BufferAttribute,
  ShapeGeometry,
  Points,
  PointsMaterial,
  DoubleSide,
  Vector3,
  Line3,
  LineSegments,
  EdgesGeometry,
  WireframeGeometry,
  Object3D,
  ExtrudeBufferGeometry,
} from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

import type Editor from '@/Editor';
import { createHouseGeometry } from './building';

interface Props {
  editor: Editor;
}

const outline: [number, number][] = [
  [-7.8, 3.125],
  [-6.7, 3.125],
  [-6.7, 6.825],
  [6.7, 6.825],
  [6.7, 3.125],
  [7.8, 3.125],
  [7.8, -6.075],
  [3.9, -6.075],
  [3.9, -6.825],
  [1.2, -6.825],
  [1.2, -4.925],
  [-1.2, -4.925],
  [-1.2, -6.825],
  [-3.9, -6.825],
  [-3.9, -6.075],
  [-7.8, -6.075],
  [-7.8, 3.125],
];

export default memo<Props>(function Temp({ editor }) {
  const drawLine = useCallback(() => {
    const pointsGeometry = new BufferGeometry();
    pointsGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(outline.map(([x, y]) => [x, 0, -y]).flat()), 3),
    );

    const outlinePoints = new Points(
      pointsGeometry,
      new PointsMaterial({ color: 0xff0000, size: 5 }),
    );

    editor.addObject3D(outlinePoints);

    const transform = new Object3D();

    // 第一层
    const floor1 = createHouseGeometry(outline);
    // 第二层
    const floor2 = createHouseGeometry(outline);
    transform.position.setY(5);
    transform.updateMatrix();
    floor2.wall.applyMatrix4(transform.matrix);
    floor2.floor.applyMatrix4(transform.matrix);

    const wallGeometries: BufferGeometry[] = [floor1.wall, floor2.wall];
    const floorGeometries: ExtrudeBufferGeometry[] = [floor1.floor, floor2.floor];

    // 合并处理以减少mesh数
    const totalWallGeometry = BufferGeometryUtils.mergeBufferGeometries(wallGeometries);
    const totalFloorGeometry = BufferGeometryUtils.mergeBufferGeometries(floorGeometries);

    const wallMaterial = new MeshBasicMaterial({
      color: 0xffff00,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetUnits: 0.1,
      polygonOffsetFactor: 1.0,
    });
    const floorMaterial = new MeshBasicMaterial({
      color: 0xdce1e6,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetUnits: 0.1,
      polygonOffsetFactor: 1.1,
    });

    const wallMesh = new Mesh(totalWallGeometry, wallMaterial);
    const floorMesh = new Mesh(totalFloorGeometry, floorMaterial);

    editor.addObject3D(wallMesh);
    editor.addObject3D(floorMesh);

    const lineSegments = new LineSegments(
      new EdgesGeometry(totalWallGeometry),
      new LineBasicMaterial({ color: 0x00ff00 }),
    );
    editor.addObject3D(lineSegments);

    // const curve = new CatmullRomCurve3(
    //   [
    //     new Vector3(10, 0, 10),
    //     new Vector3(20, 0, 10),
    //     new Vector3(20, 0, 20),
    //     new Vector3(10, 0, 20),
    //     new Vector3(10, 0, 10),
    //     new Vector3(20, 0, 20),
    //   ],
    //   false,
    //   'catmullrom',
    //   0,
    // );

    // const points = curve.getPoints();

    // const curveObject = new Mesh(
    //   new BufferGeometry().setFromPoints(points),
    //   new MeshBasicMaterial({ color: 0xff0000, side: DoubleSide }),
    // );

    // editor.addObject3D(curveObject);

    editor.render();
  }, [editor]);

  useEffect(() => {
    drawLine();
  }, [drawLine]);

  return null;
});
