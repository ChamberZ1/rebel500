import { PARTS } from '../data/motorcycle';
import { useViewer } from '../state/store';
import { GEOMETRY_IDS } from './geometryRegistry';
import { PartNode } from './PartNode';

/**
 * Renders every geometry piece that belongs to the selected bike as an independently
 * controllable object. Switching variant remounts the parts so lineage/bounds are rebuilt.
 */
export function BikeModel() {
  const variant = useViewer((s) => s.variant);
  const ids = GEOMETRY_IDS.filter((id) => PARTS.geometryOwner.has(id));
  return (
    <group name="Rebel500" key={variant}>
      {ids.map((id) => (
        <PartNode key={`${variant}:${id}`} geoId={id} />
      ))}
    </group>
  );
}
