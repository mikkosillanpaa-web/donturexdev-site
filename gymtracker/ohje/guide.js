'use strict';
const search = document.querySelector('#guide-search');
const searchInputs = [...document.querySelectorAll('[data-guide-search]')];
const chapters = [...document.querySelectorAll('.chapter')];
const features = [...document.querySelectorAll('details.feature')];
const quickstart = document.querySelector('#quickstart');
const statusElements = [...document.querySelectorAll('.search-status')];
const toolsDialog = document.querySelector('#mobile-tools');
const toolsButtons = [...document.querySelectorAll('.mobile-tool')];
const dialog = document.querySelector('#image-dialog');
const dialogImage = document.querySelector('#dialog-image');
let savedOpen = null;
let query = '';
let toolsReturnFocus = null;
let imageReturnFocus = null;
let printState = null;
const normalize = value => value.toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f\u00ad]/g, '');
const records = features.map((feature, order) => {
  const summary = feature.querySelector('summary');
  const body = feature.querySelector('.feature-body');
  const chapter = feature.closest('.chapter');
  const bodyText = [...body.querySelectorAll('p,li,h3')].map(element => element.textContent).join(' ');
  const title = summary.textContent;
  const chapterTitle = chapter.querySelector('h2').textContent;
  return { feature, summary, body, chapter, title, chapterTitle, bodyText, order,
    normalizedTitle: normalize(title), normalizedChapter: normalize(chapterTitle),
    haystack: normalize(`${title} ${bodyText} ${chapterTitle}`) };
});

