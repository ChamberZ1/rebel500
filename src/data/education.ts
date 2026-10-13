import type { EducationTopic } from '../types/motorcycle';

/**
 * Beginner explanations. These are general mechanical explanations written for this app,
 * not Honda text, unless a sentence is explicitly quoted and attributed.
 * `flowPath` node ids are highlighted in order in the 3D view where geometry exists.
 */
const GENERIC = 'General motorcycle engineering explanation written for Rebel 500 Explorer — not a Honda quotation.';

export const EDUCATION: Record<string, EducationTopic> = {
  'power-path': {
    id: 'power-path',
    title: 'How power reaches the rear wheel',
    summary:
      'Combustion pushes the pistons, and the crankshaft turns that push into rotation. The clutch lets you connect or interrupt that rotation. The six-speed gearbox picks a ratio, and the #520 chain carries power from the 15-tooth front sprocket to the 40-tooth rear sprocket on the wheel.',
    sequences: [
      {
        title: 'Power path',
        steps: ['Engine (crankshaft)', 'Clutch', 'Transmission (6-speed)', 'Front sprocket (15T)', 'Chain (#520)', 'Rear sprocket (40T)', 'Rear wheel'],
      },
    ],
    flowPath: ['crankshaft', 'clutch', 'transmission', 'drive-sprocket', 'drive-chain', 'driven-sprocket', 'rear-wheel-assy'],
    flowLabel: 'Show power path',
    attribution: GENERIC,
  },
  clutch: {
    id: 'clutch',
    title: 'How the clutch works',
    summary:
      'The clutch is a stack of alternating friction plates and steel plates, squeezed together by springs. Squeezed together, they lock the engine to the transmission. Pulled apart, the engine can spin freely. The Rebel 500 uses an assist/slipper design, which Honda says reduces lever effort and "enhances controlled deceleration."',
    sequences: [
      {
        title: 'Lever released',
        steps: ['Springs squeeze the clutch plates together', 'Friction locks the basket to the hub', 'Crankshaft power is transmitted to the transmission'],
      },
      {
        title: 'Lever pulled',
        steps: ['The release mechanism lifts the pressure plate', 'Clamping force on the plates is released', 'The engine can rotate without fully driving the transmission'],
      },
      {
        title: 'Hard downshift (slipper function)',
        steps: ['The rear wheel tries to drive the engine (back-torque)', 'Ramps in the clutch push the plates apart slightly', 'The clutch slips briefly instead of hopping the rear tire'],
      },
    ],
    flowPath: ['clutch-lever', 'clutch', 'transmission'],
    flowLabel: 'Show clutch control path',
    attribution: GENERIC,
  },
  cooling: {
    id: 'cooling',
    title: 'How liquid cooling works',
    summary:
      'Coolant (a water and antifreeze mix) circulates through passages around the cylinders and in the head, picking up heat. The thermostat keeps coolant away from the radiator until the engine is warm. After that, coolant flows through the radiator, where air carries the heat away.',
    sequences: [
      {
        title: 'Coolant loop',
        steps: ['Water pump pushes coolant', 'Engine water jackets absorb heat', 'Thermostat opens when warm', 'Radiator sheds heat to the air', 'Cooled coolant returns to the pump'],
      },
    ],
    flowPath: ['water-pump', 'cylinders-pistons', 'thermostat', 'coolant-hoses', 'radiator'],
    flowLabel: 'Show coolant path',
    attribution: GENERIC,
  },
  'fuel-injection': {
    id: 'fuel-injection',
    title: 'How fuel injection (PGM-FI) works',
    summary:
      'When you twist the throttle, the butterflies in the 34 mm throttle bodies open and let in more air. The engine control unit measures conditions and pulses the injectors to add the matching amount of fuel. The fuel pump keeps the fuel pressurized.',
    sequences: [
      {
        title: 'Fuel and air path',
        steps: ['Fuel tank', 'Fuel pump pressurizes fuel', 'Injectors spray metered fuel', 'Throttle bodies meter air', 'Cylinder head intake ports', 'Combustion chamber'],
      },
    ],
    flowPath: ['fuel-tank', 'fuel-pump', 'throttle-bodies', 'cylinder-head-assy'],
    flowLabel: 'Show fuel path',
    attribution: GENERIC,
  },
  exhaust: {
    id: 'exhaust',
    title: 'Exhaust flow',
    summary:
      'Burned gas leaves each cylinder through the exhaust valves and runs down the two header pipes. Under the engine they merge into a chamber, and a single pipe carries the gas to the muffler, which absorbs sound energy. A sensor in the pipe, probably an oxygen sensor, lets the fuel injection fine-tune the mixture.',
    sequences: [{ title: 'Exhaust path', steps: ['Exhaust valves open', 'Two header pipes', 'Chamber under the engine', 'Exhaust sensor reading', 'Muffler', 'Atmosphere'] }],
    flowPath: ['cylinder-head-assy', 'exhaust-headers', 'exhaust-sensor', 'muffler'],
    flowLabel: 'Show exhaust path',
    attribution: GENERIC,
  },
  'four-stroke': {
    id: 'four-stroke',
    title: 'The four-stroke cycle',
    summary:
      'Each cylinder repeats four strokes. Intake: the piston goes down and draws in fuel and air. Compression: the piston rises and squeezes the mixture (10.7:1 on this engine, per Honda). Power: the spark ignites it and pushes the piston down. Exhaust: the piston rises again and pushes the burned gas out. The camshafts open the valves at the right moments.',
    sequences: [{ title: 'Cycle', steps: ['Intake', 'Compression', 'Power (spark ignites)', 'Exhaust'] }],
    flowPath: ['throttle-bodies', 'cylinder-head-assy', 'cylinders-pistons', 'crankshaft', 'exhaust-headers'],
    flowLabel: 'Show gas path',
    attribution: GENERIC,
  },
  suspension: {
    id: 'suspension',
    title: 'Springs and damping',
    summary:
      'Springs hold the bike up and absorb bump energy. Dampers use oil forced through small passages to stop the springs from bouncing. The fork handles the front wheel, and the two shocks control the swingarm at the rear.',
    flowPath: ['front-fork', 'swingarm', 'rear-shocks'],
    flowLabel: 'Highlight suspension',
    attribution: GENERIC,
  },
  steering: {
    id: 'steering',
    title: 'Rake and trail',
    summary:
      'The steering axis leans back 28° (rake). Where that axis meets the ground is 110 mm ahead of the tire contact patch (trail, per Honda). That offset makes the front wheel want to straighten itself, which gives stable, predictable steering.',
    attribution: GENERIC,
  },
  braking: {
    id: 'braking',
    title: 'Hydraulic brakes with ABS',
    summary:
      'Squeezing the lever or pressing the pedal pushes a piston in a master cylinder. The pressure travels through brake fluid to the caliper, which clamps pads onto the disc. ABS sits in the lines. If a wheel-speed sensor sees a wheel about to lock, the modulator rapidly releases and reapplies pressure so the tire keeps gripping.',
    sequences: [
      { title: 'Front brake', steps: ['Brake lever', 'Front master cylinder', 'Brake line → ABS modulator', 'Front caliper', 'Front disc (296 mm)'] },
      { title: 'Rear brake', steps: ['Brake pedal', 'Rear master cylinder', 'Brake line → ABS modulator', 'Rear caliper', 'Rear disc (240 mm)'] },
    ],
    flowPath: ['front-brake-lever', 'front-master-cylinder', 'front-brake-line', 'abs-modulator', 'front-brake-caliper', 'front-brake-disc'],
    flowLabel: 'Show front-brake hydraulic path',
    attribution: GENERIC,
  },
  charging: {
    id: 'charging',
    title: 'Charging and starting',
    summary:
      'The battery powers the starter motor, which turns the engine through the starting clutch. Once the engine runs, the generator produces AC power. The regulator/rectifier converts it to regulated DC to run the bike and recharge the battery.',
    sequences: [{ title: 'Charging', steps: ['Crankshaft turns generator', 'Regulator/rectifier → DC', 'Battery and electrical loads'] }],
    flowPath: ['generator', 'regulator-rectifier', 'battery'],
    flowLabel: 'Show charging path',
    attribution: GENERIC,
  },
};
