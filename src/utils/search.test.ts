import { describe, expect, it } from 'vitest';
import { PARTS } from '../data/motorcycle';
import { searchParts } from './search';

const top = (q: string) => searchParts(PARTS.nodes.values(), q).map((h) => h.part.id);

describe('part search', () => {
  it.each([
    ['clutch', 'clutch'],
    ['oil filter', 'oil-filter'],
    ['shift lever', 'shift-lever'],
    ['engine hanger', 'engine-mounts'],
    ['radiator', 'radiator'],
    ['rear brake', 'rear-brake'],
    ['fuel pump', 'fuel-pump'],
    ['41201-MKG-A00', 'driven-sprocket'],
  ])('"%s" finds %s', (q, id) => {
    expect(top(q).slice(0, 3)).toContain(id);
  });

  it('returns nothing for an empty query', () => {
    expect(top('  ')).toEqual([]);
  });
});
