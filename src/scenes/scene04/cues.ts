export const SCENE04_BEATS = [
  { name: 'A fresh concept page', duration: 1.4, narration: 'Clear the concept notebook. Hold before introducing the proposed location.' },
  { name: 'First proposed location', duration: 2.4, narration: 'The first proposed location is The Franklin Institute in Philadelphia.' },
  { name: 'Professional prototype funding', duration: 3.8, narration: 'Ten thousand dollars would not build the final room. It would fund the professional prototype needed to prove the idea and take it to museums and larger sponsors.' },
  { name: 'What the grant funds', duration: 3.5, narration: 'The grant would let us test the actual technology, create the visual and audio content, build a room mockup, and develop a complete museum-ready design.' },
  { name: 'Design → build → test → present', duration: 3.8, narration: 'The prototype would then be used to gather feedback, approach museum partners and sponsors, and work toward the first full installation.' },
  { name: 'Project leadership + collaboration', duration: 3.3, narration: 'I would lead the creative direction, bringing together my interests in coding, visual design, music, and technology, while working with experts where the project needs specialized knowledge.' },
  { name: 'The grant makes the next stage possible', duration: 3.2, narration: 'The grant would not be the end of the project. It would be the step that makes the next stage possible.' },
  { name: 'From idea to prototype', duration: 2.8, narration: '$10,000 starts the path toward the first immersive room. Final hold; the full room is a future goal.' },
] as const

export const scene04AudioCues = [
  'scene4_page_clear', 'location_reveal', 'funding_reveal', 'prototype_reveal',
  'component_draw', 'process_step', 'leadership_reveal', 'funding_path', 'final_prototype_hold',
] as const
export type Scene04AudioCueName = typeof scene04AudioCues[number]
