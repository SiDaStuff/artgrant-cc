export const SCENE03_BEATS = [
  { name: 'Back to the sketch', duration: 2.7, narration: 'Transition to the concept notebook. Hold before beginning the comparison.' },
  { name: 'Look at it', duration: 2.2, narration: 'Most exhibits ask visitors to look at something from the outside.' },
  { name: 'Step inside it', duration: 2.4, narration: 'This gives museums another option: letting visitors feel surrounded by the subject instead.' },
  { name: 'Memorable', duration: 2.6, narration: 'When visuals, sound, space, and storytelling work together, difficult ideas can become much more memorable.' },
  { name: 'Art + science + technology', duration: 2.6, narration: 'The project also brings together art, science, and technology instead of treating them as separate subjects.' },
  { name: 'One room, many experiences', duration: 3, narration: 'And because the room is digital, museums could create new experiences without rebuilding the entire exhibit.' },
  { name: 'Who benefits', duration: 2.6, narration: "The goal isn't to replace traditional exhibits. It's to give museums another way to make an idea exciting, artistic, and memorable." },
  { name: 'From looking to experiencing', duration: 3.2, narration: 'Look at it. Step inside it. Art + science + technology. Final hold.' },
] as const

export const scene03AudioCues = [
  'scene3_paper_transition', 'ink_draw', 'comparison_reveal', 'memorable_reveal',
  'venn_reveal', 'experience_branch', 'benefit_reveal', 'final_scrapbook_hold',
] as const
export type Scene03AudioCueName = typeof scene03AudioCues[number]
