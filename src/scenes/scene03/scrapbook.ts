import { paperTexture } from '../scene01/scrapbook'
import { stickFigure } from './transition'

let writingId = 0
function label(text: string, x: number, y: number, size: number, width: number, extra = '') {
  const id = `s3-writing-${++writingId}`
  return `<g class="s3-writing ${extra}" transform="translate(${x} ${y})"><defs><clipPath id="${id}"><rect class="s3-writing-mask" data-width="${width}" x="${-width / 2}" y="${-size}" width="0" height="${size * 1.5}"/></clipPath></defs><text class="s3-hand" font-size="${size}" text-anchor="middle" clip-path="url(#${id})" transform="rotate(-1)">${text}</text></g>`
}

function room(x: number, y: number, scale = 1, character = true) {
  return `<g class="s3-room-drawing" transform="translate(${x} ${y}) scale(${scale})">
    <path class="s3-draw" d="M0 0L429 2 431 300 0 298ZM0 0L82 63 349 62 429 2M82 63L82 232 349 231 349 62M0 298L82 232M431 300L349 231"/>
    <path class="s3-draw" stroke-width="1.4" opacity=".65" d="M83 90L348 89M13 50L70 94M415 49L361 94M94 211Q160 179 222 201T338 207M96 192Q159 168 218 184T336 190M105 75L115 75M317 75L328 75"/>
    <path class="s3-draw" stroke-width="1.5" d="M24 116L41 116 42 157 24 156ZM388 116L405 116 405 156 388 157M48 122Q61 135 48 150M382 122Q369 135 382 150"/>
    ${character ? stickFigure(214, 268, .83, 's3-room-person') : ''}
  </g>`
}

function traditional() {
  return `<g class="s3-traditional">
    <g class="s3-observer">${stickFigure(620, 608, 1.14)}</g>
    <g transform="translate(790 325)">
      <path class="s3-draw" d="M0 0L156-2 174 17 174 135 0 138ZM0 0L18 18 174 17M18 18L18 137M0 138L0 154 174 152 174 135M22 154L16 282M150 154L157 281M0 285Q85 282 174 285"/>
      <path class="s3-draw" stroke-width="1.5" d="M45 100L52 58 69 51 88 69 104 53 132 100ZM69 51L76 82 52 58M89 69L89 100"/>
      <path class="s3-draw" opacity=".4" stroke-width="1.2" d="M32 31L41 42M39 30L51 43M157 82L157 116M9 178L7 237"/>
    </g>
    <path class="s3-draw" stroke-width="1" opacity=".35" d="M566 612Q619 609 678 612M775 614Q871 609 981 612"/>
    ${label('LOOK AT IT', 790, 709, 55, 440, 's3-look-label')}
  </g>`
}

