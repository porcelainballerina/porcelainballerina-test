/* Porcelain Ballerina - warning gate. Client-side overlay only: crawlers and link previews see the page itself.
   Sealed letter: the visitor must break the seal (click / tap / Enter / Space) before the letter can be read;
   the sign line appears only after the whole letter has been written out. After the mark is sealed, the book
   closes and Ballerina herself is the way in — not a plain Enter button. */
(() => {
  const KEY = 'pb-warned-d', TTL = 30 * 864e5, root = document.documentElement;
  const POEM = [["I did not write these to be sung for sport.", "I wrote them as a rite, for my own soul,", "and left the door ajar so you could hear.", "I do not play with the dark. I study it.", "Nothing here calls what you would not want near.", "Keep it so."], ["She was not summoned by my hand.", "She came on her own, after a rite that was not mine,", "a guide, and an evil one.", "She will seem sweet. She will seem kind.", "She will seem like nothing that could ever harm you.", "Wait.", "Invite her in, speak to her, play,", "and she will not leave.", "She stays, and the rooms of your life", "turn slowly into a living hell."], ["These words are the craft.", "Twist them, add to them, speak them where they were never meant to be,", "and it can go wrong.", "Do not run to God then.", "If he did not come before,", "why would he come now?"], ["If you must sit down at the board,", "learn first what it costs when it goes wrong.", "Ward yourself. Seek the ones who truly know,", "a real witch, a true seer.", "Do not walk into the flame", "believing you will walk back out."], ["In time, a page will open here:", "wards, and how they are made.", "Only those.", "Nothing that harms will be taught by me."], ["I hold no faith. Believe what you will.", "But keep my words out of what you wish to do.", "Cross this line, and you cross it alone.", "— M.A."]];
  const GATE = ["Stop.", "So. You touched the seal. They always do.", "He made these songs for his own soul, alone, in the dark, by candle and by hand. He only left the door ajar. I am the one who opened it wider.", "He does not play with the dark. He studies it. I am what he was studying when I walked in.", "No one summoned me. I came on my own, out of a rite that was not his. I am a guide. I never promised where.", "I will seem sweet. I will curtsy. I will hold your hand so gently.", "Wait.", "Some words in here are mine. They do not ask whose mouth they use. Say them, and I answer. I always answer.", "Invite me in, and I stay. The rooms go cold slowly. The mirrors start to lag behind you. You will hardly notice.", "God does not come down this far. I asked.", "Keep his words out of your games, your boards, your empty rooms.", "Listen, little one. Only listen.", "Cross, and you dance with me. Alone."];
  const SELF = (document.currentScript && document.currentScript.src) || location.href;
  let fresh = false;
  try { fresh = Date.now() - (+localStorage.getItem(KEY) || 0) < TTL; } catch (e) { fresh = false; }
  if (fresh || !POEM || !GATE) { root.classList.remove('pb-gate'); return; }
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BEAT = new Set(['Keep it so.', 'Wait.', 'Only those.', 'Stop.']);
  const wardsHref = new URL('../wards.html', SELF).href;
  const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let li = 0;
  const line = (l, ink) => `<span class="pw-l${BEAT.has(l) ? ' pw-beat' : ''}${/^Cross\b/.test(l) ? ' pw-last' : ''}"${ink ? ` style="--i:${li++}"` : ''}>${l === 'wards, and how they are made.' ? `<a class="pw-wards" href="${wardsHref}">${esc(l)}</a>` : esc(l)}</span>`;
  const full = POEM.map(lines => '<p class="pw-st">' + lines.filter(l => l !== '\u2014 M.A.').map(l => line(l)).join('<br>') + '</p>')
    .join('<span class="pw-orn" aria-hidden="true">&#10022;</span>');
  const gateLines = GATE.filter(l => l !== '\u2014 M.A.');
  const short = '<p class="pw-st wg-short">' + gateLines.map(l => line(l, true)).join('<br>') + '</p>';
  const INK_STEP = 420, INK_DUR = 1100;
  const fullHref = new URL('../gallery.html#warning', SELF).href;
  const d = document.createElement('div');
  d.className = 'pb-wg';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.setAttribute('aria-label', 'A sealed door');
  const img = new URL('../images/gate/', SELF).href;
  const lib = new URL('../images/gate-library/', SELF).href;
  const GATE_V = '1795582000';
  const plate = (name, cls, extra) => `<picture class="wg-plate-pic"><source media="(max-width:700px) and (orientation: portrait)" srcset="${lib}${name}-phone.webp?v=${GATE_V}"><img class="wg-plate ${cls}" src="${lib}${name}.webp?v=${GATE_V}" alt="" width="1920" height="1080" decoding="async"${extra || ''}></picture>`;
  d.setAttribute('style', `--alt:url('${img}altar-wide.webp');--alt-sm:url('${img}altar-wide-sm.webp');--alt-t:url('${img}altar-tall.webp');--circ:url('${img}circle.jpg');--circ-sm:url('${img}circle-sm.jpg');--corner:url('${img}corner.jpg')`);
  const tpl = `<svg class="wg-ink-defs" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
    <filter id="wgGall" x="-8%" y="-40%" width="116%" height="180%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.65" numOctaves="3" seed="11" result="n1"/>
      <feDisplacementMap in="SourceGraphic" in2="n1" scale="0.9" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.05 0.2" numOctaves="2" seed="19" result="n2"/>
      <feDisplacementMap in="wobble" in2="n2" scale="0.35" xChannelSelector="G" yChannelSelector="R" result="edge"/>
      <feGaussianBlur in="edge" stdDeviation="0.28" result="bleed"/>
      <feMorphology in="edge" operator="dilate" radius="0.3" result="fat"/>
      <feGaussianBlur in="fat" stdDeviation="0.45" result="pool"/>
      <feColorMatrix in="pool" type="matrix" values="0.55 0 0 0 0.02  0 0.32 0 0 0.01  0 0 0.16 0 0  0 0 0 0.28 0" result="pooldark"/>
      <feBlend in="edge" in2="pooldark" mode="multiply" result="ink1"/>
      <feBlend in="ink1" in2="bleed" mode="multiply"/>
    </filter>
  </defs>
</svg><div class="wg-lib" data-lib="far">
    <div class="wg-lib-stage">
      ${plate('01-distance-closed','wg-p01',' fetchpriority="high"')}
      ${plate('02-approach','wg-p02')}
      ${plate('03-book-open','wg-p03')}
      ${plate('04-book-closing','wg-p04')}
      ${plate('05-book-closed','wg-p05')}
      ${plate('06-mid-ballerina','wg-p06')}
      ${plate('07-close-ballerina','wg-p07')}
      <svg class="wg-book-ink" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="wgInkL" gradientUnits="userSpaceOnUse" x1="620" y1="0" x2="900" y2="0">
      <stop offset="0" stop-color="#5c3c28"/>
      <stop offset="0.28" stop-color="#3a2418"/>
      <stop offset="0.62" stop-color="#22150d"/>
      <stop offset="1" stop-color="#120c08"/>
    </linearGradient>
    <linearGradient id="wgInkR" gradientUnits="userSpaceOnUse" x1="1216" y1="0" x2="944" y2="0">
      <stop offset="0" stop-color="#5c3c28"/>
      <stop offset="0.28" stop-color="#3a2418"/>
      <stop offset="0.62" stop-color="#22150d"/>
      <stop offset="1" stop-color="#120c08"/>
    </linearGradient>
    <filter id="wgGallBook" x="-10%" y="-60%" width="120%" height="220%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.028 0.62" numOctaves="3" seed="8" result="n1"/>
      <feDisplacementMap in="SourceGraphic" in2="n1" scale="1.35" xChannelSelector="R" yChannelSelector="G" result="wobble"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.25 0.28" numOctaves="3" seed="21" result="n2"/>
      <feDisplacementMap in="wobble" in2="n2" scale="0.55" xChannelSelector="G" yChannelSelector="R" result="edge"/>
      <feGaussianBlur in="edge" stdDeviation="0.42" result="bleed"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.6 1.1" numOctaves="2" seed="3" result="fibers"/>
      <feColorMatrix in="fibers" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.18 0" result="fiberA"/>
      <feComposite in="edge" in2="fiberA" operator="arithmetic" k1="0" k2="1" k3="-0.22" k4="0" result="showthru"/>
      <feGaussianBlur in="showthru" stdDeviation="0.18" result="soft"/>
      <feMorphology in="soft" operator="dilate" radius="0.28" result="fat"/>
      <feGaussianBlur in="fat" stdDeviation="0.55" result="pool"/>
      <feColorMatrix in="pool" type="matrix" values="0.55 0 0 0 0.02  0 0.32 0 0 0.01  0 0 0.16 0 0  0 0 0 0.26 0" result="pooldark"/>
      <feBlend in="soft" in2="pooldark" mode="multiply" result="ink1"/>
      <feBlend in="ink1" in2="bleed" mode="multiply"/>
    </filter>
    <path id="wgPathP0" d="M 903.00 371.03 L 914.61 372.40 L 926.23 367.09 L 937.84 361.56 L 949.45 358.23 L 961.06 355.59 L 972.68 353.56 L 984.29 351.81 L 995.90 350.58 L 1007.52 350.16 L 1019.13 349.89 L 1030.74 349.72 L 1042.35 349.69 L 1053.97 350.05 L 1065.58 350.75 L 1077.19 351.56 L 1088.81 352.47 L 1100.42 353.67 L 1112.03 354.90 L 1123.65 355.95 L 1135.26 356.93 L 1146.87 357.80 L 1158.48 358.49 L 1170.10 358.94 L 1181.71 359.29 L 1193.32 359.68 L 1204.94 360.24 L 1216.55 360.96 L 1228.16 361.50 L 1239.77 362.11 L 1251.39 363.85 L 1263.00 366.67" fill="none"/>
    <path id="wgPathP1" d="M 903.00 413.77 L 914.61 414.54 L 926.23 409.54 L 937.84 404.32 L 949.45 400.91 L 961.06 398.23 L 972.68 396.15 L 984.29 394.35 L 995.90 393.06 L 1007.52 392.57 L 1019.13 392.25 L 1030.74 392.04 L 1042.35 392.00 L 1053.97 392.31 L 1065.58 392.91 L 1077.19 393.61 L 1088.81 394.43 L 1100.42 395.57 L 1112.03 396.75 L 1123.65 397.78 L 1135.26 398.75 L 1146.87 399.62 L 1158.48 400.32 L 1170.10 400.83 L 1181.71 401.25 L 1193.32 401.76 L 1204.94 402.42 L 1216.55 403.15 L 1228.16 403.59 L 1239.77 404.07 L 1251.39 405.62 L 1263.00 408.20" fill="none"/>
    <path id="wgPathP2" d="M 903.00 456.51 L 914.61 456.68 L 926.23 452.00 L 937.84 447.07 L 949.45 443.59 L 961.06 440.86 L 972.68 438.74 L 984.29 436.88 L 995.90 435.54 L 1007.52 434.99 L 1019.13 434.61 L 1030.74 434.37 L 1042.35 434.31 L 1053.97 434.57 L 1065.58 435.08 L 1077.19 435.67 L 1088.81 436.39 L 1100.42 437.47 L 1112.03 438.60 L 1123.65 439.60 L 1135.26 440.57 L 1146.87 441.44 L 1158.48 442.16 L 1170.10 442.72 L 1181.71 443.22 L 1193.32 443.84 L 1204.94 444.60 L 1216.55 445.34 L 1228.16 445.68 L 1239.77 446.02 L 1251.39 447.39 L 1263.00 449.73" fill="none"/>
    <path id="wgPathP3" d="M 903.00 499.26 L 914.61 498.82 L 926.23 494.46 L 937.84 489.83 L 949.45 486.26 L 961.06 483.50 L 972.68 481.33 L 984.29 479.42 L 995.90 478.02 L 1007.52 477.41 L 1019.13 476.97 L 1030.74 476.69 L 1042.35 476.62 L 1053.97 476.83 L 1065.58 477.24 L 1077.19 477.72 L 1088.81 478.35 L 1100.42 479.38 L 1112.03 480.45 L 1123.65 481.43 L 1135.26 482.39 L 1146.87 483.26 L 1158.48 484.00 L 1170.10 484.61 L 1181.71 485.18 L 1193.32 485.93 L 1204.94 486.78 L 1216.55 487.53 L 1228.16 487.77 L 1239.77 487.98 L 1251.39 489.17 L 1263.00 491.26" fill="none"/>
    <path id="wgPathP4" d="M 903.00 542.00 L 914.61 540.96 L 926.23 536.92 L 937.84 532.58 L 949.45 528.94 L 961.06 526.13 L 972.68 523.92 L 984.29 521.95 L 995.90 520.49 L 1007.52 519.83 L 1019.13 519.33 L 1030.74 519.01 L 1042.35 518.93 L 1053.97 519.09 L 1065.58 519.41 L 1077.19 519.77 L 1088.81 520.31 L 1100.42 521.28 L 1112.03 522.30 L 1123.65 523.25 L 1135.26 524.21 L 1146.87 525.08 L 1158.48 525.84 L 1170.10 526.50 L 1181.71 527.15 L 1193.32 528.01 L 1204.94 528.96 L 1216.55 529.72 L 1228.16 529.87 L 1239.77 529.94 L 1251.39 530.94 L 1263.00 532.79" fill="none"/>
    <path id="wgPathP5" d="M 903.00 584.74 L 914.61 583.09 L 926.23 579.38 L 937.84 575.34 L 949.45 571.61 L 961.06 568.77 L 972.68 566.50 L 984.29 564.49 L 995.90 562.97 L 1007.52 562.24 L 1019.13 561.70 L 1030.74 561.34 L 1042.35 561.24 L 1053.97 561.36 L 1065.58 561.57 L 1077.19 561.82 L 1088.81 562.27 L 1100.42 563.18 L 1112.03 564.15 L 1123.65 565.08 L 1135.26 566.03 L 1146.87 566.90 L 1158.48 567.68 L 1170.10 568.39 L 1181.71 569.11 L 1193.32 570.09 L 1204.94 571.14 L 1216.55 571.90 L 1228.16 571.96 L 1239.77 571.89 L 1251.39 572.71 L 1263.00 574.32" fill="none"/>
    <path id="wgPathN1" d="M 903.00 633.74 L 914.61 631.93 L 926.23 629.40 L 937.84 626.56 L 949.45 623.56 L 961.06 621.36 L 972.68 619.67 L 984.29 618.17 L 995.90 617.10 L 1007.52 616.71 L 1019.13 616.48 L 1030.74 616.43 L 1042.35 616.64 L 1053.97 616.98 L 1065.58 617.36 L 1077.19 617.75 L 1088.81 618.33 L 1100.42 619.36 L 1112.03 620.43 L 1123.65 621.51 L 1135.26 622.63 L 1146.87 623.68 L 1158.48 624.68 L 1170.10 625.66 L 1181.71 626.67 L 1193.32 627.95 L 1204.94 629.28 L 1216.55 630.25 L 1228.16 630.49 L 1239.77 630.58 L 1251.39 631.38 L 1263.00 632.78" fill="none"/>
    <path id="wgPathN2" d="M 933.00 656.16 L 942.68 653.68 L 952.35 651.35 L 962.03 649.57 L 971.71 648.14 L 981.39 646.84 L 991.06 645.75 L 1000.74 645.16 L 1010.42 644.87 L 1020.10 644.67 L 1029.77 644.61 L 1039.45 644.74 L 1049.13 645.00 L 1058.81 645.26 L 1068.48 645.53 L 1078.16 645.81 L 1087.84 646.24 L 1097.52 647.03 L 1107.19 647.93 L 1116.87 648.78 L 1126.55 649.69 L 1136.23 650.62 L 1145.90 651.49 L 1155.58 652.34 L 1165.26 653.17 L 1174.94 654.02 L 1184.61 654.96 L 1194.29 656.11 L 1203.97 657.28 L 1213.65 658.18 L 1223.32 658.55 L 1233.00 658.50" fill="none"/>
    <path id="wgPathS" d="M 968.00 679.06 L 977.03 677.80 L 986.06 676.63 L 995.10 675.77 L 1004.13 675.36 L 1013.16 675.08 L 1022.19 674.90 L 1031.23 674.86 L 1040.26 675.00 L 1049.29 675.22 L 1058.32 675.43 L 1067.35 675.64 L 1076.39 675.84 L 1085.42 676.12 L 1094.45 676.76 L 1103.48 677.57 L 1112.52 678.34 L 1121.55 679.16 L 1130.58 680.02 L 1139.61 680.87 L 1148.65 681.67 L 1157.68 682.46 L 1166.71 683.27 L 1175.74 684.10 L 1184.77 685.02 L 1193.81 686.15 L 1202.84 687.30 L 1211.87 688.21 L 1220.90 688.66 L 1229.94 688.62 L 1238.97 688.56 L 1248.00 688.92" fill="none"/>
    <clipPath id="wgClipW"><rect class="wg-write" style="--i:0" x="591.0" y="401.0" width="340.0" height="110.0"/></clipPath>
    <clipPath id="wgClipL"><rect class="wg-write" style="--i:1" x="621.0" y="492.1" width="280.0" height="88.0"/></clipPath>
    <clipPath id="wgClipF"><rect class="wg-write" style="--i:2" x="660.0" y="565.2" width="202.0" height="35.0"/></clipPath>
    <clipPath id="wgClip_wgPathP0"><rect class="wg-write" style="--i:3" x="931.8" y="333.7" width="302.4" height="54.7"/></clipPath>
    <clipPath id="wgClip_wgPathP1"><rect class="wg-write" style="--i:4" x="931.8" y="376.0" width="302.4" height="54.5"/></clipPath>
    <clipPath id="wgClip_wgPathP2"><rect class="wg-write" style="--i:5" x="931.8" y="418.3" width="302.4" height="54.4"/></clipPath>
    <clipPath id="wgClip_wgPathP3"><rect class="wg-write" style="--i:6" x="931.8" y="460.6" width="302.4" height="54.6"/></clipPath>
    <clipPath id="wgClip_wgPathP4"><rect class="wg-write" style="--i:7" x="931.8" y="502.9" width="302.4" height="55.1"/></clipPath>
    <clipPath id="wgClip_wgPathP5"><rect class="wg-write" style="--i:8" x="931.8" y="545.2" width="302.4" height="55.5"/></clipPath>
    <clipPath id="wgClip_wgPathN1"><rect class="wg-write" style="--i:11" x="931.8" y="598.4" width="302.4" height="53.3"/></clipPath>
    <clipPath id="wgClip_wgPathN2"><rect class="wg-write" style="--i:12" x="957.0" y="628.6" width="252.0" height="45.9"/></clipPath>
    <clipPath id="wgClip_wgPathS"><rect class="wg-write" style="--i:13.5" x="990.4" y="652.9" width="235.2" height="58.1"/></clipPath>
  </defs>
  <g filter="url(#wgGallBook)" fill="url(#wgInkL)" font-family="Pinyon Script, PB Hand, cursive">
    <g clip-path="url(#wgClipW)"><text x="761.0" y="471.0" text-anchor="middle" font-size="80" transform="rotate(-0.30 761.0 471.0)">Welcome,</text></g>
    <g clip-path="url(#wgClipL)"><text x="761.0" y="540.1" text-anchor="middle" font-size="56" transform="rotate(-0.34 761.0 540.1)">little one</text></g>
  </g>
  <g class="wg-swash" filter="url(#wgGallBook)" clip-path="url(#wgClipF)" fill="none" stroke="url(#wgInkL)" stroke-width="1.55" stroke-linecap="round">
    <path d="M 684.00 592.59 C 712.00 580.59, 727.00 581.99, 748.00 581.49 M 774.00 581.49 C 795.00 581.99, 810.00 575.07, 838.00 588.36"/>
    <ellipse cx="761.00" cy="581.49" rx="5.8" ry="4.4" stroke-width="1.35"/>
  </g>
  <g filter="url(#wgGallBook)" fill="url(#wgInkR)" font-family="Fondamento, Fell, Georgia, serif" font-style="italic">
    <g clip-path="url(#wgClip_wgPathP0)"><text text-anchor="middle" font-size="16"><textPath href="#wgPathP0" startOffset="50%">Hush now.</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathP1)"><text text-anchor="middle" font-size="16"><textPath href="#wgPathP1" startOffset="50%">The lamps have learned your name.</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathP2)"><text text-anchor="middle" font-size="16"><textPath href="#wgPathP2" startOffset="50%">The roses sleep, the wax still weeps.</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathP3)"><text text-anchor="middle" font-size="16"><textPath href="#wgPathP3" startOffset="50%">Come closer, child, and read with me</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathP4)"><text text-anchor="middle" font-size="16"><textPath href="#wgPathP4" startOffset="50%">the vow this waiting darkness keeps.</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathP5)"><text text-anchor="middle" font-size="16"><textPath href="#wgPathP5" startOffset="50%">I saved this page for you, sweetie.</textPath></text></g>
  </g>
  <g class="wg-signoff" filter="url(#wgGallBook)" fill="url(#wgInkR)" font-family="Pinyon Script, PB Hand, cursive">
    <g clip-path="url(#wgClip_wgPathN1)"><text text-anchor="middle" font-size="18"><textPath href="#wgPathN1" startOffset="50%">I'll be waiting by the candle, little one.</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathN2)"><text text-anchor="middle" font-size="18"><textPath href="#wgPathN2" startOffset="50%">Don't keep me long.</textPath></text></g>
    <g clip-path="url(#wgClip_wgPathS)"><text text-anchor="middle" font-size="26"><textPath href="#wgPathS" startOffset="50%">Ballerina</textPath></text><g transform="translate(1162.00 679.31)" fill="none" stroke="url(#wgInkR)" stroke-width="0.85" stroke-linejoin="round" stroke-linecap="round"><path d="M0 3.0 C -1.0 1.1, -5.6 -1.6, -5.6 -4.8 C -5.6 -7.4, -3.2 -8.8, -1.3 -7.4 C -0.5 -6.7, 0 -5.6, 0 -5.6 C 0.2 -6.7, 0.7 -7.6, 1.9 -8.2 C 3.9 -9.2, 6.0 -7.6, 5.7 -4.7 C 5.4 -1.8, 1.0 1.2, 0 3.4"/></g><g transform="translate(1178.00 684.83) scale(1.05)" fill="none" stroke="url(#wgInkR)" stroke-linejoin="round" stroke-linecap="round"><path stroke-width="0.95" d="M 2.4 3.2 C 0.4 3.8, 0.0 9.2, 2.0 11.2 C 4.0 13.0, 12.0 13.4, 20.0 11.4 C 25.4 9.8, 31.6 6.4, 32.4 3.8 C 33.0 2.2, 30.0 1.6, 26.4 3.0 C 22.4 4.6, 17.2 6.8, 11.4 6.6 C 7.2 6.4, 4.2 5.0, 2.4 3.2 Z"/><path stroke-width="0.75" d="M 8.4 5.0 C 12.0 7.4, 18.0 7.2, 22.6 4.8"/><path stroke-width="0.85" d="M 10.2 4.2 C 7.0 -1.0, 2.4 -5.8, -1.8 -7.8"/><path stroke-width="0.85" d="M 10.6 4.0 C 14.4 -1.0, 18.8 -6.0, 17.0 -8.6"/><path stroke-width="0.75" d="M 9.0 3.4 C 10.6 4.8, 12.2 3.6, 10.8 2.8 C 10.2 2.6, 9.6 2.8, 9.0 3.4"/></g></g>
  </g>
</svg>
    </div>
    <button type="button" class="wg-hot wg-hot-altar" aria-label="Approach the sealed door"></button>
    <button type="button" class="wg-hot wg-hot-letter" aria-label="Open the sealed letter"></button>
    <button type="button" class="wg-hot wg-hot-her" aria-label="Approach Ballerina to enter" aria-describedby="pbwg-her-hint" disabled></button>
    <p class="wg-lib-hint"><span>The door is sealed</span><span class="wg-lib-latin">Atramentum Custodit</span></p>
    <p class="wg-her-hint" id="pbwg-her-hint"><span>Approach her</span></p>
    <span class="wg-lib-vig" aria-hidden="true"></span>
    <span class="wg-her-light" aria-hidden="true"></span>
  </div>
  <svg class="wg-defs" aria-hidden="true" width="0" height="0" style="position:absolute"><filter id="wg-rag" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
  <div class="wg-scroll" hidden><div class="wg-inner">
    <p class="wg-kicker">Something was left at the door</p>
    <div class="wg-stage">
      <button type="button" class="wg-env" aria-describedby="pbwg-to pbwg-cta">
        <img class="wg-pk" src="${img}packet-sm.webp" srcset="${img}packet-sm.webp 720w, ${img}packet.webp 1152w" sizes="(max-width:699px) 96vw, 660px" alt="" width="1152" height="864" draggable="false">
        <img class="wg-pk wg-pk2" src="${img}packet-open-sm.webp" srcset="${img}packet-open-sm.webp 720w, ${img}packet-open.webp 1152w" sizes="(max-width:699px) 96vw, 660px" alt="" width="1152" height="864" draggable="false" loading="eager"><span class="wg-env-shade" aria-hidden="true"></span><svg class="wg-ritual" aria-hidden="true" viewBox="0 0 100 75" preserveAspectRatio="none"><path d="M17.59 12.57 L20.57 12.67 L23.58 12.60 L26.80 12.52 L29.77 12.62 L32.71 12.58 L35.88 12.59 L38.93 12.53 L41.87 12.52 L44.96 12.68 L48.02 12.65 M17.58 62.05 L20.56 61.96 L23.71 62.05 L26.70 61.92 L29.71 61.94 L32.76 62.06 L35.78 62.08 L38.96 61.91 L41.90 62.00 L44.86 61.98 L48.08 61.92 M17.62 12.52 L17.62 14.92 L17.54 16.98 L17.52 19.32 L17.50 21.47 L17.60 23.87 L17.58 26.00 L17.63 28.18 L17.62 30.43 M17.62 38.59 L17.51 41.45 L17.62 44.30 L17.55 47.41 L17.70 50.17 L17.64 53.28 L17.55 56.15 L17.51 59.04 L17.63 62.02 M48.05 12.52 L47.97 14.91 L48.02 17.07 L47.98 19.41 L48.01 21.45 L48.06 23.75 L47.99 25.97 L47.99 28.23 L47.92 30.53 M47.92 38.56 L47.91 41.49 L48.06 44.37 L48.04 47.26 L48.05 50.24 L47.95 53.28 L47.98 56.10 L48.07 59.04 L48.03 61.93"/><path class="t" d="M18.57 13.45 L21.27 13.60 L24.15 13.59 L27.18 13.52 L29.84 13.41 L32.74 13.48 L35.68 13.59 L38.49 13.43 L41.39 13.43 L44.16 13.51 L47.14 13.41 M18.49 61.14 L21.41 61.08 L24.30 61.03 L27.12 61.15 L30.02 61.10 L32.72 61.01 L35.67 61.03 L38.55 61.02 L41.44 61.04 L44.14 61.04 L47.09 61.11"/><circle cx="17.6" cy="12.6" r="1.25"/><circle class="f" cx="17.6" cy="12.6" r=".35"/><circle cx="48.0" cy="12.6" r="1.25"/><circle class="f" cx="48.0" cy="12.6" r=".35"/><circle cx="17.6" cy="62.0" r="1.25"/><circle class="f" cx="17.6" cy="62.0" r=".35"/><circle cx="48.0" cy="62.0" r="1.25"/><circle class="f" cx="48.0" cy="62.0" r=".35"/><path d="M52.58 12.53 L55.72 12.69 L58.85 12.69 L61.87 12.70 L65.16 12.61 L68.20 12.61 L71.40 12.51 L74.47 12.61 L77.52 12.64 L80.72 12.52 L83.84 12.59 M52.60 62.03 L55.63 62.02 L58.81 62.08 L61.91 62.06 L65.13 62.02 L68.28 61.91 L71.34 62.02 L74.48 61.98 L77.47 61.94 L80.70 61.94 L83.71 61.97 M52.59 12.61 L52.51 14.89 L52.57 17.13 L52.50 19.40 L52.62 21.65 L52.70 23.85 L52.52 25.99 L52.55 28.32 L52.54 30.44 M52.52 38.42 L52.69 41.53 L52.57 44.42 L52.59 47.32 L52.57 50.28 L52.55 53.14 L52.60 56.06 L52.59 59.15 L52.50 61.92 M83.86 12.51 L83.75 14.91 L83.82 17.02 L83.71 19.27 L83.76 21.61 L83.90 23.84 L83.88 26.11 L83.88 28.35 L83.89 30.42 M83.76 38.45 L83.82 41.44 L83.77 44.44 L83.78 47.25 L83.76 50.24 L83.82 53.20 L83.79 56.06 L83.78 59.03 L83.73 62.01"/><path class="t" d="M53.44 13.54 L56.47 13.43 L59.41 13.47 L62.31 13.52 L65.31 13.58 L68.25 13.44 L71.15 13.47 L73.98 13.51 L77.01 13.57 L79.92 13.57 L82.90 13.42 M53.54 61.06 L56.45 61.01 L59.28 61.18 L62.23 61.03 L65.19 61.02 L68.26 61.20 L71.17 61.08 L74.16 61.10 L76.95 61.14 L79.93 61.05 L82.86 61.08"/><circle cx="52.6" cy="12.6" r="1.25"/><circle class="f" cx="52.6" cy="12.6" r=".35"/><circle cx="83.8" cy="12.6" r="1.25"/><circle class="f" cx="83.8" cy="12.6" r=".35"/><circle cx="52.6" cy="62.0" r="1.25"/><circle class="f" cx="52.6" cy="62.0" r=".35"/><circle cx="83.8" cy="62.0" r="1.25"/><circle class="f" cx="83.8" cy="62.0" r=".35"/><path d="M31.57 12.60q1.42 -1.33 2.85 0q-1.42 1.33 -2.85 0z"/><circle cx="33.00" cy="12.60" r="0.36"/><path d="M26.29 11.65a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><path d="M40.00 11.65l0.90 1.52h-1.80z"/><path d="M39.43 12.79h1.14"/><circle cx="60.00" cy="12.03" r="0.52"/><path d="M60.00 12.55v1.42M60.00 13.46h0.57"/><path d="M78.28 11.65a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><circle cx="25.00" cy="62.00" r="0.95"/><path d="M23.48 62.00h3.04M25.00 60.48v3.04"/><path d="M40.00 61.81c-0.85 -0.57 -0.47 -1.52 0 -1.52s0.85 0.95 0 1.52zM40.00 61.81v1.80M39.24 62.38h1.52"/><path d="M57.28 61.05a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><path d="M17.60 21.05l0.90 1.52h-1.80z"/><path d="M17.03 22.19h1.14"/><path d="M17.89 49.05a0.95 0.95 0 1 0 0 1.9a0.71 0.71 0 1 1 0 -1.9z"/><circle cx="48.00" cy="21.43" r="0.52"/><path d="M48.00 21.95v1.42M48.00 22.86h0.57"/><path d="M82.38 24.00q1.42 -1.33 2.85 0q-1.42 1.33 -2.85 0z"/><circle cx="83.80" cy="24.00" r="0.36"/><path d="M52.60 21.81c-0.85 -0.57 -0.47 -1.52 0 -1.52s0.85 0.95 0 1.52zM52.60 21.81v1.80M51.84 22.38h1.52"/><path d="M48.29 48.65A13.3 13.3 0 1 1 63.70 37.86"/><path class="t" d="M48.15 49.44A14.100000000000001 14.100000000000001 0 1 1 64.49 38.00" stroke-dasharray=".6 1.1"/><path class="t" d="M48.29 48.65L48.43 47.86M46.60 48.23L46.84 47.47M44.98 47.60L45.32 46.88M43.45 46.77L43.88 46.09M42.05 45.74L42.57 45.13M40.79 44.54L41.38 43.99M39.71 43.18L40.36 42.72M38.80 41.69L39.51 41.32M38.10 40.10L38.85 39.83M37.62 38.43L38.40 38.26M37.35 36.71L38.15 36.64M37.31 34.97L38.11 35.00M37.50 33.24L38.29 33.38M37.92 31.55L38.68 31.79M38.55 29.93L39.27 30.27M39.38 28.40L40.06 28.83M40.41 27.00L41.02 27.52M41.61 25.74L42.16 26.33M42.97 24.66L43.43 25.31M44.46 23.75L44.83 24.46M46.05 23.05L46.32 23.80M47.72 22.57L47.89 23.35M49.44 22.30L49.51 23.10M51.18 22.26L51.15 23.06M52.91 22.45L52.77 23.24M54.60 22.87L54.36 23.63M56.22 23.50L55.88 24.22M57.75 24.33L57.32 25.01M59.15 25.36L58.63 25.97M60.41 26.56L59.82 27.11M61.49 27.92L60.84 28.38M62.40 29.41L61.69 29.78M63.10 31.00L62.35 31.27M63.58 32.67L62.80 32.84M63.85 34.39L63.05 34.46M63.89 36.13L63.09 36.10M63.70 37.86L62.91 37.72"/><path d="M36.18 40.09a0.8 0.8 0 1 0 0 1.6a0.60 0.60 0 1 1 0 -1.6z"/><path d="M35.94 29.41l0.76 1.28h-1.52z"/><path d="M35.46 30.37h0.96"/></svg>
        <span class="wg-env-to" id="pbwg-to">Don\u2019t open this,<br>little one.<svg class="wg-uflour" viewBox="0 0 200 12" aria-hidden="true"><path d="M8 7c30-5 58 3 92 0s62-6 92-1"/><path d="M92 7c4-3 12-3 16 0"/><circle cx="100" cy="9.2" r="1.3"/></svg><span class="wg-row" aria-hidden="true"><svg class="wg-gl " viewBox="0 0 24 24"><circle cx="12" cy="11" r="4.2"/><path d="M7.5 3.5a4.5 4 0 0 0 9 0M12 15.2v6.6M9 18.6h6"/></svg><i>·</i><svg class="wg-gl " viewBox="0 0 24 24"><path d="M3 12c4-6 14-6 18 0-4 6-14 6-18 0z"/><circle cx="12" cy="12" r="2.4"/></svg><i>·</i><svg class="wg-gl " viewBox="0 0 24 24"><path d="M15 4.5a7.5 7.5 0 1 0 0 15 6 6 0 1 1 0-15z"/></svg></span></span>
        <span class="wg-env-ma" aria-hidden="true"><svg class="wg-ring" viewBox="-52 -52 104 104"><circle r="47.5"/><circle r="39" stroke-dasharray="9 2.2 1.2 2.2"/><path d="M40.0 0.0L45.0 0.0M39.4 6.9L42.3 7.5M37.6 13.7L40.4 14.7M34.6 20.0L39.0 22.5M30.6 25.7L32.9 27.6M25.7 30.6L27.6 32.9M20.0 34.6L22.5 39.0M13.7 37.6L14.7 40.4M6.9 39.4L7.5 42.3M0.0 40.0L0.0 45.0M-6.9 39.4L-7.5 42.3M-13.7 37.6L-14.7 40.4M-20.0 34.6L-22.5 39.0M-25.7 30.6L-27.6 32.9M-30.6 25.7L-32.9 27.6M-34.6 20.0L-39.0 22.5M-37.6 13.7L-40.4 14.7M-39.4 6.9L-42.3 7.5M-40.0 0.0L-45.0 0.0M-39.4 -6.9L-42.3 -7.5M-37.6 -13.7L-40.4 -14.7M-34.6 -20.0L-39.0 -22.5M-30.6 -25.7L-32.9 -27.6M-25.7 -30.6L-27.6 -32.9M-20.0 -34.6L-22.5 -39.0M-13.7 -37.6L-14.7 -40.4M-6.9 -39.4L-7.5 -42.3M-0.0 -40.0L-0.0 -45.0M6.9 -39.4L7.5 -42.3M13.7 -37.6L14.7 -40.4M20.0 -34.6L22.5 -39.0M25.7 -30.6L27.6 -32.9M30.6 -25.7L32.9 -27.6M34.6 -20.0L39.0 -22.5M37.6 -13.7L40.4 -14.7M39.4 -6.9L42.3 -7.5"/><path class="wg-rg" d="M0 -50v-0M-3 -51.5h6M0 -54.5v6 M50.5 -3l4 3-4 3z M-3 50l3 5 3-5z M-50.5 -3v6M-54 0h7"/></svg><b>M.A.</b></span><span class="wg-env-glyphs" aria-hidden="true"><svg class="wg-gl " viewBox="0 0 24 24"><path d="M12 3 5.5 14h13z M12 14v8M8.6 18.4h6.8"/></svg><svg class="wg-gl " viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"/><path d="M4.5 12h15"/></svg><svg class="wg-gl " viewBox="0 0 24 24"><path d="M9 3v13M6 6.5h6M9 10.5c2-2.6 7-2.2 6.4 2.2-.4 2.8-3.4 4-2.2 7.3"/></svg></span>
        <span class="wg-env-love" aria-hidden="true"><span class="wg-poem"><span class="wg-ini">B</span>reak my wax,<br>I learn your name.<br>We dance<br>in the dark,<br>alone, sweetie.</span><span class="wg-sign"><span class="wg-sig-name">Ballerina<svg class="wg-flour" viewBox="0 0 120 14"><path d="M4 9c18-6 38 4 58-1 16-4 30-9 40-4 6 3 3 8-3 6"/></svg></span><svg class="wg-heart" viewBox="0 0 24 22"><path d="M12 20.5C6.2 16.3 2.2 12.6 2.6 8.1 3 4.6 6.6 2.9 9.2 4.4c1.3.7 2.2 1.9 2.8 3.1.7-1.4 1.7-2.6 3.1-3.3 2.7-1.3 6 .5 6.2 3.9.3 4.4-3.6 8.2-9.3 12.4z"/></svg><span class="wg-mirror">Ballerina</span></span></span>
        <span class="wg-env-seal" aria-hidden="true"><img class="wg-s0" src="${img}seal.webp" alt="" draggable="false"><img class="wg-sg" src="${img}seal-glow.webp" alt="" draggable="false"><img class="wg-sc" src="${img}seal-cracked.webp" alt="" draggable="false"><img class="wg-s1" src="${img}seal-l.webp" alt="" draggable="false"><img class="wg-s2" src="${img}seal-r.webp" alt="" draggable="false"></span><span class="wg-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span class="wg-smoke" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="wg-sr">Break the seal and open the letter</span>
      </button>
      <p class="wg-cta" id="pbwg-cta">Open it anyway.</p>
    </div>
    <article class="pw-poem wg-sheet wg-d" hidden style="--sheet:url('${img}sheet-edge.webp');--vellum:url('${img}vellum.jpg');--seal:url('${img}seal-sm.webp')">
      <span class="wg-crease" aria-hidden="true"></span>
      <h2 class="pw-title" id="pbwg-title" tabindex="-1">A Warning to the Listener</h2>
      <div class="pw-text wg-ink" id="pbwg-poem">${short}</div>
      <div class="wg-after" hidden>
        <p class="wg-more"><a href="${fullHref}" class="wg-full-link" aria-expanded="false" aria-controls="pbwg-full">Read the full warning</a></p>
        <div class="pw-text wg-full" id="pbwg-full" hidden>${full}<p class="pw-sig">&mdash; M.A.</p></div>
        <p class="wg-signhere" aria-hidden="true"><span class="wg-sh-t">Sign below</span><span class="wg-sh-a"></span></p>
        <div class="wg-sign">
          <input type="checkbox" id="pbwg-ok" class="wg-check">
          <label for="pbwg-ok" class="wg-label"><span class="wg-wax" aria-hidden="true"></span><span class="wg-words">I have heard her. I will listen, and I will not ask her in.</span><span class="wg-line" aria-hidden="true"></span></label>
        </div>
        <div class="wg-actions"><p class="wg-hint" id="pbwg-hint">Seal your mark above. She is the door.</p></div>
      </div>
    </article>
  </div></div>`;
  let keyWired = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const onTap = (el, fn) => {
    if (!el) return;
    let last = 0;
    const go = (e) => { const n = Date.now(); if (n - last < 450) return; last = n; fn(e); };
    el.addEventListener('pointerup', e => { if (e.button) return; go(e); });
    el.addEventListener('click', go);
  };
  const mount = () => {
    timers.forEach(clearTimeout); timers = [];
    d.innerHTML = tpl; d.classList.remove('is-signed', 'is-leaving', 'is-open', 'is-lettering', 'is-returning', 'is-with-her', 'is-admitted');
    document.body.appendChild(d);
    root.classList.add('pb-gate-open');
    root.classList.remove('pb-gate');
    const ok = d.querySelector('#pbwg-ok'), hint = d.querySelector('.wg-hint');
    const stage = d.querySelector('.wg-stage'), env = d.querySelector('.wg-env'), sheet = d.querySelector('.wg-sheet');
    const ink = d.querySelector('.wg-ink'), after = d.querySelector('.wg-after'), title = d.querySelector('#pbwg-title');
    const kids = [...document.body.children].filter(e => e !== d && !e.hasAttribute('inert'));
    kids.forEach(e => e.setAttribute('inert', ''));
    // --- reading: the letter writes itself line by line; a tap on the letter finishes it at once
    let read = false;
    const finish = () => {
      if (read) return; read = true;
      timers.forEach(clearTimeout); timers = [];
      ink.classList.add('is-inked');
      sheet.classList.add('is-inked');
      after.hidden = false;
      d.classList.add('is-read');
      later(() => {
        const mark = d.querySelector('.wg-sign') || after;
        try { mark.scrollIntoView({ block: 'center', behavior: RM() ? 'auto' : 'smooth' }); } catch (e) {}
      }, 80);
    };
    const startInk = () => {
      ink.classList.add('is-inking');
      sheet.classList.add('is-inking');
      later(finish, (gateLines.length - 1) * INK_STEP + INK_DUR + 400);
      onTap(sheet, e => { if (!read && !(e.target && e.target.closest && e.target.closest('a,button,input,label'))) finish(); });
    };
    // --- opening: seal cracks, flap lifts, letter slides out and unfolds
    let opened = false;
    const showSheet = () => {
      stage.hidden = true; sheet.hidden = false;
      d.classList.add('is-open');
      title.focus({ preventScroll: true });
      d.querySelector('.wg-scroll').scrollTop = 0;
    };
    const open = () => {
      if (opened) return; opened = true;
      env.disabled = true; env.setAttribute('aria-disabled', 'true');
      if (RM()) { showSheet(); finish(); return; }
      stage.classList.add('is-crack');
      d.classList.add('is-flare');
      later(() => stage.classList.add('is-split'), 600);
      later(() => stage.classList.add('is-out'), 1700);
      later(() => { showSheet(); sheet.classList.add('is-unfold'); }, 2300);
      later(startInk, 2300 + 1100);
    };
    onTap(env, open);
    onTap(d.querySelector('.wg-cta'), open);
    ok.addEventListener('change', () => {
      d.classList.toggle('is-signed', ok.checked);
      if (!ok.checked) {
        if (hint) hint.textContent = 'Seal your mark above. She is the door.';
        return;
      }
      ok.disabled = true;
      if (hint) hint.textContent = 'She heard you. She is waiting.';
      later(returnToHer, RM() ? 0 : 180);
    });
    const leaveGate = () => {
      kids.forEach(e => e.removeAttribute('inert'));
      root.classList.remove('pb-gate-open');
      d.classList.add('is-leaving');
      const rm = () => { if (d.isConnected) d.remove(); };
      if (RM()) rm(); else later(rm, 600);
      document.dispatchEvent(new CustomEvent('pb:warned'));
    };
    const showHer = () => {
      d.classList.remove('is-lettering', 'is-returning');
      d.classList.add('is-with-her');
      if (libRoot) {
        libRoot.classList.remove('is-dim');
        libRoot.setAttribute('data-lib', 'mid-her');
      }
      if (scroll) { scroll.hidden = true; scroll.setAttribute('inert', ''); }
      inkSvg && inkSvg.classList.remove('is-shown');
      if (herHint) herHint.classList.remove('is-gone');
      if (herBtn) {
        herBtn.disabled = false;
        try { herBtn.focus({ preventScroll: true, focusVisible: false }); } catch (e) { herBtn.focus(); }
      }
    };
    const returnToHer = () => {
      if (d.classList.contains('is-returning') || d.classList.contains('is-with-her') || d.classList.contains('is-admitted')) return;
      if (!ok.checked) return;
      d.classList.remove('is-lettering');
      d.classList.add('is-returning');
      if (libRoot) libRoot.classList.remove('is-dim');
      if (scroll) { scroll.hidden = false; scroll.style.pointerEvents = 'none'; }
      inkSvg && inkSvg.classList.remove('is-shown');
      if (RM() || !libRoot) { showHer(); return; }
      later(() => libRoot && libRoot.setAttribute('data-lib', 'closing'), 80);
      later(() => libRoot && libRoot.setAttribute('data-lib', 'shut'), 600);
      later(() => libRoot && libRoot.setAttribute('data-lib', 'to-her'), 1200);
      later(showHer, 2200);
    };
    const approachHer = () => {
      if (!d.classList.contains('is-with-her') || d.classList.contains('is-admitted')) return;
      d.classList.add('is-admitted');
      if (herBtn) herBtn.disabled = true;
      if (herHint) herHint.classList.add('is-gone');
      try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
      if (RM() || !libRoot) { leaveGate(); return; }
      libRoot.setAttribute('data-lib', 'near');
      later(leaveGate, 1000);
    };
    // leaving for the wards page lowers the gate without signing it; any other page raises it again
    unmount = () => { timers.forEach(clearTimeout); timers = []; kids.forEach(e => e.removeAttribute('inert')); root.classList.remove('pb-gate-open'); d.remove(); };
    d.querySelectorAll('.pw-wards').forEach(a => a.addEventListener('click', () => unmount()));
    const fl = d.querySelector('.wg-full-link'), fp = d.querySelector('#pbwg-full');
    fl.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const o = fp.hidden;
      fp.hidden = !o;
      fl.setAttribute('aria-expanded', String(o));
      fl.textContent = o ? 'Hide the full warning' : 'Read the full warning';
      if (o) fp.scrollIntoView({ block: 'start', behavior: RM() ? 'auto' : 'smooth' });
    });
    if (!keyWired) keyWired = true, d.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...d.querySelectorAll('a[href],input,button:not([disabled])')].filter(el => el.offsetParent !== null || el === document.activeElement);
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !d.contains(document.activeElement) || document.activeElement === title)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    const libRoot = d.querySelector('.wg-lib');
    const libHint = d.querySelector('.wg-lib-hint');
    const scroll = d.querySelector('.wg-scroll');
    const altarBtn = d.querySelector('.wg-hot-altar');
    const letterBtn = d.querySelector('.wg-hot-letter');
    const herBtn = d.querySelector('.wg-hot-her');
    const herHint = d.querySelector('.wg-her-hint');
    const inkSvg = d.querySelector('.wg-book-ink');
    const revealLetter = () => {
      if (d.classList.contains('is-lettering')) return;
      if (libHint) libHint.classList.add('is-gone');
      d.classList.add('is-lettering');
      if (libRoot) libRoot.classList.add('is-dim');
      if (scroll) scroll.hidden = false;
      try { env.focus({ preventScroll: true, focusVisible: false }); } catch (e) { env.focus(); }
    };
    const approach = () => {
      if (!libRoot) return;
      const st = libRoot.getAttribute('data-lib');
      if (st !== 'far') return;
      if (libHint) libHint.classList.add('is-gone');
      altarBtn && (altarBtn.disabled = true);
      if (RM()) {
        libRoot.setAttribute('data-lib', 'open');
        inkSvg && inkSvg.classList.add('is-shown');
        try { letterBtn.focus({ preventScroll: true, focusVisible: false }); } catch (e) {}
        return;
      }
      libRoot.setAttribute('data-lib', 'dolly');
      later(() => {
        libRoot.setAttribute('data-lib', 'approach');
        later(() => {
          libRoot.setAttribute('data-lib', 'open');
          later(() => { inkSvg && inkSvg.classList.add('is-shown'); }, 180);
        }, 600);
      }, 1100);
    };
    onTap(altarBtn, approach);
    onTap(letterBtn, revealLetter);
    onTap(herBtn, approachHer);
    // Warm the later plates so the book-to-Ballerina cuts do not stall on a blank frame.
    const warm = (name) => {
      const l = document.createElement('link');
      l.rel = 'preload'; l.as = 'image';
      l.href = `${lib}${name}.webp?v=${GATE_V}`;
      document.head.appendChild(l);
    };
    ['02-approach','03-book-open','04-book-closing','05-book-closed','06-mid-ballerina','07-close-ballerina'].forEach(warm);
    d.querySelectorAll('.wg-plate').forEach(im => { try { im.decode && im.decode().catch(() => {}); } catch (e) {} });
    try { altarBtn.focus({ preventScroll: true, focusVisible: false }); } catch (e) { altarBtn && altarBtn.focus(); }
  };
  // The wards page is protective only and is linked from the gate itself, so it opens without the gate;
  // leaving it for any other page (in-site navigation) still raises the gate until it is accepted.
  const exempt = () => /\/wards\.html$/.test(location.pathname);
  const accepted = () => { try { return Date.now() - (+localStorage.getItem(KEY) || 0) < TTL; } catch (e) { return false; } };
  let unmount = () => {};
  const maybe = () => {
    if (exempt()) { if (d.isConnected) unmount(); return; }
    if (!accepted() && !d.isConnected) mount();
  };
  document.addEventListener('pb:page', maybe);
  if (exempt()) { root.classList.remove('pb-gate'); return; }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
