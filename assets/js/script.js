
(function() {
  const STORAGE_KEY = 'askOleTree/v3php';

  const state = {
    tree: loadTree(),
    dragging: null, // {id,type}
    query: ''
  };

  const attachments = [];

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
    settingsTrigger: document.getElementById('settingsTrigger'),
    modal: document.getElementById('settingsModal'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    clearLocal: document.getElementById('btnClearLocal'),
    closeModal: document.getElementById('btnCloseModal'),
    attachTrigger: document.getElementById('attachTrigger'),
    attachMenu: document.getElementById('attachMenu'),
    filePicker: document.getElementById('filePicker'),
    chipTray: document.getElementById('attachmentChips'),
    appShell: document.querySelector('.app'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    chatInput: document.getElementById('chatInput'),
    conversation: document.querySelector('.conversation')
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
    
    // If it's a new chat, focus on the input and prepare for auto-naming
    if (kind === 'chat' && el.chatInput) {
      el.chatInput.focus();
      // Store the chat ID for auto-naming when first message is sent
      state.currentChatId = child.id;
    }
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
  if (el.adminBtn) el.adminBtn.addEventListener('click', () => toggleModal(true));
  if (el.settingsTrigger) el.settingsTrigger.addEventListener('click', () => toggleModal(true));
  el.modalBackdrop.addEventListener('click', () => toggleModal(false));
  el.closeModal.addEventListener('click', () => toggleModal(false));
  el.clearLocal.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); location.reload(); });

  function renderAttachments() {
    const tray = el.chipTray;
    if (!tray) return;
    tray.innerHTML = '';
    if (attachments.length === 0) {
      tray.classList.remove('has-items');
      tray.setAttribute('hidden', '');
      return;
    }
    attachments.forEach((file) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.setAttribute('data-id', file.id);
      chip.setAttribute('aria-label', `Remove ${file.name}`);
      const label = document.createElement('span');
      label.className = 'chip-label';
      label.textContent = file.name;
      const close = document.createElement('span');
      close.className = 'chip-close';
      close.setAttribute('aria-hidden', 'true');
      close.textContent = '✕';
      chip.appendChild(label);
      chip.appendChild(close);
      chip.addEventListener('click', () => {
        const idx = attachments.findIndex((item) => item.id === file.id);
        if (idx !== -1) {
          attachments.splice(idx, 1);
          renderAttachments();
        }
      });
      tray.appendChild(chip);
    });
    tray.classList.add('has-items');
    tray.removeAttribute('hidden');
  }

  // Attachment launcher menu
  if (el.attachTrigger && el.attachMenu) {
    const trigger = el.attachTrigger;
    const menu = el.attachMenu;
    const fileInput = el.filePicker;

    const setOpen = (open) => {
      menu.classList.toggle('show', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = !menu.classList.contains('show');
      setOpen(next);
      if (next) {
        const firstItem = menu.querySelector('.menu-item');
        firstItem && firstItem.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!menu.classList.contains('show')) return;
      if (menu.contains(e.target) || trigger.contains(e.target)) return;
      setOpen(false);
    });

    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });

    menu.querySelectorAll('[data-accept]').forEach((btn) => {
      btn.setAttribute('tabindex', '0');
      btn.addEventListener('click', () => {
        if (fileInput) {
          fileInput.value = '';
          fileInput.setAttribute('accept', btn.getAttribute('data-accept') || '');
          fileInput.click();
        }
        setOpen(false);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  if (el.filePicker) {
    el.filePicker.addEventListener('change', (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      files.forEach((file) => {
        const fileId = uid('file');
        attachments.push({ id: fileId, name: file.name, file: file });
        
        // If it's a markdown file, read and display its content
        if (file.name.toLowerCase().endsWith('.md')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;
            displayMarkdownContent(content, file.name);
          };
          reader.readAsText(file);
        }
      });
      event.target.value = '';
      renderAttachments();
    });
  }

  // Display markdown content in the conversation
  function displayMarkdownContent(content, filename) {
    if (!el.conversation) return;
    
    // Hide empty state if visible
    const emptyState = el.conversation.querySelector('.empty-state');
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Create a message container for the markdown content
    const markdownMsg = document.createElement('div');
    markdownMsg.className = 'msg bot markdown-content';
    
    // Add filename header
    const header = document.createElement('div');
    header.style.cssText = 'font-weight: 600; margin-bottom: 12px; color: var(--au-navy-dark); border-bottom: 1px solid var(--au-border); padding-bottom: 8px;';
    header.textContent = `📄 ${filename}`;
    markdownMsg.appendChild(header);
    
    // Parse and render markdown content
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = marked.parse(content);
    markdownMsg.appendChild(contentDiv);
    
    el.conversation.appendChild(markdownMsg);
    
    // Scroll to bottom
    el.conversation.scrollTop = el.conversation.scrollHeight;
  }

  function updateSidebarToggle() {
    if (!el.sidebarToggle || !el.appShell) return;
    const collapsed = el.appShell.classList.contains('sidebar-collapsed');
    el.sidebarToggle.textContent = collapsed ? '▶' : '◀';
    el.sidebarToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    el.sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  }

  if (el.sidebarToggle && el.appShell) {
    el.sidebarToggle.addEventListener('click', () => {
      el.appShell.classList.toggle('sidebar-collapsed');
      updateSidebarToggle();
    });
    updateSidebarToggle();
  }

  // Chat input handling
  if (el.chatInput) {
    // Auto-resize textarea
    function autoResize() {
      const textarea = el.chatInput;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    el.chatInput.addEventListener('input', autoResize);

    // Keyboard handling
    el.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift+Enter: Allow line break (default behavior)
          return;
        } else {
          // Enter: Submit message
          e.preventDefault();
          const message = el.chatInput.value.trim();
          if (message) {
            sendMessage(message);
            el.chatInput.value = '';
            autoResize();
          }
        }
      }
    });
  }

  // Send message function
  function sendMessage(message) {
    if (!el.conversation) return;
    
    // Hide empty state if visible
    const emptyState = el.conversation.querySelector('.empty-state');
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.textContent = message;
    el.conversation.appendChild(userMsg);

    // Scroll to bottom
    el.conversation.scrollTop = el.conversation.scrollHeight;

    // Auto-name chat if this is the first message
    if (state.currentChatId && message.trim()) {
      generateChatName(message).then(name => {
        updateChatName(state.currentChatId, name);
        state.currentChatId = null; // Clear after naming
      }).catch(err => {
        console.error('Failed to generate chat name:', err);
        state.currentChatId = null;
      });
    }

    // Add bot response (placeholder for now)
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.innerHTML = marked.parse('I received your message: "' + message + '"');
    el.conversation.appendChild(botMsg);

    // Scroll to bottom again
    el.conversation.scrollTop = el.conversation.scrollHeight;
  }

  // Generate chat name using API
  async function generateChatName(query) {
    try {
      const response = await fetch('api/generate_chat_name.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate chat name');
      }
      
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error('Error generating chat name:', error);
      return 'New Chat';
    }
  }

  // Update chat name in the tree
  function updateChatName(chatId, newName) {
    const next = clone(state.tree);
    const chat = findChatById(next, chatId);
    if (chat) {
      chat.name = newName;
      state.tree = next;
      saveTree();
      render();
    }
  }

  // Find chat by ID in the tree
  function findChatById(node, id) {
    if (!node) return null;
    if (node.id === id && node.type === 'chat') return node;
    if ((node.type === 'folder' || node.type === 'root') && node.children) {
      for (const child of node.children) {
        const found = findChatById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Initial render
  render();
})();
