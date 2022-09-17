import { P2, P3 } from './model';

/**
 * @description 将xy二维平面坐标转换成xz三维平面坐标
 * @param point xy二维平面坐标
 * @param startAltitude 起始z轴altitude
 * @returns xz三维平面坐标
 */
export function transformXyToXz([x, y]: P2, startAltitude: number = 0): P3 {
  return [x, startAltitude, -y];
}

/**
 * @description 假设线段平行于 parallelPlane 平面， 根据线段 start-end 和 offset 生成 rect vertices 绘制数据（一个rect可由两个三角形构成）
 * @param start 线段起始点
 * @param end 线段终点
 * @param offset 绘制的rect垂直于parallelPlane平面方向的偏移距离
 * @param parallelPlane 线段start-end的平行平面
 * @returns rect的vertices绘制路径数据
 */
export function createRectVertices(
  [startX, startY, startZ]: P3,
  [endX, endY, endZ]: P3,
  offset: number,
  parallelPlane: 'xz' | 'xy' | 'yz' = 'xz',
): Float32Array {
  // 根据start-end平行的平面判断位移的轴向，得出rect的另外两个点坐标
  const [xOffset, yOffset, zOffset] = [
    parallelPlane === 'yz' ? offset : 0,
    parallelPlane === 'xz' ? offset : 0,
    parallelPlane === 'xy' ? offset : 0,
  ];
  const [startOffsetX, startOffsetY, startOffsetZ] = [
    startX + xOffset,
    startY + yOffset,
    startZ + zOffset,
  ];
  const [endOffsetX, endOffsetY, endOffsetZ] = [endX + xOffset, endY + yOffset, endZ + zOffset];

  // 构建rect vertices结果
  const vertices = new Float32Array([
    // 第一个三角形
    startOffsetX,
    startOffsetY,
    startOffsetZ,
    startX,
    startY,
    startZ,
    endX,
    endY,
    endZ,

    // 第二个三角形
    endX,
    endY,
    endZ,
    startOffsetX,
    startOffsetY,
    startOffsetZ,
    endOffsetX,
    endOffsetY,
    endOffsetZ,
  ]);
  return vertices;
}
