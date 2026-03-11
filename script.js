/* ── Tab Switcher ── */
function switchTab(panelId, clickedBtn) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b)   { b.classList.remove('active'); });
  document.getElementById('panel-' + panelId).classList.add('active');
  clickedBtn.classList.add('active');
}

/* ── Scroll Reveal ── */
function handleReveal() {
  document.querySelectorAll('.reveal').forEach(function(el) {
    if (el.getBoundingClientRect().top < window.innerHeight - 80) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', handleReveal);
window.addEventListener('load',   handleReveal);

/* ── Blob Hover ── */
function initBlobHover() {
  document.querySelectorAll('.blob-section:not(.hero):not(.blob-footer)').forEach(function(b) {
    b.addEventListener('mouseenter', function() { this.style.transition='transform .4s ease'; this.style.transform='scale(1.012)'; });
    b.addEventListener('mouseleave', function() { this.style.transform='scale(1)'; });
  });
}

/* ── Ripple on click ── */
function initRipple() {
  document.querySelectorAll('.polaroid, .vb-polaroid, .gallery-item, .hobby-ph').forEach(function(el) {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', function() {
      var r = document.createElement('span');
      r.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,107,157,0.2);width:80px;height:80px;top:50%;left:50%;margin:-40px 0 0 -40px;pointer-events:none;animation:ripple .5s ease-out forwards;';
      this.appendChild(r);
      setTimeout(function() { r.remove(); }, 600);
    });
  });
}

/* ── Mouse Parallax ── */
function initParallax() {
  document.addEventListener('mousemove', function(e) {
    var xR = (e.clientX / window.innerWidth)  - 0.5;
    var yR = (e.clientY / window.innerHeight) - 0.5;
    document.querySelectorAll('.deco').forEach(function(d, i) {
      var depth = ((i % 3) + 1) * 0.4;
      d.style.transform = 'translateX('+(xR*depth*10)+'px) translateY('+(yR*depth*10)+'px)';
    });
  });
}

