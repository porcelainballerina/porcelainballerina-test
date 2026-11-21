// Ties the three drawn cards together into one reading, framed by the visitor's question.
// Traditional Rider-Waite meanings only; offered for reflection, never as certainty.
const THEMES = [
  { key: 'love', words: /\b(love|lover|loves|partner|relationship|heart|crush|marr(y|iage)|husband|wife|boyfriend|girlfriend|date|dating|ex|romance|soulmate|together|feelings?|kiss|breakup|break up)\b/i,
    ask: 'matters of the heart', bridge: ['in love, this is what you carried in with you', 'between you and the other, this is the truth of now', 'for the heart, this is where the current runs'] },
  { key: 'work', words: /\b(work|job|career|money|business|financ\w*|boss|salary|debt|rent|music|album|band|song|art|project|success|fame|deal|contract|study|school|exam|income|pay)\b/i,
    ask: 'your work and your means', bridge: ['in your work, this is the ground you built on', 'in what you make and earn, this is how it stands', 'for your work, this is what is gathering'] },
  { key: 'health', words: /\b(health|healthy|sick|ill|illness|body|heal|healing|pain|energy|tired|anxiety|anxious|sleep|mind|mental|stress|recover\w*)\b/i,
    ask: 'your body and your strength', bridge: ['in your strength, this is what wore on you', 'in body and mind, this is where you stand', 'for your wellbeing, this is the turning ahead'] },
  { key: 'decision', words: /\b(should|choose|choice|decid\w*|decision|whether|which|or not|stay or|leave|move|quit)\b/i,
    ask: 'the choice in front of you', bridge: ['behind the choice, this is what brought you to it', 'at the crossroads, this is what you hold', 'down the road you are leaning toward, this is waiting'] },
  { key: 'future', words: /\b(future|will|happen|year|coming|next|soon|ahead|destiny|fate|become)\b/i,
    ask: 'what lies ahead of you', bridge: ['behind you, this is the root of it', 'at this moment, this is the shape of things', 'ahead, this is what moves toward you'] },
];
const GENERAL = { key: 'general', ask: 'the whole of your path', bridge: ['behind you, this is what has shaped you', 'now, this is where you stand', 'ahead, this is what may come'] };
const SUITS = { Cups: 'feeling and the ties between people', Pentacles: 'the body, money and the material world', Swords: 'thought, words and conflict', Wands: 'will, desire and the creative fire' };
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const suitOf = (c) => (c.arcana.includes('·') ? c.arcana.split('·')[1].trim() : null);

export function detectTheme(q) {
  if (!q) return GENERAL;
  let best = null, n = 0;
  for (const t of THEMES) { const m = q.match(new RegExp(t.words.source, 'gi')); if (m && m.length > n) { best = t; n = m.length; } }
  return best || GENERAL;
}

// draws: [{ card, reversed }] in order past, present, future
export function composeReading(question, draws) {
  const q = (question || '').trim();
  const theme = detectTheme(q);
  const P = ['What has been', 'Where you stand', 'What may come'];
  const out = [];
  out.push(q
    ? `You asked: <q>${escapeHtml(q)}</q> I read it as a question about ${theme.ask}, and I laid the cards with that in my hands.`
    : 'You kept your question silent. That is your right. So I read for the whole of your path, and you will know which parts are yours.');
  draws.forEach((d, i) => {
    const m = lc(d.reversed ? d.card.rev : d.card.up);
    const name = `<b>${d.card.name}${d.reversed ? ', reversed' : ''}</b>`;
    const lead = ['Beneath it all lies', 'In the centre sits', 'And at the end of the line waits'][i];
    out.push(`<span class="syn-pos">${P[i]}.</span> ${lead} ${name}: ${m}. ${cap(theme.bridge[i])}${d.reversed ? ', for it came reversed and shows the card\'s turned face' : ''}.`);
  });
  // the pattern between them
  const majors = draws.filter((d) => d.card.arcana === 'Greater Mysteries').length;
  const rev = draws.filter((d) => d.reversed).length;
  const suits = draws.map((d) => suitOf(d.card)).filter(Boolean);
  const counts = suits.reduce((a, s) => ((a[s] = (a[s] || 0) + 1), a), {});
  const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const pat = [];
  if (majors >= 2) pat.push(`${majors === 3 ? 'All three are' : 'Two are'} of the Greater Mysteries. This is not a small matter; larger forces are moving through it, and some of it is not yours to steer.`);
  else if (majors === 1) pat.push(`One card of the Greater Mysteries stands among them, ${draws.find((d) => d.card.arcana === 'Greater Mysteries').card.name}. Let it be the spine of the reading; the others turn around it.`);
  else pat.push('No card of the Greater Mysteries came. What you face is in your own hands, made of daily choices rather than fate.');
  if (dom && dom[1] >= 2) pat.push(`The ${dom[0]} speak twice. The heart of this lies in ${SUITS[dom[0]]}.`);
  if (rev === 0) pat.push('None came reversed. The currents run open and clear.');
  else if (rev === 3) pat.push('All three came reversed. Something is held back, turned inward, or resisted. Look at what you will not look at.');
  else if (rev === 2) pat.push('Two came reversed. The road is not closed, but it is crooked; there is resistance to meet first.');
  out.push(pat.join(' '));
  // the thread from past through present to future
  const [a, b, c] = draws;
  out.push(`So the thread runs like this: from ${lc(short(a))}, through ${lc(short(b))}, toward ${lc(short(c))}. ${counsel(theme, c)}`);
  return { theme: theme.key, html: out.map((p) => `<p>${p}</p>`).join(''), summary: `From ${lc(short(a))}, through ${lc(short(b))}, toward ${lc(short(c))}.` };
}
function short(d) { return (d.reversed ? d.card.rev : d.card.up).split(',')[0].trim(); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function counsel(theme, d) {
  const w = {
    love: ['Meet the other as you are, not as you fear to be seen.', 'Before you reach for the other, settle what is unsettled in you.'],
    work: ['Put your hands to it; the card favours the work you are willing to do.', 'Clear what blocks the work before you push harder.'],
    health: ['Tend the body gently and give it time; it hears you.', 'Rest is not defeat. Remove what drains you before you ask for more strength.'],
    decision: ['If you lean this way, the card does not stand against you.', 'Do not decide in haste; what is blocked now may open if you wait.'],
    future: ['Walk toward it with open eyes.', 'Nothing here is fixed; what is turned can still be turned back.'],
    general: ['Walk toward it with open eyes.', 'What is turned can still be turned back.'],
  }[theme.key];
  return d.reversed ? w[1] : w[0];
}
function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
