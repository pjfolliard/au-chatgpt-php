
(function() {
  const STORAGE_KEY = 'askOleTree/v3php';

  const state = {
    tree: loadTree(),
    dragging: null, // {id,type}
    query: ''
  };

  function loadTree() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    // initial data
    return {
      id: 'root',
      type: 'root',
      name: 'ROOT',
      expanded: true,
      children: [
        { id: 'f-classes', type: 'folder', name: 'Classes', expanded: true,
          children: [
            { id: 'c-cs210', type: 'chat', name: 'CS 210 study tips' },
            { id: 'c-engl101', type: 'chat', name: 'ENGL 101 outline' },
          ]
        },
        { id: 'f-campus', type: 'folder', name: 'Campus', expanded: true,
          children: [{ id: 'c-library', type: 'chat', name: 'Library hours' }]
        },
        { id: 'c-ai-ml', type: 'chat', name: 'AI vs ML' }
      ]
    };
  }
  function saveTree() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tree));
  }
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function findPathById(node, id, path=[]) {
    if (!node) return null;
    if (node.id === id) return path.concat(node);
    if ((node.type === 'folder' || node.type === 'root') && node.children) {
      for (const ch of node.children) {
        const found = findPathById(ch, id, path.concat(node));
        if (found) return found;
      }
    }
    return null;
  }
  function removeNodeById(node, id) {
    if ((node.type !== 'folder' && node.type !== 'root') || !node.children) return null;
    const idx = node.children.findIndex(c => c.id === id);
    if (idx !== -1) {
      const removed = node.children.splice(idx, 1)[0];
      return removed;
    }
    for (const ch of node.children) {
      if (ch.type === 'folder') {
        const r = removeNodeById(ch, id);
        if (r) return r;
      }
    }
    return null;
  }
  function insertIntoFolderById(node, folderId, childNode) {
    const path = findPathById(node, folderId);
    const folder = path ? path[path.length-1] : null;
    if (!folder || (folder.type !== 'folder' && folder.type !== 'root')) return false;
    folder.children = folder.children || [];
    folder.children.push(childNode);
    if (folder.type === 'folder') folder.expanded = true;
    return true;
  }
  function isDescendant(tree, possibleAncestorId, targetId) {
    const path = findPathById(tree, targetId);
    if (!path) return false;
    return path.some(n => n.id === possibleAncestorId);
  }
  function listAllChats(node, acc=[], curr=[]) {
    if (!node) return acc;
    const here = node.type === 'root' ? curr : curr.concat(node.name);
    if (node.type === 'chat') acc.push({ id: node.id, name: node.name, path: (here.slice(0,-1).join(' / ') || 'Root') });
    if ((node.type === 'folder' || node.type === 'root') && node.children) {
      for (const ch of node.children) listAllChats(ch, acc, here);
    }
    return acc;
  }

  // DOM refs
  const el = {
    tree: document.getElementById('treeRoot'),
    addChat: document.getElementById('btnAddChat'),
    addFolder: document.getElementById('btnAddFolder'),
    search: document.getElementById('searchInput'),
    results: document.getElementById('searchResults'),
    adminBtn: document.getElementById('adminBtn'),
    modal: document.getElementById('settingsModal'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    clearLocal: document.getElementById('btnClearLocal'),
    closeModal: document.getElementById('btnCloseModal')
  };

  function uid(prefix) { return prefix + '-' + Math.random().toString(36).slice(2,8); }

  function addTop(kind) {
    const child = { id: uid(kind), type: kind, name: kind==='folder'?'New Folder':'Untitled Chat' };
    if (kind === 'folder') { child.expanded = true; child.children = []; }
    const next = clone(state.tree);
    next.children.push(child);
    state.tree = next;
    saveTree();
    render();
  }

  function render() {
    // render tree (all top-level children; hidden root)
    el.tree.innerHTML = '';
    (state.tree.children || []).forEach(ch => {
      el.tree.appendChild(renderNode(ch, (updated) => {
        const next = clone(state.tree);
        const i = next.children.findIndex(c => c.id === ch.id);
        if (updated === null) next.children.splice(i,1); else next.children[i] = updated;
        state.tree = next; saveTree(); render();
      }));
    });

    // render search results
    const q = state.query.trim().toLowerCase();
    el.results.innerHTML = '';
    if (q) {
      const hits = listAllChats(state.tree).filter(c => c.name.toLowerCase().includes(q));
      if (hits.length === 0) {
        const row = document.createElement('div'); row.className = 'row'; row.textContent = 'No matches';
        el.results.appendChild(row);
      } else {
        hits.forEach(h => {
          const row = document.createElement('div'); row.className = 'row';
          row.innerHTML = `<div class="title">${h.name}</div><div class="path">${h.path}</div>`;
          el.results.appendChild(row);
        });
      }
      el.results.style.display = 'block';
    } else {
      el.results.style.display = 'none';
    }
  }

  // Render one node (recursive)
  function renderNode(node, onChange) {
    const li = document.createElement('li');

    const row = document.createElement('div');
    row.className = 'node';
    // drag over styling handled on row element
    row.addEventListener('dragover', (e) => {
      if (node.type !== 'folder') return;
      if (!state.dragging) return;
      if (state.dragging.type === 'folder' && state.dragging.id === node.id) return;
      e.preventDefault();
      row.classList.add('drag-target');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-target'));
    row.addEventListener('drop', (e) => {
      if (node.type !== 'folder') return;
      e.preventDefault();
      row.classList.remove('drag-target');
      const payload = state.dragging;
      if (!payload) return;
      if (payload.type === 'folder' && isDescendant(state.tree, payload.id, node.id)) return;
      const next = clone(state.tree);
      const removed = removeNodeById(next, payload.id);
      if (!removed) return;
      insertIntoFolderById(next, node.id, removed);
      state.tree = next; saveTree(); render();
      state.dragging = null;
    });

    // toggle
    const toggle = document.createElement('button');
    toggle.className = 'toggle';
    toggle.title = node.type === 'folder' ? 'Expand/Collapse' : '';
    toggle.textContent = node.type === 'folder' ? (node.expanded ? '▾' : '▸') : '•';
    toggle.addEventListener('click', () => {
      if (node.type !== 'folder') return;
      const updated = clone(node);
      updated.expanded = !updated.expanded;
      onChange(updated);
    });
    row.appendChild(toggle);

    // type icon
    const icon = document.createElement('span');
    icon.className = 'type';
    icon.textContent = node.type === 'folder' ? '📁' : '💬';
    row.appendChild(icon);

    // name (editable on rename)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = node.name;
    // drag source
    if (node.type === 'chat' || node.type === 'folder') {
      nameSpan.setAttribute('draggable', 'true');
      nameSpan.addEventListener('dragstart', () => {
        state.dragging = { id: node.id, type: node.type };
      });
      nameSpan.addEventListener('dragend', () => { state.dragging = null; });
    }
    row.appendChild(nameSpan);

    // kebab (rename/delete)
    const kebabBtn = document.createElement('button');
    kebabBtn.className = 'menu';
    kebabBtn.textContent = '⋯';
    kebabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showKebab(kebabBtn, {
        onRename: () => beginRename(),
        onDelete: () => onChange(null),
      });
    });
    row.appendChild(kebabBtn);

    li.appendChild(row);

    // children
    if (node.type === 'folder' && node.expanded) {
      const ul = document.createElement('ul');
      (node.children || []).forEach((child, idx) => {
        ul.appendChild(renderNode(child, (updated) => {
          const next = clone(node);
          if (updated === null) next.children.splice(idx,1);
          else next.children[idx] = updated;
          onChange(next);
        }));
      });
      li.appendChild(ul);
    }

    // inline rename handler
    function beginRename() {
      const input = document.createElement('input');
      input.value = node.name;
      input.className = 'name-edit';
      input.style.cssText = 'flex:1; min-width:0; background:#fff; color:#0E1B3B; border:1px solid #DADDE2; border-radius:6px; padding:4px 6px; font-size:0.9rem;';
      row.replaceChild(input, nameSpan);
      input.focus();
      const commit = (apply) => {
        if (!apply) { row.replaceChild(nameSpan, input); return; }
        const v = input.value.trim();
        const updated = clone(node);
        if (v) updated.name = v;
        row.replaceChild(nameSpan, input);
        onChange(updated);
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commit(true);
        if (e.key === 'Escape') commit(false);
      });
      input.addEventListener('blur', () => commit(true));
    }

    return li;
  }

  // Simple kebab menu
  let kebabEl = null;
  function showKebab(anchor, { onRename, onDelete }) {
    hideKebab();
    const rect = anchor.getBoundingClientRect();
    kebabEl = document.createElement('div');
    kebabEl.className = 'kebab';
    kebabEl.style.left = (rect.left - 110) + 'px';
    kebabEl.style.top = (rect.top + 24 + window.scrollY) + 'px';
    kebabEl.innerHTML = '<button data-act="rename">Rename</button><button class="danger" data-act="delete">Delete</button>';
    document.body.appendChild(kebabEl);
    const close = (e) => {
      if (kebabEl && !kebabEl.contains(e.target) && e.target !== anchor) hideKebab();
    };
    setTimeout(() => document.addEventListener('mousedown', close), 0);
    kebabEl.addEventListener('click', (e) => {
      const act = e.target.getAttribute('data-act');
      if (act === 'rename') onRename();
      if (act === 'delete') onDelete();
      hideKebab();
    });
  }
  function hideKebab() {
    if (kebabEl) {
      kebabEl.remove();
      kebabEl = null;
      document.removeEventListener('mousedown', hideKebab);
    }
  }

  // Wire up UI actions
  el.addChat.addEventListener('click', () => addTop('chat'));
  el.addFolder.addEventListener('click', () => addTop('folder'));
  el.search.addEventListener('input', (e) => { state.query = e.target.value; render(); });

  // Admin modal
  function toggleModal(show) {
    el.modal.classList.toggle('show', show);
    el.modalBackdrop.classList.toggle('show', show);
  }
  el.adminBtn.addEventListener('click', () => toggleModal(true));
  el.modalBackdrop.addEventListener('click', () => toggleModal(false));
  el.closeModal.addEventListener('click', () => toggleModal(false));
  el.clearLocal.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); location.reload(); });

  // Initial render
  render();
})();