/* ── PUZZLE LOGIC ── */
(function() {
  var COLS = 3, ROWS = 3, TOTAL = COLS * ROWS;
  var placed = 0;

  var PUZZLE_IMAGE = 'Content/puzzle.jpg';

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  window.addEventListener('load', function() {
    buildPuzzle(PUZZLE_IMAGE);
  });

  function buildPuzzle(src) {
    document.getElementById('puzzle-area').style.display = 'flex';

    var tray  = document.getElementById('pieces-tray');
    var board = document.getElementById('puzzle-board');
    tray.innerHTML  = '';
    board.innerHTML = '';
    placed = 0;

    var gridStyle = 'grid-template-columns: repeat(' + COLS + ', 90px);';
    tray.style.cssText  += gridStyle;
    board.style.cssText += gridStyle;

    var order = shuffle([0,1,2,3,4,5,6,7,8]);

    /* Drop slots */
    for (var i = 0; i < TOTAL; i++) {
      var slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = i;
      /* Mouse events */
      slot.addEventListener('dragover',  onDragOver);
      slot.addEventListener('dragleave', onDragLeave);
      slot.addEventListener('drop',      onDrop);
      board.appendChild(slot);
    }

    /* Shuffled pieces in tray */
    order.forEach(function(idx) {
      tray.appendChild(makePiece(src, idx));
    });
  }

  function makePiece(src, idx) {
    var col = idx % COLS;
    var row = Math.floor(idx / COLS);
    var piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.dataset.index = idx;
    piece.style.backgroundImage    = 'url(' + src + ')';
    piece.style.backgroundSize     = (COLS * 100) + '% ' + (ROWS * 100) + '%';
    piece.style.backgroundPosition = (col * 100 / (COLS - 1)) + '% ' + (row * 100 / (ROWS - 1)) + '%';

    piece.addEventListener('dragstart', onDragStart);
    piece.addEventListener('dragend',   onDragEnd);

    piece.addEventListener('touchstart', onTouchStart, { passive: false });
    piece.addEventListener('touchmove',  onTouchMove,  { passive: false });
    piece.addEventListener('touchend',   onTouchEnd,   { passive: false });

    return piece;
  }

  var dragged = null;

  function onDragStart(e) {
    dragged = e.currentTarget;
    dragged.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragEnd() {
    if (dragged) dragged.classList.remove('dragging');
  }
  function onDragOver(e) {
    e.preventDefault();
    if (!e.currentTarget.classList.contains('filled')) e.currentTarget.classList.add('over');
  }
  function onDragLeave(e) { e.currentTarget.classList.remove('over'); }

  function onDrop(e) {
    e.preventDefault();
    var slot = e.currentTarget;
    slot.classList.remove('over');
    if (!dragged || slot.classList.contains('filled')) return;
    tryPlace(dragged, slot);
  }

  var touchPiece  = null;   
  var touchClone  = null;  
  var touchOffset = { x: 0, y: 0 };

  function onTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    touchPiece = e.currentTarget;
    touchPiece.classList.add('dragging');

    /* Create a floating clone that follows the finger */
    touchClone = touchPiece.cloneNode(true);
    var rect = touchPiece.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;

    touchClone.style.cssText +=
      'position:fixed;z-index:9999;pointer-events:none;opacity:0.85;' +
      'width:' + rect.width + 'px;height:' + rect.height + 'px;' +
      'left:' + (touch.clientX - touchOffset.x) + 'px;' +
      'top:'  + (touch.clientY - touchOffset.y) + 'px;' +
      'margin:0;';
    document.body.appendChild(touchClone);
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!touchClone) return;
    var touch = e.touches[0];
    touchClone.style.left = (touch.clientX - touchOffset.x) + 'px';
    touchClone.style.top  = (touch.clientY - touchOffset.y) + 'px';

    /* Highlight slot under finger */
    touchClone.style.display = 'none';
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    touchClone.style.display = '';
    document.querySelectorAll('.slot').forEach(function(s) { s.classList.remove('over'); });
    var slot = el ? el.closest('.slot') : null;
    if (slot && !slot.classList.contains('filled')) slot.classList.add('over');
  }

  function onTouchEnd(e) {
    e.preventDefault();
    if (!touchPiece) return;

    var touch = e.changedTouches[0];

    if (touchClone) { touchClone.style.display = 'none'; }
    var el   = document.elementFromPoint(touch.clientX, touch.clientY);
    var slot = el ? el.closest('.slot') : null;
    if (touchClone) { touchClone.style.display = ''; }

    document.querySelectorAll('.slot').forEach(function(s) { s.classList.remove('over'); });

    if (slot && !slot.classList.contains('filled')) {
      dragged = touchPiece;
      tryPlace(touchPiece, slot);
    }

    touchPiece.classList.remove('dragging');
    if (touchClone) { touchClone.remove(); touchClone = null; }
    touchPiece = null;
  }

  function tryPlace(piece, slot) {
    if (parseInt(piece.dataset.index) === parseInt(slot.dataset.index)) {
      var clone = piece.cloneNode(true);
      clone.draggable = false;
      clone.style.width = '100%'; clone.style.height = '100%';
      clone.style.cursor = 'default';
      clone.style.pointerEvents = 'none';
      slot.appendChild(clone);
      slot.classList.add('filled');
      piece.style.visibility = 'hidden';
      piece.draggable = false;
      placed++;
      updateProgress();
      if (placed === TOTAL) showWin();
    } else {
      slot.style.borderColor = '#ff4d4d';
      setTimeout(function() { slot.style.borderColor = ''; }, 500);
    }
  }

  function updateProgress() {
    document.getElementById('progress-bar').style.width = (placed / TOTAL * 100) + '%';
    document.getElementById('progress-text').textContent = placed + ' / ' + TOTAL + ' pieces placed';
  }

  function showWin() {
    document.getElementById('puzzle-area').style.display = 'none';
    document.getElementById('win-screen').style.display = 'flex';
  }
})();

function revealProfile() {
  var overlay = document.getElementById('puzzle-overlay');
  overlay.classList.add('hidden');
  handleReveal();
}

document.addEventListener('DOMContentLoaded', function() {
  initBlobHover();
  initRipple();
  initParallax();
  var s = document.createElement('style');
  s.textContent = '@keyframes ripple { to { transform:scale(3); opacity:0; } }';
  document.head.appendChild(s);
});