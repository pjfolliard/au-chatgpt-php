<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/common.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title><?php echo AU_APP_NAME; ?></title>
  <link rel="stylesheet" href="assets/css/style.css"/>
</head>
<body>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="search">
        <input id="searchInput" type="text" placeholder="Search all chats…"/>
        <div id="searchResults" class="search-results" style="display:none;"></div>
      </div>

      <div class="actions">
        <button id="btnAddChat" class="btn">＋ Chat</button>
        <button id="btnAddFolder" class="btn">📁 Folder</button>
      </div>

      <div class="section-title">Your Projects & Chats</div>
      <div class="tree">
        <ul id="treeRoot"></ul>
      </div>

      <button id="adminBtn" class="logo-admin" title="Admin / Settings">
        <img src="assets/img/au-logo.png" alt="Augustana University"/>
        <span class="label">Admin</span>
      </button>
    </aside>

    <!-- Header -->
    <?php include __DIR__ . '/includes/header.php'; ?>

    <!-- Main -->
    <main class="chat">
      <div class="scroll">
        <section class="empty">
          <h2>👋 Welcome to Ask Ole</h2>
          <p>Drag chats (💬) and folders (📁) into folders to organize. Use the ⋯ menu to Rename or Delete. Search scans all chats.</p>
        </section>
        <div class="msg user">What’s the difference between AI and ML?</div>
        <div class="msg bot">AI is the broad field of building intelligent systems; ML is a subset focused on learning from data.</div>
      </div>
      <div class="composer">
        <div class="input-wrap">
          <input type="text" placeholder="Type your message here…" aria-label="Chat input"/>
        </div>
        <button class="btn-send" aria-disabled="true">Send</button>
      </div>
    </main>
  </div>

  <!-- Settings modal -->
  <div id="modalBackdrop" class="modal-backdrop"></div>
  <div id="settingsModal" class="modal">
    <div class="panel">
      <h3 style="margin:0 0 6px; color:#0E1B3B;">Admin / Settings</h3>
      <p style="color:#445;">Placeholder for SSO, theme, data export, etc.</p>
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;">
        <button id="btnClearLocal" class="btn" style="border:1px solid #DADDE2; background:#fff;">Clear Local Data</button>
        <button id="btnCloseModal" class="btn-send">Close</button>
      </div>
    </div>
  </div>

  <script src="assets/js/script.js"></script>
</body>
</html>