// Map folded characters back to the original text so Finnish accents and user
// input can be highlighted using text nodes, without HTML interpolation.
function highlightedText(text, words) {
  const fragment = document.createDocumentFragment();
  let folded = '';
  const positions = [];
  let offset = 0;
  for (const character of text) {
    const value = normalize(character);
    folded += value;
    for (let index = 0; index < value.length; index++) positions.push([offset, offset + character.length]);
    offset += character.length;
  }
  const ranges = [];
  words.forEach(word => {
    let start = folded.indexOf(word);
    while (start !== -1) {
      ranges.push([positions[start][0], positions[start + word.length - 1][1]]);
      start = folded.indexOf(word, start + word.length);
    }
  });
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  ranges.forEach(range => {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  });
  let cursor = 0;
  merged.forEach(([start, end]) => {
    fragment.append(document.createTextNode(text.slice(cursor, start)));
    const mark = document.createElement('mark');
    mark.dataset.searchHighlight = '';
    mark.textContent = text.slice(start, end);
    fragment.append(mark);
    cursor = end;
  });
  fragment.append(document.createTextNode(text.slice(cursor)));
  return fragment;
}
function clearHighlights() {
  document.querySelectorAll('mark[data-search-highlight]').forEach(mark => {
    const parent = mark.parentNode;
    mark.replaceWith(document.createTextNode(mark.textContent));
    parent.normalize();
  });
}
function highlightElement(element, words) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.parentElement.closest('.shot,mark') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (words.some(word => normalize(node.textContent).includes(word))) node.replaceWith(highlightedText(node.textContent, words));
  });
}
function snippet(record, words) {
  const body = record.bodyText;
  const hits = words.map(word => normalize(body).indexOf(word)).filter(index => index >= 0);
  let start = hits.length ? Math.max(0, Math.min(...hits) - 45) : 0;
  if (start > 0) {
    const boundary = body.indexOf(' ', start);
    if (boundary !== -1 && boundary < start + 20) start = boundary + 1;
  }
  const end = Math.min(body.length, start + 155);
  return `${start ? '…' : ''}${body.slice(start, end).trim()}${end < body.length ? '…' : ''}`;
}
function renderResults(matches, words) {
  document.querySelectorAll('[data-search-results]').forEach(container => {
    container.replaceChildren();
    container.hidden = words.length === 0;
    if (!words.length) return;
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Ohjekohtaa ei löytynyt. Kokeile lyhyempää sanaa, kuten ”sarja”, ”kello” tai ”uni”.';
      container.append(empty);
      return;
    }
    const list = document.createElement('ol');
    list.className = 'search-result-list';
    matches.slice(0, 8).forEach(record => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${record.feature.id}`;
      link.dataset.searchResult = '';
      const title = document.createElement('span');
      title.className = 'result-title';
      title.append(highlightedText(record.title, words));
      const chapter = document.createElement('span');
      chapter.className = 'result-chapter';
      chapter.textContent = record.chapterTitle;
      const excerpt = document.createElement('span');
      excerpt.className = 'result-snippet';
      excerpt.append(highlightedText(snippet(record, words), words));
      link.append(title, chapter, excerpt);
      item.append(link);
      list.append(item);
    });
    container.append(list);
    if (matches.length > 8) {
      const more = document.createElement('p');
      more.className = 'search-more';
      more.textContent = `Näytetään 8 ensimmäistä osumaa. Kaikki ${matches.length} osuvaa ohjekohtaa ovat auki alempana sivulla.`;
      container.append(more);
    }
  });
}
function filterGuide(value = query) {
  query = value;
  const words = [...new Set(normalize(query.trim()).split(/\s+/).filter(Boolean))];
  const active = words.length > 0;
  searchInputs.forEach(input => { if (input.value !== query) input.value = query; });
  if (active && savedOpen === null) savedOpen = new Set(features.filter(item => item.open));
  clearHighlights();
  const matches = [];
  records.forEach(record => {
    const match = !active || words.every(word => record.haystack.includes(word));
    record.feature.hidden = !match;
    if (active) record.feature.open = match;
    else if (savedOpen) record.feature.open = savedOpen.has(record.feature);
    if (match && active) {
      const titleHits = words.filter(word => record.normalizedTitle.includes(word)).length;
      record.score = (titleHits === words.length ? 100 : 0) + titleHits * 20 + words.filter(word => record.normalizedChapter.includes(word)).length * 3;
      matches.push(record);
      highlightElement(record.summary, words);
      highlightElement(record.body, words);
    }
  });
  chapters.forEach(chapter => { chapter.hidden = active && !records.some(record => record.chapter === chapter && !record.feature.hidden); });
  matches.sort((a, b) => b.score - a.score || a.order - b.order);
  if (!active) savedOpen = null;
  document.body.classList.toggle('searching', active);
  document.querySelectorAll('[data-clear-search]').forEach(button => { button.hidden = !active; });
  statusElements.forEach(status => { status.textContent = active ? `${matches.length} ohjekohtaa hakusanalla ”${query.trim()}”.` : ''; });
  // Empty results are shown next to the search field, including inside the mobile dialog.
  document.querySelector('#no-results').hidden = true;
  quickstart.hidden = active;
  renderResults(matches, words);
  updateActiveChapter();
}
searchInputs.forEach(input => input.addEventListener('input', () => filterGuide(input.value)));
document.querySelectorAll('[data-clear-search]').forEach(button => button.addEventListener('click', () => {
  filterGuide('');
  button.closest('.search-box').querySelector('input').focus({ preventScroll: true });
}));

function updateActiveChapter() {
  const visible = chapters.filter(chapter => !chapter.hidden);
  const offset = document.querySelector('.topbar').getBoundingClientRect().height + 48;
  const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  const current = atEnd ? visible.at(-1) : visible.filter(chapter => chapter.getBoundingClientRect().top <= offset).at(-1) || visible[0];
  document.querySelectorAll('[data-chapter-link]').forEach(link => {
    if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function closeTools(restoreFocus = true) {
  if (!restoreFocus) toolsReturnFocus = null;
  toolsDialog.close();
}
function navigateToHash(hash, clearQuery = false, updateHistory = true) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  if (clearQuery && query) filterGuide('');
  const feature = target.closest('details.feature');
  if (feature) feature.open = true;
  if (toolsDialog.open) closeTools(false);
  const focusTarget = target.matches('details.feature') ? target.querySelector('summary') : target.matches('.chapter') ? target.querySelector('h2') : target;
  if (!focusTarget.matches('summary,a,button,input')) focusTarget.tabIndex = -1;
  if (updateHistory && location.hash !== hash) history.pushState(null, '', hash);
  requestAnimationFrame(() => {
    focusTarget.scrollIntoView({ block: 'start', behavior: 'instant' });
    focusTarget.focus({ preventScroll: true });
    updateActiveChapter();
  });
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  navigateToHash(link.hash, !link.hasAttribute('data-search-result'));
  document.querySelector('.fallback-nav').open = false;
});
window.addEventListener('hashchange', () => navigateToHash(location.hash, true, false));
toolsButtons.forEach(button => button.addEventListener('click', () => {
  toolsReturnFocus = button;
  toolsDialog.showModal();
  toolsButtons.forEach(trigger => trigger.setAttribute('aria-expanded', 'true'));
  toolsDialog.scrollTop = 0;
  const focusTarget = button.id === 'open-search' ? document.querySelector('#mobile-search') : toolsDialog.querySelector('.tools-nav a');
  focusTarget.focus({ preventScroll: true });
}));
document.querySelector('#close-tools').addEventListener('click', () => closeTools());
toolsDialog.addEventListener('close', () => {
  toolsButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
  const returnTo = toolsReturnFocus;
  toolsReturnFocus = null;
  if (returnTo) returnTo.focus({ preventScroll: true });
});
function closeOnBackdrop(event) {
  if (event.target !== event.currentTarget) return;
  const rect = event.currentTarget.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
}
function handleDialogKeys(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.currentTarget.close();
    return;
  }
  if (event.key !== 'Tab') return;
  const controls = [...event.currentTarget.querySelectorAll('button,input,a[href],[tabindex="0"]')]
    .filter(control => !control.disabled && control.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if ((!event.shiftKey && document.activeElement === last) || (event.shiftKey && document.activeElement === first)) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
}
toolsDialog.addEventListener('keydown', handleDialogKeys);
dialog.addEventListener('keydown', handleDialogKeys);
toolsDialog.addEventListener('click', closeOnBackdrop);
document.querySelectorAll('.shot-button').forEach(button => button.addEventListener('click', () => {
  imageReturnFocus = button;
  const source = button.querySelector('img');
  dialogImage.src = source.src;
  dialogImage.alt = source.alt;
  document.querySelector('#dialog-caption').textContent = button.closest('figure').querySelector('.caption-text').textContent;
  dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', closeOnBackdrop);
dialog.addEventListener('close', () => { imageReturnFocus?.focus({ preventScroll: true }); imageReturnFocus = null; });

function preparePrint() {
  if (printState) return;
  printState = {
    features: features.map(feature => ({ open: feature.open, hidden: feature.hidden })),
    chapters: chapters.map(chapter => chapter.hidden), quickstart: quickstart.hidden,
    loading: [...document.querySelectorAll('.shot img')].map(image => image.getAttribute('loading')),
    scrollX, scrollY, focus: document.activeElement
  };
  features.forEach(feature => { feature.hidden = false; feature.open = true; });
  chapters.forEach(chapter => { chapter.hidden = false; });
  quickstart.hidden = false;
  document.querySelectorAll('.shot img').forEach(image => { image.loading = 'eager'; });
}
function restorePrint() {
  if (!printState) return;
  const previous = printState;
  printState = null;
  features.forEach((feature, index) => { feature.open = previous.features[index].open; feature.hidden = previous.features[index].hidden; });
  chapters.forEach((chapter, index) => { chapter.hidden = previous.chapters[index]; });
  quickstart.hidden = previous.quickstart;
  document.querySelectorAll('.shot img').forEach((image, index) => {
    if (previous.loading[index] === null) image.removeAttribute('loading');
    else image.setAttribute('loading', previous.loading[index]);
  });
  previous.focus?.focus({ preventScroll: true });
  window.scrollTo(previous.scrollX, previous.scrollY);
}
window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', restorePrint);
window.matchMedia('print').addEventListener('change', event => { if (!event.matches) restorePrint(); });
document.querySelectorAll('.print-button').forEach(button => button.addEventListener('click', async () => {
  // Decode lazy screenshots before the browser takes its print snapshot.
  preparePrint();
  await Promise.all([...document.querySelectorAll('.shot img')].map(image => image.decode().catch(() => {})));
  window.print();
}));
let activeFrame;
window.addEventListener('scroll', () => {
  if (activeFrame) return;
  activeFrame = requestAnimationFrame(() => { activeFrame = null; updateActiveChapter(); });
}, { passive: true });
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', `${Math.ceil(document.querySelector('.topbar').getBoundingClientRect().height)}px`);
  updateActiveChapter();
}).observe(document.querySelector('.topbar'));
document.querySelectorAll('.js-only').forEach(element => { element.hidden = false; });
document.querySelector('.fallback-nav').hidden = true;
if (location.hash) navigateToHash(location.hash, false, false);
updateActiveChapter();
