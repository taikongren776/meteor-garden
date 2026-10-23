// Shared geometric queries, kept independent of rendering for deterministic tests.
export function surfaceAt(x, z, surfaces, ceiling = Infinity) {
  let height = -Infinity;
  for (const s of surfaces) {
    const yaw=s.rotation||0,dx=x-s.x,dz=z-s.z;
    const localX=Math.cos(yaw)*dx-Math.sin(yaw)*dz,localZ=Math.sin(yaw)*dx+Math.cos(yaw)*dz;
    const inside = s.type === 'circle' ? Math.hypot(dx,dz) <= s.r : Math.abs(localX) <= s.w / 2 && Math.abs(localZ) <= s.d / 2;
    if (inside && !s.holes?.some(h => Math.hypot(x - h.x, z - h.z) < h.r)) {
      const y = s.slope ? s.y + (z - s.z) * s.slope : s.y;
      if (y <= ceiling + .001) height = Math.max(height, y);
    }
  }
  return height;
}
export function collides(x, y, z, obstacles, radius = .42, height = 1.8) {
  return obstacles.some(o => {
    if (y + height <= o.bottom || y >= o.top) return false;
    if (o.type === 'circle') return Math.hypot(x - o.x, z - o.z) < radius + o.r;
    if (o.type === 'cone') {
      const bodyTop = Math.min(y + height, o.top);
      const coneRadius = o.r * Math.max(0, (bodyTop - o.bottom) / (o.top - o.bottom));
      return Math.hypot(x - o.x, z - o.z) < radius + coneRadius;
    }
    return x + radius > o.x - o.w / 2 && x - radius < o.x + o.w / 2 && z + radius > o.z - o.d / 2 && z - radius < o.z + o.d / 2;
  });
}
export function validGround(x, z, surfaces, ceiling = Infinity) {
  const y = surfaceAt(x, z, surfaces, ceiling);
  return Number.isFinite(y) ? y : null;
}
