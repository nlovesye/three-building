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
} from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

import type Editor from '@/Editor';
import { createRectVertices, createVector3 } from '@/util';

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
    const floor1 = createGeometry(outline);
    // 第二层
    const floor2 = createGeometry(outline);
    transform.position.setY(5);
    transform.updateMatrix();
    floor2.applyMatrix4(transform.matrix);

    const geometries: BufferGeometry[] = [floor1, floor2];

    const material = new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide });

    // 合并处理以减少mesh数
    const totalGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    const mesh = new Mesh(totalGeometry, material);

    editor.addObject3D(mesh);

    const lineSegments = new LineSegments(
      new EdgesGeometry(totalGeometry),
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
  }, [editor]);

  useEffect(() => {
    drawLine();
  }, [drawLine]);

  return null;
});

// 根据 outline 轮廓绘制各个墙面
function createGeometry(list: [number, number][]): BufferGeometry {
  const geometry = new BufferGeometry();

  const verticesArr = [];
  for (let i = 0; i < list.length - 1; i++) {
    const [ax, ay] = list[i];
    const [bx, by] = list[i + 1];

    // 绘制窗户下墙
    verticesArr.push(...createRectVertices([ax, 0, -ay], [bx, 0, -by], 0.9));
    // 绘制窗户上墙
    verticesArr.push(...createRectVertices([ax, 3.5, -ay], [bx, 3.5, -by], 1.5));

    // 计算窗户起始点和终点坐标
    const tempLine = new Line3(new Vector3(ax, 0.9, -ay), new Vector3(bx, 0.9, -by));
    const winStart = tempLine.at(0.3, new Vector3());
    const winEnd = tempLine.at(0.7, new Vector3());

    // 绘制窗户左边墙
    verticesArr.push(
      ...createRectVertices([ax, 0.9, -ay], [winStart.x, winStart.y, winStart.z], 2.6),
    );
    // 绘制窗户右边墙
    verticesArr.push(...createRectVertices([winEnd.x, winEnd.y, winEnd.z], [bx, 0.9, -by], 2.6));
  }

  const vertices = new Float32Array(verticesArr.flat());
  geometry.setAttribute('position', new BufferAttribute(vertices, 3));

  return geometry;
}
