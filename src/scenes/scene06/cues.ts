export const SCENE06_BEATS = [
  { name: 'Return to the Proposal', duration: 2.8, narration: '' },
  { name: 'The Prototype Grant', duration: 2.6, narration: 'This grant could turn the idea into its first professional working prototype.' },
  { name: 'What That Enables', duration: 3.2, narration: 'And that prototype could open the door to museum partners, larger funding, and eventually the first full immersive room.' },
  { name: 'One Room Can Be the Beginning', duration: 3, narration: 'The goal is to start with one room and build toward immersive spaces in museums across the country.' },
  { name: 'Beyond the Exhibit', duration: 3.1, narration: "My goal isn't just to help people look at science." },
  { name: 'Step Inside It', duration: 3.6, narration: "It's to help them step inside it." },
] as const
export const SCENE06_AUDIO = ['scene6_enter', 'grant_reveal', 'prototype_path_reveal', 'expansion_reveal',
  'final_title_reveal', 'final_pause', 'step_inside_reveal', 'final_resolution'] as const
export type Scene06AudioCueName = typeof SCENE06_AUDIO[number]
export const closingCues: readonly (readonly (readonly [Scene06AudioCueName, number])[])[] = [
  [['scene6_enter', 0]], [['grant_reveal', .4]], [['prototype_path_reveal', .4]],
  [['expansion_reveal', .5]], [['final_title_reveal', .45], ['final_pause', 2.4]],
  [['step_inside_reveal', .55], ['final_resolution', 2.25]],
]
