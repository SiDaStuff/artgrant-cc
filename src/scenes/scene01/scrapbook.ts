let labelId = 0
export function paperTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(512, 512)
  let seed = 2701
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = 220 + random() * 35
    pixels.data[i] = value
    pixels.data[i + 1] = value
    pixels.data[i + 2] = value - 4
    pixels.data[i + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  context.strokeStyle = '#82796220'
  context.lineWidth = .45
  for (let i = 0; i < 1700; i++) {
    const x = random() * 512, y = random() * 512
    context.beginPath(); context.moveTo(x, y)
    context.quadraticCurveTo(x + random() * 6, y - random() * 3, x + random() * 12, y + random() * 5)
    context.stroke()
  }
  return canvas.toDataURL()
}
function label(text: string, x: number, y: number, width: number, extra = '') {
  const id = `writing-${++labelId}`
  return `<g class="written ${extra}" transform="translate(${x} ${y})"><defs><clipPath id="${id}"><rect class="writing-mask" x="-6" y="-38" width="0" height="62" data-width="${width}"/></clipPath></defs><text clip-path="url(#${id})" class="hand" transform="rotate(-2)">${text}</text></g>`
}

export function createScrapbook() {
  const root = document.createElement('div')
  root.className = 'scrapbook'
  root.innerHTML = `<svg class="paper-world" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="An ink sketch of a museum visit becoming an immersive room">
    <defs>
      <pattern id="paper-grain" width="400" height="400" patternUnits="userSpaceOnUse"><image href="${paperTexture()}" width="400" height="400"/></pattern>
      <radialGradient id="paper-shade" cx=".45" cy=".42" r=".76"><stop stop-color="#f7f4ec"/><stop offset="1" stop-color="#e9e4d8"/></radialGradient>
      <mask id="portal-paper"><rect width="1600" height="900" fill="white"/><rect class="portal-hole" x="1080" y="310" width="220" height="330" fill="black" opacity="0"/></mask>
    </defs>
    <g mask="url(#portal-paper)">
      <rect width="1600" height="900" fill="url(#paper-shade)"/>
      <rect class="paper-grain" width="1600" height="900" fill="url(#paper-grain)" opacity=".26" style="mix-blend-mode:multiply"/>
      <g class="folio" fill="#65675d" font-family="Manrope, sans-serif" font-size="11" letter-spacing="3">
        <path d="M100 118H1500" stroke="#777c6a" stroke-width=".7" opacity=".26"/>
      </g>
      <g class="opening-note"><text x="100" y="731" fill="#3a4037" font-family="Georgia,serif" font-size="35" font-style="italic" letter-spacing="-.8">The idea begins.</text><path d="M100 755 Q167 752 226 756" stroke="#697463" stroke-width="1" opacity=".5"/></g>
      <g class="ink" stroke="#292e29" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <g class="exhibit">
          <path class="draw" d="M633 402L787 399 804 418 804 532 632 535Z"/>
          <path class="draw" d="M633 402L650 418 804 418M650 418L650 533M634 535L634 552 805 550 804 532M656 554L650 638M784 551L791 638M638 640Q721 636 803 640"/>
          <path class="draw" stroke-width="1.5" d="M676 496L682 456 699 449 715 466 734 452 762 496ZM676 496L762 496M716 465L716 495M698 450L704 477 682 456"/>
          <path class="draw" stroke-width="1.1" opacity=".4" d="M665 430L674 440M670 428L683 441M788 474L788 514M643 568L640 611M797 574L800 611"/>
          ${label('Museum exhibit', 633, 691, 210)}
        </g>
        <g class="figure-position" transform="translate(488 640)"><g class="figure-pose">
          <ellipse class="figure-shadow" cx="0" cy="4" rx="33" ry="3" fill="#343a30" stroke="none" opacity=".08"/>
          <g class="figure-ink" stroke-width="3.3">
            <path class="draw figure-head" d="M-16-126C-17-152 18-154 20-128C23-101-14-100-16-126Z"/>
            <path class="draw" d="M1-106Q-2-81 0-54"/>
            <path class="draw arm-left" d="M0-96L-17-76-13-56"/>
            <path class="draw arm-right" d="M1-95L17-76 23-91"/>
            <path class="draw leg-left" d="M0-54L-11-28-17 0-25 0"/>
            <path class="draw leg-right" d="M0-54L11-28 19 0 27 0"/>
          </g>
        </g></g>
        <path class="ground draw" stroke-width="1" opacity=".35" d="M426 645Q512 642 564 645M615 645Q735 642 826 645"/>
        <g class="question" transform="translate(493 412)"><path class="draw" stroke-width="2.7" d="M-9-10C-14-34 24-34 24-13C24-1 6 1 7 15M7 27L7 29"/></g>
        <g class="idea idea-projection" transform="translate(426 270) rotate(-7)">
          <path class="draw" d="M-36-18L26-19 30 18-35 19ZM29-9L43-16 44 15 30 9M-19 20L-24 30M12 19L17 29M-23-8L-12-8"/>
          <circle class="draw" cx="10" cy="0" r="8"/><path class="draw" opacity=".3" stroke-width="1.2" d="M49-17L119-45M49 17L119 44M52 0L115 0"/>
          ${label('Projection', -40, 72, 150)}
        </g>
        <g class="idea idea-sound" transform="translate(780 248) rotate(4)">
          <path class="draw" d="M-21-37L20-38 22 34-22 36Z"/><circle class="draw" cx="0" cy="-20" r="7"/><circle class="draw" cx="0" cy="12" r="14"/>
          <path class="draw" stroke-width="1.6" d="M35-15Q51 0 35 16M45-24Q70 0 45 25"/>
          ${label('Sound', -31, 78, 110)}
        </g>
        <g class="idea idea-light" transform="translate(996 241) rotate(-3)">
          <path class="draw" d="M-14-22Q-18-48 3-48Q27-47 22-22L14-9-6-9ZM-4-3L12-3M-2 3L10 3M-31-44L-39-49M33-43L43-49M3-59L4-70"/>
          <path class="draw" opacity=".35" stroke-width="1.2" d="M-12 20L-36 65M21 20L46 65M4 22L4 56"/>
          ${label('Light', -24, 105, 100)}
        </g>
        <g class="idea idea-motion" transform="translate(285 440)">
          <path class="draw" stroke-width="1.4" d="M-19-8Q-3-36 22-25M-26 8Q-10-8 4-4M-13 23Q7 13 29 21M18-34L24-25 12-21"/>
          <circle class="draw" cx="33" cy="-5" r="3"/><circle class="draw" cx="-28" cy="-26" r="2"/><circle class="draw" cx="8" cy="36" r="2.5"/>
          ${label('Motion', -41, 85, 120)}
        </g>
        <g class="room-sketch">
          <g class="door-drawing">
            <path class="draw" stroke-width="3" d="M1078 642L1079 309 1301 309 1302 642"/>
            <path class="draw" stroke-width="1.6" d="M1069 642L1068 298 1313 297 1313 643M1081 310L1091 320M1301 310L1290 320M1054 645L1327 644"/>
          </g>
          <g class="room-detail" stroke-width="1.3" opacity=".65">
            <path class="draw" d="M1081 311L1137 363 1247 363 1299 311M1137 363L1137 571 1247 571 1247 363M1081 640L1137 571M1299 640L1247 571M1137 384L1247 384"/>
            <path class="draw" stroke-dasharray="3 8" d="M1093 409L1127 432M1290 410L1257 433M1150 550Q1184 527 1237 547M1151 539Q1196 513 1236 534"/>
            <path class="draw" opacity=".6" d="M1148 374L1156 375M1226 374L1235 375M1107 597L1107 616M1275 598L1275 614"/>
          </g>
        </g>
        <g class="annotation note-visuals">
          ${label('Floor-to-ceiling visuals', 1147, 216, 310)}
          <path class="draw" stroke-width="1.3" d="M1242 238Q1269 259 1251 291M1248 282L1250 293 1258 287"/>
        </g>
        <g class="annotation note-sound">
          ${label('Surround sound', 1333, 433, 235)}
          <path class="draw" stroke-width="1.3" d="M1370 449Q1355 480 1325 481M1332 475L1322 481 1332 486"/>
        </g>
        <g class="annotation note-light">
          ${label('Immersive lighting', 1091, 720, 265)}
          <path class="draw" stroke-width="1.3" d="M1244 682Q1244 664 1252 650M1245 654L1252 647 1255 657"/>
        </g>
      </g>
    </g>
  </svg>`
  return root
}
