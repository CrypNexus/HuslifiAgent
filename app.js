
const page = document.getElementById("page");
const breadcrumb = document.getElementById("breadcrumb");
const recentChats = document.getElementById("recentChats");

let chats = JSON.parse(localStorage.getItem("huslifi_chats") || "[]");
let currentChat = null;
let currentPage = "home";

function saveChats() {
  localStorage.setItem("huslifi_chats", JSON.stringify(chats));
  renderRecentChats();
}

function renderRecentChats() {
  recentChats.innerHTML = "";

  chats.slice(0, 8).forEach(chat => {
    const button = document.createElement("button");
    button.className = "recent-chat";
    button.textContent = chat.title;
    button.onclick = () => openChat(chat.id);
    recentChats.appendChild(button);
  });
}

function setActiveNavigation(name) {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === name);
  });
}

function navigate(name) {
  currentPage = name;
  currentChat = null;
  breadcrumb.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  setActiveNavigation(name);

  if (name === "home") renderHome();
  if (name === "history") renderHistory();
  if (name === "settings") renderSettings();
  if (name === "profile") renderProfile();
}

function renderHome() {
  page.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">✦</div>
      <h1>Welcome to <span>HuslifiAgent</span></h1>
      <p>Your personal AI workspace starts here.</p>
      <button class="primary-button" id="startChat">＋ Start a new chat</button>
    </div>
  `;

  document.getElementById("startChat").onclick = createChat;
}

function createChat() {
  const chat = {
    id: Date.now(),
    title: "New conversation",
    messages: []
  };

  chats.unshift(chat);
  saveChats();
  openChat(chat.id);
}

function openChat(id) {
  currentChat = chats.find(chat => chat.id === id);
  if (!currentChat) return;

  currentPage = "chat";
  breadcrumb.textContent = currentChat.title;
  setActiveNavigation("");

  renderChat();
}

function renderChat() {
  page.innerHTML = `
    <div class="chat-container">
      <div class="messages" id="messages"></div>
      <form class="chat-form" id="chatForm">
        <textarea id="messageInput" placeholder="Message HuslifiAgent..." rows="1" required></textarea>
        <button type="submit" aria-label="Send message">➤</button>
      </form>
      <p class="chat-disclaimer">HuslifiAgent 1.0 UP0 · AI responses will be added in a future update.</p>
    </div>
  `;

  const messages = document.getElementById("messages");

  currentChat.messages.forEach(message => {
    const item = document.createElement("div");
    item.className = "message " + message.role;
    item.textContent = message.text;
    messages.appendChild(item);
  });

  document.getElementById("chatForm").onsubmit = event => {
    event.preventDefault();

    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text) return;

    currentChat.messages.push({
      role: "user",
      text
    });

    if (currentChat.messages.length === 1) {
      currentChat.title = text.slice(0, 35);
    }

    saveChats();
    renderChat();
  };

  messages.scrollTop = messages.scrollHeight;
}

function renderHistory() {
  page.innerHTML = `
    <div class="section-heading">
      <h1>Chat history</h1>
      <p>Your previous conversations.</p>
    </div>
    <div class="history-list" id="historyList"></div>
  `;

  const list = document.getElementById("historyList");

  if (chats.length === 0) {
    list.textContent = "No conversations yet.";
    return;
  }

  chats.forEach(chat => {
    const button = document.createElement("button");
    button.className = "history-item";
    button.textContent = "◷  " + chat.title;
    button.onclick = () => openChat(chat.id);
    list.appendChild(button);
  });
}

function renderSettings() {
  page.innerHTML = `
    <div class="section-heading">
      <h1>Settings</h1>
      <p>Customize your HuslifiAgent experience.</p>
    </div>
    <div class="settings-card">
      <div>
        <h3>Appearance</h3>
        <p>Choose your preferred theme.</p>
      </div>
      <select id="themeSelect">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
    <div class="settings-card">
      <div>
        <h3>Application version</h3>
        <p>HuslifiAgent 1.0 UP0</p>
      </div>
    </div>
  `;

  const select = document.getElementById("themeSelect");
  select.value = document.body.classList.contains("light") ? "light" : "dark";

  select.onchange = () => setTheme(select.value);
}

function renderProfile() {
  const savedName = localStorage.getItem("huslifi_name") || "User";

  page.innerHTML = `
    <div class="section-heading">
      <h1>Your profile</h1>
      <p>Manage your personal information.</p>
    </div>
    <div class="profile-card">
      <div class="profile-avatar">U</div>
      <label for="displayName">Display name</label>
      <input id="displayName" value="${escapeHTML(savedName)}" maxlength="40">
      <button class="primary-button" id="saveProfile">Save changes</button>
      <p id="profileStatus"></p>
    </div>
  `;

  document.getElementById("saveProfile").onclick = () => {
    const name = document.getElementById("displayName").value.trim();

    if (!name) return;

    localStorage.setItem("huslifi_name", name);
    document.getElementById("profileStatus").textContent = "Profile saved!";
    document.getElementById("profileBtn").textContent = name[0].toUpperCase();
  };
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("huslifi_theme", theme);
}

document.getElementById("newChatBtn").onclick = createChat;

document.querySelectorAll("[data-page]").forEach(button => {
  button.onclick = () => navigate(button.dataset.page);
});

document.getElementById("themeBtn").onclick = () => {
  const isLight = document.body.classList.toggle("light");
  const theme = isLight ? "light" : "dark";
  localStorage.setItem("huslifi_theme", theme);
};

document.getElementById("profileBtn").onclick = () => navigate("profile");

const savedTheme = localStorage.getItem("huslifi_theme") || "dark";
setTheme(savedTheme);

const savedName = localStorage.getItem("huslifi_name") || "U";
document.getElementById("profileBtn").textContent = savedName[0].toUpperCase();

renderRecentChats();
navigate("home");
