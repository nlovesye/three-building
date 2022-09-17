import { P2 } from '@/model';
import { createRectVertices, transformXyToXz } from '@/util';
import {
  BufferAttribute,
  BufferGeometry,
  ExtrudeBufferGeometry,
  ExtrudeGeometry,
  Line3,
  Object3D,
  Shape,
  Vector3,
} from 'three';
// import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

interface HouseGeometry {
  /** 墙面 */
  wall: BufferGeometry;
  /** 地板 */
  floor: ExtrudeGeometry;
}

// 根据楼层地面轮廓绘制楼层
export function createHouseGeometry(list: P2[]): HouseGeometry {
  const itemSize = 3;
  const rectVerticesLen = itemSize * 3 * 2;
  const listLength = list.length;

  // 墙面
  const [wallGeometry, wallVertices] = [
    new BufferGeometry(),
    new Float32Array(listLength * rectVerticesLen * 4),
  ];

  const transform = new Object3D();
  const floorShape = new Shape();
  floorShape.moveTo(list[0][0], list[0][1]);

  for (let i = 0; i < listLength - 1; i++) {
    const startP3 = transformXyToXz(list[i]);
    const endP3 = transformXyToXz(list[i + 1]);
    const [startX, startZ, endX, endZ] = [startP3[0], startP3[2], endP3[0], endP3[2]];

    // 计算窗户起始点和终点坐标
    const tempLine = new Line3(new Vector3(startX, 0.9, startZ), new Vector3(endX, 0.9, endZ));
    const winStart = tempLine.at(0.3, new Vector3());
    const winEnd = tempLine.at(0.7, new Vector3());

    wallVertices.set(
      [
        ...createRectVertices(startP3, endP3, 0.9),
        ...createRectVertices([startX, 3.5, startZ], [endX, 3.5, endZ], 1.5),
        ...createRectVertices([startX, 0.9, startZ], [winStart.x, winStart.y, winStart.z], 2.6),
        ...createRectVertices([winEnd.x, winEnd.y, winEnd.z], [endX, 0.9, endZ], 2.6),
      ],
      i * rectVerticesLen * 4,
    );

    // shape只能在xy平面绘制
    floorShape.lineTo(list[i][0], list[i][1]);
  }

  wallGeometry.setAttribute('position', new BufferAttribute(wallVertices, itemSize));

  // 地板
  const extrudeSettings = { depth: 0.5, bevelEnabled: false, steps: 1 };
  const floorGeometry = new ExtrudeBufferGeometry(floorShape, extrudeSettings);

  // 由于floorShape在xy平面，所以需要绕x轴逆旋转90度以落到xz平面
  transform.rotateX(-Math.PI / 2);
  transform.updateMatrix();
  floorGeometry.applyMatrix4(transform.matrix);

  // return BufferGeometryUtils.mergeBufferGeometries([wallGeometry, floorGeometry]);
  return {
    wall: wallGeometry,
    floor: floorGeometry,
  };
}
