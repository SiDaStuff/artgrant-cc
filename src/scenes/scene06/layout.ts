/** Restrained expansion motif: four conceptual rooms, not confirmed museum locations. */
export function expansionRooms() {
  const room = (x: number, y: number, scale: number) => `<g class="s6-small-room" transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 20L51 0 116 24 66 46Z" fill="url(#s6-room-ceiling)" opacity=".5"/>
    <path d="M0 20V78L66 110 116 81V24L66 46Z" fill="url(#s6-room-screen)" opacity=".28"/>
    <path d="M0 20L51 0 116 24 66 46ZM0 20V78L66 110 116 81V24M66 46V110"/>
    <path d="M9 29L50 14 106 34M19 34L59 19 106 37M29 38L69 23 106 41M9 75L66 99 108 77M15 69L66 91 103 72" opacity=".35"/>
    <path d="M5 59C32 38 48 77 66 66S96 49 111 58" stroke="#b2d0d0" opacity=".6"/>
    <path d="M34 70v17m-4-10 4-7 4 7m46-4v16m-4-10 4-6 4 7" opacity=".55"/>
    <circle cx="34" cy="65" r="3" fill="currentColor" stroke="none"/><circle cx="84" cy="68" r="3" fill="currentColor" stroke="none"/></g>`
  return `<svg viewBox="0 0 760 190" aria-hidden="true"><defs>
    <linearGradient id="s6-room-ceiling"><stop stop-color="#709299"/><stop offset="1" stop-color="#1a303d"/></linearGradient>
    <linearGradient id="s6-room-screen" x2="0" y2="1"><stop stop-color="#6e9eae"/><stop offset="1" stop-color="#183544"/></linearGradient>
    </defs><g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">
    <path class="s6-expansion-line" d="M115 105C210 120 250 75 326 88S462 111 538 76" stroke-dasharray="3 9" opacity=".28"/>
    ${room(36, 27, 1.1)}${room(255, 46, .8)}${room(438, 30, .61)}${room(597, 46, .44)}</g></svg>`
}

export function closingMarkup() {
  return `<div class="s6-room" aria-hidden="true"></div><div class="s6-shade"></div>
    <svg class="s6-world-path" viewBox="0 0 1600 900" aria-hidden="true"><g fill="none" stroke="#b4d1d4" stroke-width="1.3">
      ${Array.from({ length: 4 }, () => '<polyline points="0,0 0,0" opacity=".22"/><circle r="5" opacity=".8"/>').join('')}
    </g></svg><div class="s6-outgoing"></div>
    <section class="s6-panel s6-grant"><p class="s6-amount">$10,000</p><h1>FOR THE FIRST<br>PROFESSIONAL PROTOTYPE</h1></section>
    <section class="s6-panel s6-path" aria-label="A possible path from idea to the first room">
      <div class="s6-path-stage"><span>IDEA</span></div><i class="s6-path-arrow" aria-hidden="true"></i>
      <div class="s6-path-stage"><span>PROTOTYPE</span></div><i class="s6-path-arrow" aria-hidden="true"></i>
      <div class="s6-path-stage"><span>MUSEUM<br>PARTNERSHIP</span></div><i class="s6-path-arrow" aria-hidden="true"></i>
      <div class="s6-path-stage"><span>FIRST ROOM</span></div>
      <p class="s6-path-note">A beginning — with partners and larger future funding.</p></section>
    <section class="s6-panel s6-expansion"><p>START WITH ONE ROOM.</p><h1>TOWARD THE FIRST IMMERSIVE ROOM.</h1>${expansionRooms()}</section>
    <section class="s6-panel s6-title"><p class="s6-location">FIRST PROPOSED LOCATION — THE FRANKLIN INSTITUTE, PHILADELPHIA</p></section>
    <section class="s6-panel s6-finale"><h1><span>DON'T JUST LOOK AT SCIENCE.</span><strong>STEP INSIDE IT.</strong></h1></section>`
}
