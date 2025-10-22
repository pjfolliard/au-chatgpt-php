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
      <button id="sidebarToggle" class="sidebar-toggle" type="button" aria-expanded="true" aria-label="Collapse sidebar">◀</button>
      <div class="sidebar-section">
        <div class="section-heading">Navigation</div>
        <button id="btnAddChat" class="sidebar-btn primary">New chat</button>
        <label class="search-field" for="searchInput">
          <span class="icon">🔍</span>
          <input id="searchInput" type="text" placeholder="Search chats"/>
        </label>
        <div id="searchResults" class="search-results" style="display:none;"></div>
      </div>

      <div class="sidebar-section">
        <div class="section-heading">GPTs</div>
        <button class="sidebar-btn">Explore</button>
        <button class="sidebar-btn">Make New GPT</button>
      </div>

      <div class="sidebar-section projects">
        <div class="section-heading">Projects</div>
        <button id="btnAddFolder" class="sidebar-btn">New project</button>
        <div class="project-tree">
          <ul id="treeRoot"></ul>
        </div>
      </div>

      <button id="adminBtn" class="logo-admin" type="button" title="Admin / Settings" aria-label="Admin / Settings">
        <img src="assets/img/au-logo.png" alt="Augustana University"/>
      </button>
    </aside>

    <div class="main-panel">
      <?php include __DIR__ . '/includes/header.php'; ?>

      <main class="editor">
        <div class="conversation">
          <section class="empty-state">
            <h2 class="empty-state-heading">
              <img src="assets/img/au-logo.png" alt="Augustana University Viking logo" class="welcome-logo" />
              <span>Welcome to Ask Ole</span>
            </h2>
            <p>Organize conversations within projects, collaborate with teammates, and keep track of linked resources.</p>
          </section>
          <div class="msg user">What’s the difference between AI and ML?</div>
          <div class="msg bot">AI is the broad field of building intelligent systems, while ML is a subset focused on learning from data.</div>
        </div>
      </main>

      <footer class="composer">
        <div id="attachmentChips" class="chip-tray" aria-live="polite" hidden></div>
        <div class="composer-main">
          <button id="attachTrigger" class="icon-button attach-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="attachMenu">＋</button>
          <div class="input-wrap">
            <input id="chatInput" type="text" placeholder="Ask anything" aria-label="Chat input"/>
          </div>
          <label class="toggle-field composer-toggle" for="searchWebToggle">
            <input id="searchWebToggle" type="checkbox" checked />
            <span class="switch" aria-hidden="true"></span>
            <span class="label">Search the Web</span>
          </label>
          <button class="icon-button voice-btn" type="button" aria-label="Voice input">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <path d="M9 12.75C10.6569 12.75 12 11.4069 12 9.75V4.5C12 2.84315 10.6569 1.5 9 1.5C7.34315 1.5 6 2.84315 6 4.5V9.75C6 11.4069 7.34315 12.75 9 12.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.25 8.25V9.75C14.25 12.2353 12.2353 14.25 9.75 14.25H8.25C5.76472 14.25 3.75 12.2353 3.75 9.75V8.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 14.25V16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div id="attachMenu" class="upload-menu" role="menu" aria-hidden="true">
          <button type="button" class="menu-item" data-accept=".ppt,.pptx" role="menuitem">Upload PowerPoint</button>
          <button type="button" class="menu-item" data-accept=".doc,.docx" role="menuitem">Upload Word Document</button>
          <button type="button" class="menu-item" data-accept=".xls,.xlsx" role="menuitem">Upload Excel Spreadsheet</button>
          <button type="button" class="menu-item" data-accept=".csv" role="menuitem">Upload CSV</button>
          <button type="button" class="menu-item" data-accept=".pdf" role="menuitem">Upload PDF</button>
        </div>
        <input type="file" id="filePicker" class="visually-hidden" />
      </footer>
    </div>
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
