'use strict';
const search = document.querySelector('#guide-search');
const chapters = [...document.querySelectorAll('.chapter')];
const features = [...document.querySelectorAll('details.feature')];
const status = document.querySelector('#search-status');
let savedOpen = null;
const normalize = value => value.toLocaleLowerCase('fi').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function filterGuide() {
  const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  const active = words.length > 0;
  if (active && savedOpen === null) savedOpen = new Set(features.filter(item => item.open));
  let matches = 0;
  chapters.forEach(chapter => {
    const heading = normalize(chapter.querySelector('h2').textContent);
    const headingMatch = words.every(word => heading.includes(word));
    let visible = 0;
    chapter.querySelectorAll('details.feature').forEach(feature => {
      const text = normalize(feature.textContent + ' ' + (feature.dataset.keywords || ''));
      const match = !active || headingMatch || words.every(word => text.includes(word));
      feature.hidden = !match;
      if (active) feature.open = match;
      else if (savedOpen) feature.open = savedOpen.has(feature);
      if (match) { visible++; matches++; }
    });
    chapter.hidden = active && visible === 0;
  });
  if (!active) savedOpen = null;
  document.body.classList.toggle('searching', active);
  document.querySelector('#no-results').hidden = !active || matches > 0;
  status.textContent = active ? `${matches} ohjekohtaa hakusanalla ”${search.value.trim()}”.` : '';
  document.querySelector('#clear-search').hidden = !active;
  document.querySelector('#quickstart').hidden = active;
}
search.addEventListener('input', filterGuide);
document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; filterGuide(); search.focus(); });
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.hash.slice(1));
  if (target && target.hidden) { search.value = ''; filterGuide(); }
  const mobile = document.querySelector('.mobile-nav');
  if (mobile?.contains(link)) mobile.open = false;
}));
const dialog = document.querySelector('#image-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogCaption = document.querySelector('#dialog-caption');
document.querySelectorAll('.shot-button').forEach(button => button.addEventListener('click', () => {
  const source = button.querySelector('img');
  dialogImage.src = source.src;
  dialogImage.alt = source.alt;
  dialogCaption.textContent = button.closest('figure').querySelector('figcaption').textContent;
  dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
let printState;
window.addEventListener('beforeprint', () => { printState = features.map(feature => feature.open); features.forEach(feature => { feature.open = true; }); });
window.addEventListener('afterprint', () => { if (printState) features.forEach((feature, index) => { feature.open = printState[index]; }); });
document.querySelectorAll('.print-button').forEach(button => button.addEventListener('click', () => window.print()));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.sidebar a').forEach(link => { if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-12% 0px -65% 0px' });
  chapters.forEach(chapter => observer.observe(chapter));
}
document.querySelectorAll('.js-only').forEach(element => { element.hidden = false; });
