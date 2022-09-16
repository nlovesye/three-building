import { memo, useEffect, useCallback } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Line,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  LineBasicMaterial,
  MeshPhongMaterial,
  Shape,
  BufferAttribute,
  ShapeGeometry,
  Points,
  PointsMaterial,
} from 'three';

import type Editor from '@/Editor';
import { createVector3 } from '@/util';

interface Props {
  editor: Editor;
}

const outline = [
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
    const shape = new Shape();
    shape.moveTo(outline[0][0], outline[0][1]);
    for (let i = 1; i < outline.length; i++) {
      const [x, y] = outline[i];
      shape.lineTo(x, y);
    }

    const shapeGeometry = new ShapeGeometry(shape);

    const outlinePoints = new Points(
      shapeGeometry,
      new PointsMaterial({ color: 0xff0000, size: 5 }),
    );

    editor.addObject3D(outlinePoints);

    const geometry = new BufferGeometry();

    const verticesArr = [];
    for (let i = 0; i < outline.length - 1; i++) {
      const [ax, ay] = outline[i];
      const [bx, by] = outline[i + 1];

      // verticesArr.push(bx, 0, -by);
      // verticesArr.push(ax, 0, -ay);
      // verticesArr.push(ax, 5, -ay);

      // verticesArr.push(ax, 5, -ay);
      // verticesArr.push(bx, 5, -by);
      // verticesArr.push(bx, 0, by);

      verticesArr.push([ax, ay, 0]);
      verticesArr.push([ax, ay, 5]);
      verticesArr.push([bx, by, 0]);

      verticesArr.push([bx, by, 0]);
      verticesArr.push([ax, ay, 5]);
      verticesArr.push([bx, by, 5]);

      console.log(i, verticesArr);
    }

    // const vertices = new Float32Array([
    //   // 0, 0, 0, 10, 0, 10, 10, 0, 20,
    //   // 0, 0, 20, -10, 0, 10, 0, 0, 0,
    //   // -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
    //   // 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
    // ]);
    const vertices = new Float32Array(verticesArr.flat());
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const material = new MeshBasicMaterial({ color: 0xffff00 });

    // Create the final object to add to the scene
    const mesh = new Mesh(geometry, material);

    editor.addObject3D(mesh);
  }, [editor]);

  useEffect(() => {
    drawLine();
  }, [drawLine]);

  return null;
});
