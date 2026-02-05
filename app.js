// Minimal flashcards interactions: flip, next, prev, decks
const cards = [
  {front: 'What is HTML?', back: 'A markup language for documents.'},
  {front: 'What is CSS?', back: 'Style sheet language for UI.'},
  {front: 'What is JS?', back: 'Programming language for the web.'}
];

let index = 0;
let currentCards = [];
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
  cardEl?.classList.remove('is-flipped','flipped');
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
  const cardListEl = document.getElementById('card-list');

  // Decks data model with meaningful content
  let deckCounter = 1;
  let decks = [
    {
      id: `deck-${deckCounter++}`,
      name: 'JavaScript Basics',
      cards: [
        {front: 'What is a closure in JavaScript?', back: 'A closure is a function that retains access to its lexical scope even when executed outside that scope.'},
        {front: 'Difference between var, let, and const?', back: '`var` is function-scoped, `let` and `const` are block-scoped; `const` creates read-only bindings.'},
        {front: 'What is event delegation?', back: 'A pattern where a single handler on a parent handles events for multiple child elements.'},
        {front: 'What does `this` refer to in a function?', back: 'Depends on how the function is called: method -> object; standalone -> global/undefined; arrow -> lexical `this`.'},
        {front: 'Explain promises.', back: 'Promises represent the eventual completion or failure of an async operation and allow chaining via `then`/`catch`.'},
        {front: 'What is async/await?', back: 'Syntax sugar over promises that lets you write asynchronous code that looks synchronous.'},
        {front: 'What is the DOM?', back: 'The Document Object Model, an interface representing HTML elements as nodes and objects.'},
        {front: 'What is hoisting?', back: 'JavaScript behavior where declarations are moved to the top of their scope during compilation.'},
        {front: 'Difference between == and ===', back: '`==` performs type coercion, `===` checks strict equality without coercion.'},
        {front: 'What is a prototype?', back: 'An object from which other objects inherit properties; used for prototypal inheritance.'}
      ]
    },
    {
      id: `deck-${deckCounter++}`,
      name: 'HTML & CSS Fundamentals',
      cards: [
        {front: 'What does HTML stand for?', back: 'HyperText Markup Language.'},
        {front: 'What is semantic HTML?', back: 'Using elements that convey meaning (e.g., `<header>`, `<nav>`, `<article>`) for accessibility and SEO.'},
        {front: 'What is the CSS box model?', back: 'Content, padding, border, and margin define the space an element occupies.'},
        {front: 'What is Flexbox used for?', back: 'A layout module for arranging items in a one-dimensional row or column with flexible sizing.'},
        {front: 'What is responsive design?', back: 'Techniques (media queries, fluid layouts) to make sites usable across device sizes.'},
        {front: 'Purpose of `alt` attribute on images?', back: 'Provides alternative text for accessibility and when images fail to load.'},
        {front: 'What is CSS specificity?', back: 'Rules used to determine which CSS selector wins when multiple apply to the same element.'},
        {front: 'How to include external CSS?', back: 'Using `<link rel="stylesheet" href="style.css">` in the document head.'},
        {front: 'What is a CSS preprocessor?', back: 'Tools like Sass or Less that add features (variables, nesting) to CSS before compiling.'},
        {front: 'What is accessibility (a11y)?', back: 'Designing web content so people with disabilities can perceive, navigate, and interact with it.'}
      ]
    },
    {
      id: `deck-${deckCounter++}`,
      name: 'Computer Networking Basics',
      cards: [
        {front: 'What is an IP address?', back: 'A numeric label assigned to devices on a network, e.g., IPv4 (192.0.2.1).'},
        {front: 'Difference between TCP and UDP?', back: 'TCP is connection-oriented and reliable; UDP is connectionless and faster but unreliable.'},
        {front: 'What is DNS?', back: 'Domain Name System translates human-readable domain names into IP addresses.'},
        {front: 'What is HTTP?', back: 'HyperText Transfer Protocol, the foundation of data communication for the web.'},
        {front: 'What is HTTPS?', back: 'HTTP over TLS/SSL, encrypts data between client and server.'},
        {front: 'What is a router?', back: 'A network device that forwards packets between different networks.'},
        {front: 'What is a subnet?', back: 'A segmented piece of a larger network, defined by a network prefix.'},
        {front: 'What is latency?', back: 'The time it takes for data to travel from source to destination.'},
        {front: 'What is bandwidth?', back: 'The data transfer capacity of a network connection, typically in Mbps or Gbps.'},
        {front: 'What is NAT?', back: 'Network Address Translation maps private IP addresses to a public IP for internet access.'}
      ]
    }
  ];

  let activeDeckId = decks[0].id;

  // Persistence: save/load decks + active deck to localStorage
  function saveState(){
    try{
      const state = { deckCounter, decks, activeDeckId };
      localStorage.setItem('flashcards_state', JSON.stringify(state));
    }catch(e){ /* ignore */ }
  }

  function loadState(){
    try{
      const raw = localStorage.getItem('flashcards_state');
      if(!raw) return;
      const parsed = JSON.parse(raw);
      if(parsed && Array.isArray(parsed.decks)){
        decks = parsed.decks;
        // restore deckCounter (or compute from ids)
        if(parsed.deckCounter) deckCounter = parsed.deckCounter;
        else {
          let max = 0;
          decks.forEach(d=>{ const m = String(d.id).match(/-(\d+)$/); if(m) max = Math.max(max, Number(m[1])); });
          deckCounter = Math.max(deckCounter, max + 1);
        }
        if(parsed.activeDeckId) activeDeckId = parsed.activeDeckId;
      }
    }catch(e){ /* ignore malformed state */ }
  }

  loadState();
  // Randomize-on-select state persisted per session
  let randomizeOnSelect = sessionStorage.getItem('randomize') === '1';
  const randomizeBtn = document.querySelector('.randomize');
  if(randomizeBtn){
    randomizeBtn.setAttribute('aria-pressed', randomizeOnSelect ? 'true' : 'false');
    randomizeBtn.addEventListener('click', ()=>{
      randomizeOnSelect = !randomizeOnSelect;
      randomizeBtn.setAttribute('aria-pressed', randomizeOnSelect ? 'true' : 'false');
      sessionStorage.setItem('randomize', randomizeOnSelect ? '1' : '0');
      // apply immediately to current deck if any
      const deck = decks.find(d=>d.id === activeDeckId);
      if(deck){
        if(randomizeOnSelect){
          currentCards = deck.cards.slice();
          shuffleArray(currentCards);
        } else {
          currentCards = deck.cards.slice();
        }
        index = 0;
        renderCard(index);
        renderCardList();
      }
      if(liveEl) liveEl.textContent = `Randomize ${randomizeOnSelect ? 'enabled' : 'disabled'} for this session.`;
    });
  }

  function renderDeckList(){
    if(!deckList) return;
    deckList.innerHTML = '';
    if(!decks.length){
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'No decks yet — click + New Deck to create one.';
      deckList.appendChild(li);
      return;
    }
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
    if(randomizeOnSelect) shuffleArray(currentCards);
    if(deckTitleEl) deckTitleEl.textContent = deck.name;
    index = 0;
    renderCard(0);
    renderCardList();
    // persist last active deck
    saveState();
  }

  renderDeckList();
  selectDeck(activeDeckId);
  const liveEl = document.getElementById('a11y-live');

  // render initial card list for active deck
  renderCardList();

  // Modal-based create deck (header button)
  const deckModal = document.getElementById('deck-modal');
  const deckForm = document.getElementById('deck-form');
  const deckNameInput = document.getElementById('deck-name');
  const deckErrorEl = document.getElementById('deck-error');
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
    if(deckErrorEl) { deckErrorEl.textContent = ''; deckNameInput?.removeAttribute('aria-invalid'); }
    releaseFocus();
    // restore focus to opener
    try{ if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus(); }catch(e){}
    lastFocused = null;
    editDeckId = null;
  }

  // open create modal from header button
  headerAdd?.addEventListener('click', (e)=> openDeckModal('', e.currentTarget));

  // clear inline deck error when user types
  deckNameInput?.addEventListener('input', ()=>{
    if(deckErrorEl) deckErrorEl.textContent = '';
    deckNameInput?.removeAttribute('aria-invalid');
  });

  // overlay click closes modal when clicking outside dialog
  deckModal?.addEventListener('click', (e)=>{ if(e.target === deckModal) closeDeckModal(); });
  deckModal?.querySelector('.cancel')?.addEventListener('click', closeDeckModal);

  deckForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = (deckNameInput?.value || '').trim();
    if(!name){
      if(deckErrorEl) deckErrorEl.textContent = 'Deck name cannot be empty.';
      deckNameInput?.setAttribute('aria-invalid','true');
      deckNameInput?.focus();
      return;
    }
    if(editDeckId){
      const deck = decks.find(d=>d.id === editDeckId);
      if(deck) deck.name = name;
      renderDeckList();
      selectDeck(editDeckId);
      // focus edited deck element
      const el = document.querySelector(`.deck[data-id="${editDeckId}"]`);
      el?.focus();
      if(liveEl) liveEl.textContent = `Deck \u201C${name}\u201D updated.`;
      if(deckErrorEl) deckErrorEl.textContent = '';
      saveState();
    } else {
      const id = `deck-${deckCounter++}`;
      const deck = {id, name, cards: []};
      decks.push(deck);
      renderDeckList();
      selectDeck(id);
      const el = document.querySelector(`.deck[data-id="${id}"]`);
      el?.focus();
      if(liveEl) liveEl.textContent = `Deck \u201C${name}\u201D created.`;
      if(deckErrorEl) deckErrorEl.textContent = '';
      saveState();
    }
    closeDeckModal();
  });

  // New card handler
  // Card modal & handlers
  const cardModal = document.getElementById('card-modal');
  const cardForm = document.getElementById('card-form');
  const cardFront = document.getElementById('card-front');
  const cardErrorEl = document.getElementById('card-error');
  const cardBack = document.getElementById('card-back');
  let editCardIndex = null;

  function renderCardList(){
    if(!cardListEl) return;
    cardListEl.innerHTML = '';
    const deck = decks.find(d=>d.id === activeDeckId);
    if(!deck || !deck.cards) return;
    if(!deck.cards.length){
      const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No cards yet — add your first card.'; cardListEl.appendChild(li);
      if(frontEl) frontEl.textContent = 'No cards'; if(backEl) backEl.textContent = '';
      return;
    }
    deck.cards.forEach((c,i)=>{
      const li = document.createElement('li');
      const txt = document.createElement('div'); txt.className = 'card-text'; txt.textContent = c.front;
      const actions = document.createElement('div'); actions.className = 'card-actions';
      const editBtn = document.createElement('button'); editBtn.className = 'small-btn edit'; editBtn.textContent = 'Edit';
      const delBtn = document.createElement('button'); delBtn.className = 'small-btn delete'; delBtn.textContent = 'Delete';
      // buttons use delegated handlers attached below
      actions.appendChild(editBtn); actions.appendChild(delBtn);
      li.appendChild(txt); li.appendChild(actions);
      li.dataset.index = i;
      cardListEl.appendChild(li);
    });
  }

  // delegated handler for card list actions (edit/delete)
  cardListEl?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const li = btn.closest('li');
    if(!li) return;
    const idx = Number(li.dataset.index);
    const deck = decks.find(d=>d.id === activeDeckId);
    if(!deck) return;
    if(btn.classList.contains('edit')){
      openCardModal(idx, btn);
    } else if(btn.classList.contains('delete')){
      const ok = confirm('Delete this card?'); if(!ok) return;
      deck.cards.splice(idx,1);
      currentCards = deck.cards.slice();
      if(idx <= index) index = Math.max(0, index - 1);
      renderCardList(); renderCard(index);
      if(liveEl) liveEl.textContent = `Card ${idx+1} deleted.`;
      saveState();
    }
  });

  function openCardModal(i = null, opener = null){
    if(!cardModal) return;
    lastFocused = opener || document.activeElement;
    editCardIndex = (i !== null && i !== undefined) ? i : null;
    if(editCardIndex !== null){
      const deck = decks.find(d=>d.id === activeDeckId);
      const c = deck?.cards[editCardIndex];
      cardFront.value = c?.front || '';
      cardBack.value = c?.back || '';
      cardModal.querySelector('#card-modal-title').textContent = 'Edit card';
    } else {
      cardFront.value = '';
      cardBack.value = '';
      cardModal.querySelector('#card-modal-title').textContent = 'Create card';
    }
    if(cardErrorEl) cardErrorEl.textContent = '';
    cardFront?.removeAttribute('aria-invalid');
    cardModal.hidden = false; cardModal.removeAttribute('aria-hidden');
    trapFocus(cardModal);
  }

  function closeCardModal(){
    if(!cardModal) return;
    cardModal.hidden = true; cardModal.setAttribute('aria-hidden','true');
    cardForm?.reset();
    if(cardErrorEl){ cardErrorEl.textContent = ''; cardFront?.removeAttribute('aria-invalid'); }
    releaseFocus();
    try{ if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus(); }catch(e){}
    lastFocused = null; editCardIndex = null;
  }

  document.querySelector('.new-card')?.addEventListener('click', (e)=>{ openCardModal(null, e.currentTarget); });

  // clear inline card error when user types on front input
  cardFront?.addEventListener('input', ()=>{
    if(cardErrorEl) cardErrorEl.textContent = '';
    cardFront?.removeAttribute('aria-invalid');
  });

  cardModal?.addEventListener('click', (e)=>{ if(e.target === cardModal) closeCardModal(); });
  cardModal?.querySelector('.cancel')?.addEventListener('click', closeCardModal);

  cardForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const front = (cardFront?.value || '').trim();
    const back = (cardBack?.value || '').trim();
    if(!front) { if(cardErrorEl) cardErrorEl.textContent = 'Card front cannot be empty.'; cardFront?.setAttribute('aria-invalid','true'); cardFront.focus(); return; }
    const deck = decks.find(d=>d.id === activeDeckId);
    if(!deck){ alert('Please select a deck first.'); closeCardModal(); return; }
    if(editCardIndex !== null){
      deck.cards[editCardIndex] = {front, back};
      currentCards = deck.cards.slice();
      renderCardList(); renderCard(editCardIndex);
      if(liveEl) liveEl.textContent = `Card updated.`;
      saveState();
    } else {
      deck.cards.push({front, back});
      currentCards = deck.cards.slice();
      renderCardList();
      index = currentCards.length - 1; renderCard(index);
      if(liveEl) liveEl.textContent = `Card created.`;
      saveState();
    }
    closeCardModal();
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
    const name = decks[activeIndex].name;
    const ok = confirm(`Delete deck "${name}"? This cannot be undone.`);
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
    saveState();
    if(liveEl) liveEl.textContent = `Deck \u201C${name}\u201D deleted.`;
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
    const deck = decks.find(d=>d.id === activeDeckId);
    if(!q){ renderCard(0); renderCardList(); return; }
    if(!deck || !deck.cards) return;
    // search the original deck cards (case-insensitive)
    const foundInDeck = deck.cards.findIndex(c => (c.front + ' ' + c.back).toLowerCase().includes(q));
    if(foundInDeck === -1){
      // show no results
      if(cardListEl) { cardListEl.innerHTML = ''; const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No cards found.'; cardListEl.appendChild(li); }
      if(frontEl) frontEl.textContent = 'No cards found'; if(backEl) backEl.textContent = '';
      return;
    }
    // map that card to currentCards order (which may be shuffled)
    const target = deck.cards[foundInDeck];
    const foundInCurrent = currentCards.findIndex(c => c.front === target.front && c.back === target.back);
    if(foundInCurrent >= 0) renderCard(foundInCurrent);
  });

  document.querySelector('.flip')?.addEventListener('click', ()=>{
    cardEl?.classList.toggle('is-flipped');
  });
  document.querySelector('.next')?.addEventListener('click', ()=>{
    if(!currentCards.length) return;
    index = (index + 1) % currentCards.length; renderCard(index);
  });
  document.querySelector('.prev')?.addEventListener('click', ()=>{
    if(!currentCards.length) return;
    index = (index - 1 + currentCards.length) % currentCards.length; renderCard(index);
  });
  // Study mode: scoped keyboard shortcuts and lifecycle
  let studyKeyHandler = null;

  function enterStudyMode(deckId){
    const deck = decks.find(d=>d.id === deckId);
    if(!deck) return;
    activeDeckId = deckId;
    // initialize cards (honoring randomize setting)
    currentCards = deck.cards.slice();
    if(randomizeOnSelect) shuffleArray(currentCards);
    index = 0;
    renderDeckList();
    const el = document.querySelector(`.deck[data-id="${deckId}"]`);
    el?.classList.add('active');
    if(deckTitleEl) deckTitleEl.textContent = deck.name;
    renderCard(0);
    renderCardList();

    studyKeyHandler = (e)=>{
      const active = document.activeElement;
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if(isTyping) return;
      if((deckModal && !deckModal.hidden) || (cardModal && !cardModal.hidden)) return;
      if(e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault(); document.querySelector('.flip')?.click();
      } else if(e.key === 'ArrowRight'){
        document.querySelector('.next')?.click();
      } else if(e.key === 'ArrowLeft'){
        document.querySelector('.prev')?.click();
      } else if(e.key === 'Escape'){
        exitStudyMode();
      }
    };
    document.addEventListener('keydown', studyKeyHandler);
  }

  function exitStudyMode(){
    if(studyKeyHandler){ document.removeEventListener('keydown', studyKeyHandler); studyKeyHandler = null; }
    // reset flip state and show current index (keeps deck selection)
    cardEl?.classList.remove('is-flipped','flipped');
    renderCard(index);
  }

  // expose for manual control/testing
  window.enterStudyMode = enterStudyMode;
  window.exitStudyMode = exitStudyMode;
});
