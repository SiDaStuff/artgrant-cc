import { paperTexture } from '../scene01/scrapbook'
import { stickFigure } from '../scene03/transition'

let textId = 0
function text(value: string, x: number, y: number, size: number, width: number, extra = '', print = false, anchor = 'middle') {
  const id = `s4-writing-${++textId}`
  const start = anchor === 'middle' ? -width / 2 : 0
  return `<g class="s4-text ${extra}" transform="translate(${x} ${y})"><defs><clipPath id="${id}"><rect class="s4-writing-mask" data-width="${width}" x="${start}" y="${-size * 1.15}" width="0" height="${size * 1.6}"/></clipPath></defs><text class="${print ? 's4-print' : 's4-hand'}" font-size="${size}" text-anchor="${anchor}" clip-path="url(#${id})">${value}</text></g>`
}

function arrow(d: string, extra = '') { return `<path class="s4-draw ${extra}" d="${d}" stroke-width="1.7"/>` }

function room(x: number, y: number, scale: number, polished = false) {
  return `<g class="s4-room" transform="translate(${x} ${y}) scale(${scale})">
    ${polished ? '<path d="M0 0L430 0 430 300 0 300Z" fill="#e6e5da" stroke="none"/><path d="M0 0L85 65 345 65 430 0Z" fill="#d4d7ca" stroke="none"/><path d="M85 65H345V230H85Z" fill="#c2cbbc" stroke="none"/><path d="M0 300L85 230H345L430 300Z" fill="#d9dacf" stroke="none"/>' : ''}
    <path class="s4-draw" d="M0 0L429 2 431 300 0 298ZM0 0L85 65 345 64 429 2M85 65L85 231 345 230 345 64M0 298L85 231M431 300L345 230"/>
    <path class="s4-draw" stroke-width="1.4" opacity=".6" d="M86 92L344 91M97 211Q158 180 218 197T335 205M98 193Q160 169 220 182T335 189M29 48L73 86M403 48L356 87"/>
    <path class="s4-draw" stroke-width="1.8" d="M192 43L236 43 238 65 192 66ZM205 66L201 80M228 65L234 80M27 110L44 110 44 151 27 151ZM386 110L403 110 403 151 386 151"/>
    ${polished ? '<path class="s4-draw" d="M114 249L141 249 141 273 114 273ZM127 274L111 297M128 274L145 297M296 241L324 241 324 264 296 264M310 265L293 295M310 265L327 295" stroke-width="1.7"/>' : ''}
  </g>`
}

