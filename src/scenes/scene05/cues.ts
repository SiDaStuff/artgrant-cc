export const SCENE05_BEATS = [
  { name: 'Imagine What This Room Could Become', duration: 3.2, narration: '' },
  { name: 'Inside the Atom', duration: 3.4, narration: 'Inside the Atom could be the first experience.' },
  { name: 'Deep Ocean', duration: 3.2, narration: 'But the same room could take visitors somewhere completely different.' },
  { name: 'Human Body', duration: 3.2, narration: 'Inside the human body...' },
  { name: 'Beyond Our Reach', duration: 4, narration: '...or farther than we could ever physically travel.' },
  { name: 'Ancient Rome', duration: 3.4, narration: 'And the same technology could bring history to life too.' },
  { name: 'One Room. Endless Places to Go.', duration: 3.6, narration: "This isn't one exhibit. It's a space that can become something new again and again." },
] as const

export const SCENE05_AUDIO = [
  'scene5_enter', 'atom_low_pulse', 'particle_rise', 'atom_reveal', 'sub_hit_01',
  'ocean_transition', 'underwater_rumble', 'distant_creature', 'sub_hit_02',
  'heartbeat_start', 'body_transition', 'heartbeat_impact', 'biological_rise',
  'blackhole_sub_hit', 'cosmic_rise', 'gravitational_rumble',
  'stone_rumble', 'rome_footsteps', 'distant_city', 'torch_ambience',
  'final_vision_reveal',
] as const
export type Scene05AudioCueName = typeof SCENE05_AUDIO[number]

/** Positions in the beat-local animation clock; holds never fire additional cues. */
export const beatCues: Partial<Record<number, readonly (readonly [Scene05AudioCueName, number])[]>> = {
  0: [['scene5_enter', .38]],
  1: [['atom_low_pulse', 0], ['particle_rise', .35], ['atom_reveal', 1.4], ['sub_hit_01', 1.4]],
  2: [['ocean_transition', 0], ['underwater_rumble', .3], ['sub_hit_02', 1.1], ['distant_creature', 1.8]],
  3: [['heartbeat_start', 0], ['body_transition', .25], ['heartbeat_impact', 1.25], ['biological_rise', 1.5]],
  4: [['cosmic_rise', .55], ['blackhole_sub_hit', 1.35], ['gravitational_rumble', 1.8]],
  5: [['rome_footsteps', 0], ['stone_rumble', .5], ['distant_city', 1.5], ['torch_ambience', 2.2]],
  6: [['final_vision_reveal', 1.25]],
}
