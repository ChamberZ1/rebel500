import { describe, expect, it } from 'vitest';
import { dampFactor, globalOffset, localOffset } from './explode';

describe('explode math', () => {
  it('is zero when assembled and full vector at 100%', () => {
    expect(globalOffset([0.8, 0, 0], 0)).toEqual([0, 0, 0]);
    expect(globalOffset([0.8, 0.2, -0.1], 1)).toEqual([0.8, 0.2, -0.1]);
    expect(globalOffset([1, 0, 0], 2)).toEqual([1, 0, 0]);
  });

  it('local explode pushes parts away from the assembly centroid', () => {
    const off = localOffset({ restCenter: [0, 1, 0], scopeCenter: [0, 0, 0], scopeRadius: 0.5, authored: [0, 1, 0], amount: 1 });
    expect(off[1]).toBeGreaterThan(0.4);
    const none = localOffset({ restCenter: [0, 1, 0], scopeCenter: [0, 0, 0], scopeRadius: 0.5, authored: [0, 1, 0], amount: 0 });
    expect(Math.hypot(...none)).toBe(0);
  });

  it('falls back to the authored direction when a part sits at the centroid', () => {
    const off = localOffset({ restCenter: [0, 0, 0], scopeCenter: [0, 0, 0], scopeRadius: 0.2, authored: [1, 0, 0], amount: 1 });
    expect(off[0]).toBeGreaterThan(0);
  });

  it('damping factor is within (0,1)', () => {
    const k = dampFactor(7, 1 / 60);
    expect(k).toBeGreaterThan(0);
    expect(k).toBeLessThan(1);
  });
});
