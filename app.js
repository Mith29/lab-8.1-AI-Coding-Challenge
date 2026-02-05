// Minimal flashcards interactions: flip, next, prev, decks
const cards = [
  {front: 'What is HTML?', back: 'A markup language for documents.'},
  {front: 'What is CSS?', back: 'Style sheet language for UI.'},
  {front: 'What is JS?', back: 'Programming language for the web.'}
];

let index = 0;
let currentCards = cards.slice();
const cardEl = document.getElementById('current-card');
const frontEl = cardEl?.querySelector('.card-front');
const backEl = cardEl?.querySelector('.card-back');
const deckTitleEl = document.getElementById('deck-title');

function renderCard(i){
  if(!currentCards.length) {
    if(frontEl) frontEl.textContent = 'No cards';
    if(backEl) backEl.textContent = '';
    return;
  }
  if(i < 0) i = 0;
  if(i >= currentCards.length) i = 0;
  index = i;
  const c = currentCards[i];
  if(frontEl) frontEl.textContent = c.front;
  if(backEl) backEl.textContent = c.back;
  cardEl?.classList.remove('flipped');
}

function shuffleArray(arr){
  for(let i = arr.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderCard(index);

  const deckList = document.querySelector('.deck-list');

  // Decks data model
  let deckCounter = 1;
  const decks = [
    {id: `deck-${deckCounter++}`, name: 'Sample Deck 1', cards: [{front:'What is HTML?',back:'A markup language for documents.'}]},
    {id: `deck-${deckCounter++}`, name: 'Sample Deck 2', cards: [{front:'What is CSS?',back:'Style sheet language for UI.'}]},
    {id: `deck-${deckCounter++}`, name: 'Sample Deck 3', cards: [{front:'What is JS?',back:'Programming language for the web.'}]}
  ];

  let activeDeckId = decks[0].id;

  function renderDeckList(){
    if(!deckList) return;
    deckList.innerHTML = '';
    decks.forEach(d => {
      const li = document.createElement('li');
      li.className = 'deck';
      li.textContent = d.name;
      li.dataset.id = d.id;
      li.tabIndex = 0;
      li.setAttribute('role','button');
      if(d.id === activeDeckId) li.classList.add('active');
      deckList.appendChild(li);
    });
    attachDeckHandlers();
  }

  function attachDeckHandlers(){
    document.querySelectorAll('.deck').forEach(d => {
      d.addEventListener('click', ()=> selectDeck(d.dataset.id));
      d.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); selectDeck(d.dataset.id); } });
    });
  }

  function selectDeck(id){
    const deck = decks.find(x=>x.id === id);
    if(!deck) return;
    activeDeckId = id;
    document.querySelectorAll('.deck').forEach(x=>x.classList.remove('active'));
    const el = document.querySelector(`.deck[data-id="${id}"]`);
    el?.classList.add('active');
    currentCards = deck.cards.slice();
    if(deckTitleEl) deckTitleEl.textContent = deck.name;
    index = 0;
    renderCard(0);
  }

  renderDeckList();
  selectDeck(activeDeckId);

  // Modal-based create deck (header button)
  const deckModal = document.getElementById('deck-modal');
  const deckForm = document.getElementById('deck-form');
  const deckNameInput = document.getElementById('deck-name');
  const headerAdd = document.querySelector('.header-add-deck');

  // Accessible modal: focus trap, ESC to close, restore focus to opener
  let editDeckId = null;
  let lastFocused = null;
  const FOCUSABLE = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let onKeydown;

  function trapFocus(modal){
    const nodes = Array.from(modal.querySelectorAll(FOCUSABLE)).filter(n => n.offsetWidth || n.offsetHeight || n.getClientRects().length);
    const first = nodes[0];
    const last = nodes[nodes.length-1];
    onKeydown = (e)=>{
      if(e.key === 'Escape') { e.preventDefault(); closeDeckModal(); return; }
      if(e.key === 'Tab'){
        if(nodes.length === 0) { e.preventDefault(); return; }
        if(e.shiftKey){ if(document.activeElement === first){ e.preventDefault(); last.focus(); } }
        else { if(document.activeElement === last){ e.preventDefault(); first.focus(); } }
      }
    };
    document.addEventListener('keydown', onKeydown);
    // focus first focusable element
    setTimeout(()=> (first || modal).focus(), 10);
  }

  function releaseFocus(){ if(onKeydown) document.removeEventListener('keydown', onKeydown); onKeydown = null; }

  function openDeckModal(name = '', opener = null){
    if(!deckModal) return;
    lastFocused = opener || document.activeElement;
    editDeckId = null;
    deckNameInput.value = name;
    deckModal.hidden = false;
    deckModal.removeAttribute('aria-hidden');
    trapFocus(deckModal);
  }

  function openDeckModalForEdit(id){
    const deck = decks.find(d=>d.id === id);
    if(!deck) return;
    editDeckId = id;
    openDeckModal(deck.name, document.querySelector('.edit-deck'));
  }

  function closeDeckModal(){
    if(!deckModal) return;
    deckModal.hidden = true;
    deckModal.setAttribute('aria-hidden','true');
    deckForm?.reset();
    releaseFocus();
    // restore focus to opener
    try{ if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus(); }catch(e){}
    lastFocused = null;
    editDeckId = null;
  }

  // open create modal from header button
  headerAdd?.addEventListener('click', (e)=> openDeckModal('', e.currentTarget));

  // overlay click closes modal when clicking outside dialog
  deckModal?.addEventListener('click', (e)=>{ if(e.target === deckModal) closeDeckModal(); });
  deckModal?.querySelector('.cancel')?.addEventListener('click', closeDeckModal);

  deckForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = (deckNameInput?.value || '').trim();
    if(!name){ deckNameInput?.focus(); return; }
    if(editDeckId){
      const deck = decks.find(d=>d.id === editDeckId);
      if(deck) deck.name = name;
      renderDeckList();
      selectDeck(editDeckId);
      // focus edited deck element
      const el = document.querySelector(`.deck[data-id="${editDeckId}"]`);
      el?.focus();
    } else {
      const id = `deck-${deckCounter++}`;
      const deck = {id, name, cards: []};
      decks.push(deck);
      renderDeckList();
      selectDeck(id);
      const el = document.querySelector(`.deck[data-id="${id}"]`);
      el?.focus();
    }
    closeDeckModal();
  });

  // New card handler
  document.querySelector('.new-card')?.addEventListener('click', ()=>{
    const front = prompt('Front text for new card');
    if(!front) return;
    const back = prompt('Back text for new card') || '';
    const obj = {front, back};
    cards.push(obj);
    currentCards.push(obj);
    index = currentCards.length - 1;
    renderCard(index);
  });

  // Edit / Delete deck buttons
  document.querySelector('.edit-deck')?.addEventListener('click', ()=>{
    const active = decks.find(d=>d.id === activeDeckId);
    if(!active) return;
    editDeckId = active.id;
    openDeckModal(active.name);
  });

  document.querySelector('.delete-deck')?.addEventListener('click', ()=>{
    const activeIndex = decks.findIndex(d=>d.id === activeDeckId);
    if(activeIndex === -1) return;
    const ok = confirm(`Delete deck "${decks[activeIndex].name}"? This cannot be undone.`);
    if(!ok) return;
    decks.splice(activeIndex,1);
    // remove from DOM and re-render
    renderDeckList();
    if(decks.length) selectDeck(decks[0].id);
    else {
      // no decks left
      activeDeckId = null;
      currentCards = [];
      if(deckTitleEl) deckTitleEl.textContent = '';
      renderCard(0);
    }
  });

  // Shuffle handler
  document.querySelector('.shuffle')?.addEventListener('click', ()=>{
    shuffleArray(currentCards);
    index = 0;
    renderCard(index);
  });

  // Search handler - jump to first matching card
  document.querySelector('.search-input')?.addEventListener('input', (e)=>{
    const q = (e.target.value || '').toLowerCase().trim();
    if(!q){ renderCard(0); return; }
    const found = currentCards.findIndex(c => (c.front + ' ' + c.back).toLowerCase().includes(q));
    if(found >= 0) renderCard(found);
  });

  document.querySelector('.flip')?.addEventListener('click', ()=>{
    cardEl?.classList.toggle('flipped');
  });
  document.querySelector('.next')?.addEventListener('click', ()=>{
    if(!currentCards.length) return;
    index = (index + 1) % currentCards.length; renderCard(index);
  });
  document.querySelector('.prev')?.addEventListener('click', ()=>{
    if(!currentCards.length) return;
    index = (index - 1 + currentCards.length) % currentCards.length; renderCard(index);
  });
});
