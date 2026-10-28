export const narrationCues = [
  { time: 0, text: 'Most museum exhibits are something we look at.' },
  { time: 3.2, text: 'But what if the exhibit could surround you instead?' },
  { time: 7.4, text: 'What if you could actually step inside the idea?' },
  { time: 12.5, text: "That's the idea behind Beyond the Exhibit." },
] as const

export function getNarrationCue(time: number) {
  const current = narrationCues.findLast(cue => cue.time <= time)
  const next = narrationCues.find(cue => cue.time > time)
  return { current, next }
}

export const audioCues = [
  { time: 0, name: 'paper_draw' },
  { time: 0.35, name: 'pencil_scratch' },
  { time: 3.2, name: 'idea_pop' },
  { time: 7.4, name: 'footsteps_doodle' },
  { time: 12, name: 'transition_riser' },
  { time: 15.8, name: 'room_reveal' },
  { time: 17, name: 'title_reveal' },
] as const
export type AudioCueName = typeof audioCues[number]['name']
