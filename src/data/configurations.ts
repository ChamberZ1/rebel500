import type { BikeConfiguration, Modification, MountPoint } from '../types/configuration';

/**
 * Owner-modification layer (future work). The OEM configuration is the only one shipped.
 *
 * To add an accessory:
 *   1. Add a MountPoint on the OEM part it attaches to (positions on representative geometry are
 *      themselves representative — mark them so).
 *   2. Add a Modification referencing the mount point(s), optionally with a GLB in public/models/.
 *   3. Add a BikeConfiguration listing the modification ids.
 * See README "Adding aftermarket modifications".
 */
export const MOUNT_POINTS: MountPoint[] = [];

export const MODIFICATIONS: Modification[] = [];

export const CONFIGURATIONS: BikeConfiguration[] = [
  {
    id: 'oem',
    name: 'OEM (stock)',
    description: '2026 Honda Rebel 500 ABS, U.S. standard model (CMX500A), as delivered.',
    modificationIds: [],
  },
];
