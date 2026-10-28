export const SCENE02_BEATS = [
  { name: 'From idea to physical space', duration: 1.15, narration: 'Beyond the Exhibit. Immersive museum experiences.' },
  { name: 'The physical room', duration: 2.5, narration: 'The idea is to build a room designed from the beginning for immersive experiences.' },
  { name: 'Large-scale projection', duration: 3.2, narration: 'Large-scale projectors could turn the walls and ceiling into almost any environment.' },
  { name: 'Surround sound', duration: 2.8, narration: 'Surround sound, music, and narration would make the experience feel like it was happening all around you.' },
  { name: 'Lighting + holographic effects', duration: 4.2, narration: 'Lighting and holographic-style effects could bring parts of the presentation off the walls and into the room itself.' },
  { name: 'Visitor scale', duration: 3.1, narration: 'Each presentation could hold around twenty-five to forty people, standing and moving through the space together.' },
  { name: 'One room, many experiences', duration: 8.2, narration: 'And because the technology stays in place, the same room could host completely different experiences without rebuilding the exhibit.' },
  { name: 'One room. Unlimited experiences.', duration: .65, narration: 'One room. Unlimited experiences. Hold, then advance to Why This Matters when ready.' },
] as const

export const scene02AudioCues = [
  'scene2_enter', 'room_ambience', 'projection_activate', 'surround_reveal',
  'low_sub_pulse', 'spatial_whoosh', 'subtle_sub_hit', 'lighting_activate',
  'hologram_reveal', 'visitors_reveal', 'environment_ocean', 'environment_space',
  'environment_micro', 'reusable_room_reveal',
] as const
export type Scene02AudioCueName = typeof scene02AudioCues[number]