export function createScene03Scrapbook(trace: string) {
  const root = document.createElement('div')
  root.className = 's3-notebook'
  root.innerHTML = `<svg class="s3-page" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" fill="none" aria-label="Why this matters: from looking at an exhibit to stepping inside an experience">
    <defs>
      <pattern id="s3-grain" width="400" height="400" patternUnits="userSpaceOnUse"><image href="${paperTexture()}" width="400" height="400"/></pattern>
      <radialGradient id="s3-paper-shade" cx=".45" cy=".42" r=".76"><stop stop-color="#f7f4ec"/><stop offset="1" stop-color="#e9e4d8"/></radialGradient>
      <mask id="s3-venn-gap"><rect width="1600" height="900" fill="white"/><rect x="690" y="409" width="221" height="83" fill="black"/></mask>
      <clipPath id="s3-trace-viewport"><rect width="1600" height="900"/></clipPath>
    </defs>
    <g class="s3-sheet"><rect width="1600" height="900" fill="url(#s3-paper-shade)"/><rect width="1600" height="900" fill="url(#s3-grain)" opacity=".26" style="mix-blend-mode:multiply"/></g>
    <g class="s3-ink" stroke="#292e29" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <g class="s3-trace"><g clip-path="url(#s3-trace-viewport)">${trace}</g></g>
      <g class="s3-comparison">
        ${traditional()}
        <g class="s3-immersive">${room(935, 310, 1.1)}${label('STEP INSIDE IT', 1175, 709, 62, 570, 's3-inside-label')}</g>
        <path class="s3-comparison-arrow s3-draw" d="M650 430Q755 416 884 432M865 419L886 432 864 443" stroke-width="2.5"/>
      </g>
      <g class="s3-memorable">
        <g class="s3-senses" stroke-width="2">
          <path class="s3-draw" d="M497 329L515 319 515 363 497 355ZM525 321Q547 340 525 360M535 311Q568 340 535 371"/>
          <path class="s3-draw" d="M1090 295Q1084 285 1094 281L1153 280Q1162 282 1162 295L1161 320 1138 322 1126 337 1127 322 1094 322ZM1103 293L1148 293M1103 307L1138 307"/>
          <path class="s3-draw" d="M1074 487L1075 452 1103 447 1103 480M1076 453L1102 449M1074 485C1056 478 1053 499 1069 497ZM1102 479C1086 472 1080 494 1096 492Z"/>
          <path class="s3-draw" d="M508 499L492 487M504 515L479 514M510 531L494 543M1123 384Q1138 376 1151 383M1129 394Q1142 388 1156 395"/>
        </g>
        ${label('MEMORABLE', 800, 691, 74, 650, 's3-memory-title')}
      </g>
      <g class="s3-venn">
        <g class="s3-venn-circles" mask="url(#s3-venn-gap)">
        <path class="s3-draw" d="M851 359C849 482 754 575 637 575C515 575 418 477 420 358C418 240 514 145 635 144C758 143 853 239 851 359Z"/>
        <path class="s3-draw" d="M1181 362C1180 481 1085 577 964 575C847 576 750 482 749 362C748 242 844 146 965 145C1084 146 1180 241 1181 362Z"/>
        <path class="s3-draw" d="M1015 550C1016 669 918 765 800 766C681 766 584 671 585 551C584 433 681 335 800 335C921 334 1017 431 1015 550Z"/>
        </g>
        ${label('ART', 550, 314, 58, 180)}${label('SCIENCE', 1050, 314, 51, 280)}${label('TECHNOLOGY', 800, 637, 47, 430)}
        ${label('THE', 800, 442, 29, 140)}${label('EXPERIENCE', 800, 478, 35, 300)}
        <path class="s3-draw" stroke="#768068" stroke-width="2" d="M504 328Q547 334 596 329M749 495Q801 501 852 495"/>
        <g class="s3-category-doodles" stroke-width="1.6">
          <path class="s3-draw" d="M479 375L545 374 546 424 480 425ZM492 386L506 386 505 412 492 412ZM516 385L533 385 534 412 517 412M589 388L590 362 610 358 611 382M590 388C577 383 574 398 586 396ZM611 382C600 379 595 392 607 391Z"/>
          <ellipse class="s3-draw" cx="1062" cy="400" rx="25" ry="23"/><ellipse class="s3-draw" cx="1062" cy="400" rx="47" ry="9" transform="rotate(-20 1062 400)"/>
          <path class="s3-draw" d="M1032 456Q1045 436 1057 456T1082 456T1107 455M710 682L750 680 752 706 711 708ZM753 687L766 683 766 705 752 701M842 675L871 674 872 716 842 716"/><circle class="s3-draw" cx="857" cy="700" r="8"/>
        </g>
      </g>
      <g class="s3-reuse">
        ${label('ONE ROOM', 800, 335, 58, 490)}${room(630, 382, .79)}${label('MANY EXPERIENCES', 800, 770, 62, 910)}
        <g class="s3-branches" stroke-width="1.6">
          <path class="s3-draw" d="M630 447Q505 434 416 361M427 365L415 358 418 372"/>
          <path class="s3-draw" d="M902 382Q1019 294 898 245M909 243L896 243 903 253"/>
          <path class="s3-draw" d="M970 448Q1078 411 1188 362M1177 362L1191 360 1184 371"/>
          <path class="s3-draw" d="M630 567Q523 588 453 620M461 611L450 622 464 622"/>
          <path class="s3-draw" d="M970 567Q1086 590 1136 619M1124 617L1139 621 1131 610"/>
        </g>
        <g class="s3-experience-concepts" stroke-width="2">
          <g class="s3-concept" transform="translate(325 320)"><circle class="s3-draw" cx="-26" cy="-9" r="11"/><circle class="s3-draw" cx="21" cy="-25" r="9"/><circle class="s3-draw" cx="14" cy="23" r="12"/><path class="s3-draw" d="M-15-13L12-23M20-16L17 11M-18 0L4 16"/>${label('ATOM', 0, 80, 38, 170)}</g>
          <g class="s3-concept" transform="translate(800 180)"><ellipse class="s3-draw" cx="0" cy="0" rx="30" ry="27"/><ellipse class="s3-draw" cx="0" cy="0" rx="56" ry="9" transform="rotate(-18)"/><path class="s3-draw" d="M-64-38L-64-24M-71-31L-57-31M58-24L58-14M53-19L63-19"/>${label('SPACE', 0, 75, 38, 190)}</g>
          <g class="s3-concept" transform="translate(1275 320)"><path class="s3-draw" d="M-58 1Q-44-18-30 1T-2 1T26 1T54 1M-54 22Q-40 4-26 22T2 22T30 22T58 22M-27-24Q-3-43 18-24Q-3-6-27-24L-41-36-41-13Z"/>${label('OCEAN', 0, 80, 38, 220)}</g>
          <g class="s3-concept" transform="translate(350 607)"><path class="s3-draw" d="M-51-27L0-55 51-27ZM-55-21L55-21M-49 37L49 37M-56 45L56 45M-38-17L-38 33M-24-17L-24 33M-7-17L-7 33M7-17L7 33M24-17L24 33M38-17L38 33"/>${label('HISTORY', 0, 96, 38, 250)}</g>
          <g class="s3-concept" transform="translate(1240 610)"><path class="s3-draw" d="M0 31C-13 14-46-1-42-24C-37-50-9-49 0-28C13-50 43-46 44-22C45-1 14 16 0 31ZM-32-8L-15-8-6-23 4 6 13-8 34-8"/>${label('HUMAN BODY', 0, 94, 36, 350)}</g>
        </g>
      </g>
      <g class="s3-benefits">
        <g class="s3-benefit-students">${stickFigure(270, 362, .7)}${stickFigure(333, 365, .64)}${stickFigure(391, 362, .73)}${label('STUDENTS', 330, 434, 45, 330)}</g>
        <g class="s3-benefit-families">${stickFigure(748, 363, .78)}${stickFigure(806, 367, .46)}${stickFigure(863, 363, .75)}${label('FAMILIES', 805, 434, 45, 330)}</g>
        <g class="s3-benefit-museums"><path class="s3-draw" d="M1200 297L1270 253 1340 297ZM1196 308L1345 308M1206 375L1333 375M1197 385L1343 385M1217 313L1217 367M1244 313L1244 367M1271 313L1271 367M1298 313L1298 367M1325 313L1325 367"/>${label('MUSEUMS', 1270, 434, 45, 340)}</g>
        <g class="s3-benefit-links" stroke-width="1.5"><path class="s3-draw" d="M387 466Q490 549 637 553M625 547L640 553 625 558M805 461L805 506M797 495L805 509 812 495M1215 466Q1108 549 974 553M985 546L972 553 986 559"/></g>
        ${room(660, 510, .65)}${label('MORE WAYS TO EXPERIENCE AN IDEA', 800, 785, 53, 1400)}
      </g>
      <g class="s3-finale">
        ${stickFigure(830, 641, 1, 's3-stepper')}
      </g>
    </g>
    <g class="s3-folio" fill="#65675d" font-family="Manrope,sans-serif" font-size="11" letter-spacing="3">
      <path d="M100 118H1500" stroke="#777c6a" stroke-width=".7" opacity=".26"/>
    </g>
  </svg>`
  return root
}