function museum(x: number, y: number, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke-width="2">
    <path class="s4-draw" d="M-280 166L280 166M-272 158L272 158M-263 148L263 148M-251 138L251 138M-141-20L141-20 151-4-151-4ZM-150-31L0-75 150-31ZM-242 15L-155 15M155 15L242 15M-245 20L-245 136M245 20L245 136M-245 38L-157 38M157 38L245 38M-153 129L153 129M-155 3L155 3M-154 12L154 12"/>
    <path class="s4-draw" d="M-132 14L-132 127M-115 14L-115 127M-85 14L-85 127M-68 14L-68 127M-39 14L-39 127M-22 14L-22 127M22 14L22 127M39 14L39 127M68 14L68 127M85 14L85 127M115 14L115 127M132 14L132 127"/>
    <path class="s4-draw" stroke-width="1.3" d="M-226 60H-203V110H-226ZM-192 60H-170V110H-192ZM170 60H192V110H170ZM203 60H226V110H203ZM-12 79Q0 62 12 79V128H-12Z"/>
  </g>`
}

const components = [
  { x: 140, y: 290, lines: ['3D ROOM DESIGN'], leader: 'M495 295Q560 290 625 393M615 385L627 394 612 397' },
  { x: 140, y: 410, lines: ['IMMERSIVE VISUAL', 'DEVELOPMENT'], leader: 'M495 425L623 451M610 443L626 452 611 456' },
  { x: 140, y: 545, lines: ['PROJECTION TESTING'], leader: 'M495 545L623 508M610 505L626 507 615 517' },
  { x: 140, y: 675, lines: ['SOUND + MUSIC DESIGN'], leader: 'M495 671Q558 660 626 575M614 581L628 572 627 588' },
  { x: 1065, y: 290, lines: ['LIGHTING TESTS'], leader: 'M1040 295Q1000 320 980 393M976 380L979 396 988 384' },
  { x: 1065, y: 410, lines: ['HOLOGRAPHIC-EFFECT', 'PROTOTYPE'], leader: 'M1040 425L981 451M988 442L978 453 993 451' },
  { x: 1065, y: 545, lines: ['PHYSICAL MOCKUP', '+ MATERIALS'], leader: 'M1040 558L979 515M986 525L978 513 993 516' },
  { x: 1065, y: 675, lines: ['MUSEUM-READY', 'PROPOSAL'], leader: 'M1040 682Q998 647 979 577M977 591L977 574 986 585' },
]

export function createScene04Scrapbook(roomImage: string | null) {
  const root = document.createElement('div')
  root.className = 's4-notebook'
  root.innerHTML = `<svg class="s4-page" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="From idea to prototype: a practical use for the art grant">
    <defs><pattern id="s4-grain" width="400" height="400" patternUnits="userSpaceOnUse"><image href="${paperTexture()}" width="400" height="400"/></pattern>
      <radialGradient id="s4-shade" cx=".45" cy=".42" r=".76"><stop stop-color="#f7f4ec"/><stop offset="1" stop-color="#e9e4d8"/></radialGradient>
      <clipPath id="s4-goal-frame"><rect x="0" y="0" width="370" height="240" rx="1"/></clipPath>
      <linearGradient id="s4-room-glow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111b16"/><stop offset=".7" stop-color="#728571"/><stop offset="1" stop-color="#273f32"/></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#s4-shade)"/><rect width="1600" height="900" fill="url(#s4-grain)" opacity=".26" style="mix-blend-mode:multiply"/>
    <g class="s4-ink" stroke="#30382e" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <g class="s4-panel s4-intro">${text('From idea', 800, 414, 79, 760)}${text('to prototype.', 800, 515, 86, 970)}${arrow('M643 551Q800 558 962 551', 's4-intro-rule')}</g>
      <g class="s4-panel s4-location">
        ${text('FIRST PROPOSED LOCATION', 800, 216, 28, 1000, '', true)}
        ${museum(800, 380, .88)}
        ${text('THE FRANKLIN INSTITUTE', 800, 656, 49, 1300, '', true)}
        ${text('Philadelphia, Pennsylvania', 800, 718, 41, 1060)}
        <path class="s4-draw" d="M1149 358C1123 326 1167 306 1180 330C1190 348 1171 359 1161 371ZM1151 338C1150 326 1168 327 1168 338C1168 348 1151 349 1151 338Z" stroke-width="1.8" opacity=".6"/>
      </g>
      <g class="s4-panel s4-scope">
        ${text('$10,000', 800, 298, 111, 1130, 's4-scope-amount', true)}
        <g class="s4-scope-not">${text('NOT: A COMPLETE PERMANENT INSTALLATION', 800, 464, 30, 1400, '', true)}</g>
        <g class="s4-scope-yes">${arrow('M800 333L800 395M789 382L800 397 811 382')}
          ${text('A PROFESSIONAL', 800, 471, 40, 1120, '', true)}
          ${text('PROTOTYPE', 800, 572, 90, 1300, 's4-scope-prototype', true)}
          ${text('Permanent room: a later phase + additional funding.', 800, 704, 36, 1400, 's4-scope-clarification')}
        </g>
      </g>
      <g class="s4-panel s4-components">
        ${text('WHAT THE GRANT MAKES POSSIBLE', 800, 207, 32, 1370, '', true)}
        ${room(630, 355, .8, true)}
        ${text('PROTOTYPE', 800, 664, 39, 460)}
        ${components.map((item, i) => `<g class="s4-component" data-component="${i}">${item.lines.map((line, n) => text(line, item.x, item.y + n * 38, 28, i < 4 ? 425 : 440, '', true, 'start')).join('')}${arrow(item.leader)}</g>`).join('')}
      </g>
      <g class="s4-panel s4-process">
        <g class="s4-process-stage s4-design">${text('DESIGN', 250, 273, 43, 340, '', true)}<path class="s4-draw" d="M178 323L315 324 315 405 180 405ZM168 417L326 417M225 405L225 416M269 405L269 416M197 342L289 343 289 387 197 387ZM197 342L224 356 266 356 289 343M224 356L224 377 266 377 266 356"/></g>
        <g class="s4-process-stage s4-build">${text('BUILD', 615, 273, 43, 320, '', true)}${room(552, 327, .3)}<path class="s4-draw" d="M698 347L713 332 725 344 711 359M703 354L686 374M691 365L699 372" stroke-width="1.6"/></g>
        <g class="s4-process-stage s4-test">${text('TEST', 985, 273, 43, 300, '', true)}<path class="s4-draw" d="M927 344L1017 343 1020 387 927 388ZM1019 350L1043 341 1043 390 1020 380M943 389L935 405M999 388L1008 405M1010 425L1021 436 1042 410"/></g>
        <g class="s4-process-stage s4-present">${text('PRESENT', 1350, 273, 43, 390, '', true)}<path class="s4-draw" d="M1282 322L1419 323 1420 408 1282 407ZM1316 409L1305 440M1385 408L1397 440M1300 338L1346 338 1346 386 1300 386M1357 341L1400 341M1357 356L1394 356M1357 372L1401 372"/></g>
        <g class="s4-process-arrows">${arrow('M351 258L488 258M475 248L490 258 476 268')}${arrow('M712 258L856 258M844 248L859 258 844 268')}${arrow('M1077 258L1217 258M1204 248L1219 258 1204 268')}</g>
        <path class="s4-draw" d="M150 500H1450" stroke-width=".8" opacity=".25"/>
        <g class="s4-long-path">${text('Next, with the prototype…', 800, 559, 35, 980)}
          ${text('PROTOTYPE', 325, 657, 34, 420, '', true)}${text('MUSEUM PARTNER', 800, 657, 34, 550, '', true)}${text('FULL INSTALLATION', 1280, 657, 32, 550, '', true)}
          ${arrow('M464 645L596 645M582 636L598 645 582 655')}${arrow('M1002 645L1090 645M1077 636L1092 645 1077 655')}
          ${text('feedback + refinement', 325, 719, 29, 420)}${text('partners + sponsors', 800, 719, 29, 460)}${text('future funding', 1280, 719, 29, 420)}
        </g>
      </g>
      <g class="s4-panel s4-leadership">
        ${text('SILAS DAVIS', 448, 218, 56, 800, '', true)}
        ${stickFigure(320, 576, 1.35).replaceAll('s3-', 's4-')}
        <path class="s4-draw" d="M449 337L782 338 782 555 450 555ZM515 556L497 597M723 557L740 597"/>
        ${room(488, 370, .48)}
        <path class="s4-draw" d="M716 384L757 384M716 400L761 400M716 418L752 418M472 532Q606 526 756 531" stroke-width="1.3" opacity=".6"/>
        ${text('CODING', 251, 666, 29, 260, '', true)}${text('VISUAL DESIGN', 575, 666, 29, 420, '', true)}
        ${text('MUSIC + SOUND', 251, 731, 29, 400, '', true)}${text('EXPERIENCE DESIGN', 594, 731, 28, 490, '', true)}
        <g class="s4-collaboration">${arrow('M829 462Q889 452 944 463M930 452L946 463 929 472')}
          ${text('COLLABORATION', 1207, 271, 44, 610)}
          ${text('SCIENTISTS', 1038, 376, 30, 440, '', true, 'start')}${text('ENGINEERS', 1038, 468, 30, 440, '', true, 'start')}
          ${text('MUSEUM PROFESSIONALS', 1038, 560, 27, 480, '', true, 'start')}${text('EDUCATORS', 1038, 652, 30, 440, '', true, 'start')}
          <path class="s4-draw" d="M1004 369L976 363 990 344ZM975 443L1002 443 1003 469 976 469ZM974 541L990 529 1007 541ZM975 545L1007 545M980 548L980 567M1002 548L1002 567M972 570L1009 570M973 632Q987 628 991 636Q999 628 1010 633L1010 654Q999 650 991 659Q984 650 973 654Z" stroke-width="1.7"/>
        </g>
      </g>
      <g class="s4-panel s4-funding-path">
        <g class="s4-path-stage">${text('$10,000', 800, 239, 86, 1130, '', true)}</g>
        <g class="s4-path-stage">${arrow('M800 274L800 319M789 306L800 321 811 306')}${text('WORKING PROTOTYPE', 800, 386, 48, 1360, '', true)}${text('funded proof of concept', 800, 432, 30, 960)}</g>
        <g class="s4-path-stage">${arrow('M800 451L800 484M789 471L800 486 811 471')}${text('MUSEUM PARTNER', 800, 550, 43, 1250, '', true)}${text('partnership + larger funding', 800, 596, 31, 1140)}</g>
        <g class="s4-path-stage">${arrow('M800 615L800 648M789 635L800 650 811 635')}${text('FIRST FULL ROOM', 800, 716, 43, 1170, '', true)}${text('future goal', 800, 763, 31, 900)}</g>
      </g>
      <g class="s4-panel s4-finale">
        ${text('FROM IDEA', 800, 210, 51, 1200, '', true)}${text('TO PROTOTYPE', 800, 288, 64, 1370, '', true)}
        ${text('$10,000 starts the path toward the first immersive room.', 800, 352, 34, 1440)}
        <g class="s4-final-sketch">${room(145, 448, .76)}${text('SKETCH', 307, 754, 33, 370, '', true)}</g>
        <g class="s4-final-prototype">${room(630, 448, .76, true)}${text('WORKING PROTOTYPE', 793, 754, 28, 440, '', true)}</g>
        <g class="s4-future-room" transform="translate(1100 437)">
          <g clip-path="url(#s4-goal-frame)">${roomImage ? `<image href="${roomImage}" x="-28" y="0" width="427" height="240" preserveAspectRatio="xMidYMid slice"/>` : '<rect width="370" height="240" fill="url(#s4-room-glow)"/>'}</g>
          <path class="s4-draw" d="M0 0H370V240H0Z" stroke-width="1" opacity=".5"/>
          ${text('FULL ROOM', 185, 317, 31, 420, '', true)}${text('future goal', 185, 362, 30, 360)}
        </g>
        <g class="s4-final-arrows">${arrow('M495 561Q541 553 589 562M576 552L591 562 575 572')}${arrow('M978 561Q1027 553 1072 562M1059 552L1074 562 1058 572')}</g>
      </g>
    </g>
    <g class="s4-folio" fill="#65675d" font-family="Manrope,sans-serif" font-size="11" letter-spacing="3">
      <path d="M100 118H1500" stroke="#777c6a" stroke-width=".7" opacity=".26"/>
    </g>
  </svg>`
  return root
}
