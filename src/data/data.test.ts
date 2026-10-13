import { describe, expect, it } from 'vitest';
import { GEOMETRY_IDS } from '../viewer/geometryLayout';
import { EDUCATION } from './education';
import { PARTS, PARTS_BY_VARIANT, validateParts } from './motorcycle';
import { SOURCES } from './sources';

describe('parts database', () => {
  it('passes all accuracy/integrity rules', () => {
    expect(validateParts()).toEqual([]);
  });

  it('every node targets a 2026 Rebel 500 (CMX500A or CMX500A2)', () => {
    for (const idx of Object.values(PARTS_BY_VARIANT)) {
      for (const p of idx.nodes.values()) {
        expect(['CMX500A', 'CMX500A2']).toContain(p.model);
        expect(p.modelYear).toBe(2026);
      }
    }
  });

  it('standard model has only the solo seat; the SE has its own equipment', () => {
    const std = PARTS_BY_VARIANT.cmx500a.nodes;
    const se = PARTS_BY_VARIANT.cmx500a2.nodes;
    expect(std.has('seat')).toBe(true);
    for (const id of ['passenger-seat', 'headlight-cowl', 'fork-boots', 'seat-se']) {
      expect(std.has(id)).toBe(false);
      expect(se.has(id)).toBe(true);
    }
    expect(se.has('seat')).toBe(false);
  });

  it('never uses SE-catalog sources for part numbers', () => {
    for (const p of Object.values(PARTS_BY_VARIANT).flatMap((idx) => [...idx.nodes.values()])) {
      if (p.oem?.partNumber) expect(p.oem.sourceId).not.toBe('revzilla-2026-se-index');
    }
  });

  it('records no torque values without a verified 2026 CMX500A source', () => {
    for (const p of PARTS.nodes.values()) {
      const s = p.service;
      if (s?.torqueNm !== undefined || s?.torqueFtLb !== undefined) {
        expect(s?.verified).toBe(true);
        expect(s?.sourceId && SOURCES[s.sourceId]).toBeTruthy();
      }
    }
  });

  it('"2026-oem-verified" is only ever backed by a directly-read source', () => {
    for (const p of PARTS.nodes.values()) {
      if (p.verification === '2026-oem-verified') expect(SOURCES[p.sourceId!].access).toBe('direct');
      for (const f of p.facts ?? []) if (f.verification === '2026-oem-verified') expect(SOURCES[f.sourceId].access).toBe('direct');
    }
  });

  it('maps every geometry entry to a data node in at least one variant, and vice versa', () => {
    const owned = new Set(Object.values(PARTS_BY_VARIANT).flatMap((idx) => [...idx.geometryOwner.keys()]));
    expect(new Set(GEOMETRY_IDS)).toEqual(owned);
  });

  it('every system has at least one child and the expected top-level systems exist', () => {
    expect(PARTS.systemIds).toEqual(
      expect.arrayContaining(['engine', 'intake-fuel', 'cooling', 'exhaust', 'chassis', 'front-suspension', 'rear-suspension', 'wheels-drive', 'brakes', 'electrical', 'body-controls']),
    );
    for (const id of PARTS.systemIds) expect((PARTS.children.get(id) ?? []).length).toBeGreaterThan(0);
  });

  it('education topics reference existing nodes', () => {
    for (const t of Object.values(EDUCATION)) for (const id of t.flowPath ?? []) expect(PARTS.nodes.has(id)).toBe(true);
    for (const p of PARTS.nodes.values()) if (p.educationId) expect(EDUCATION[p.educationId]).toBeDefined();
  });
});
