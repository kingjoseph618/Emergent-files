const messages = [];
const $ = (selector) => document.querySelector(selector);
const form = $("#composer");
const promptBox = $("#prompt");
const sendButton = $("#send");
const messageList = $("#messages");
const statusText = $("#status");
const dot = $("#dot");

function setStatus(text, type = "ready") {
  statusText.textContent = text;
  dot.className = type === "ready" ? "" : type;
}

function addMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;
  article.appendChild(bubble);
  messageList.appendChild(article);
  messageList.scrollTop = messageList.scrollHeight;
  return bubble;
}

async function submitMessage(text) {
  messages.push({ role: "user", content: text });
  addMessage("user", text);
  sendButton.disabled = true;
  promptBox.disabled = true;
  setStatus("Thinking locally…", "busy");
  const pending = addMessage("assistant", "Thinking…");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: $("#model").value.trim(),
        system: $("#system").value.trim(),
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The local model could not respond.");
    pending.textContent = data.reply || "Task completed with no message.";
    messages.push({ role: "assistant", content: pending.textContent });
    setStatus(`Ready · ${data.model}`);
  } catch (error) {
    pending.textContent = error.message;
    pending.parentElement.classList.add("error-message");
    setStatus("Setup required", "error");
  } finally {
    sendButton.disabled = false;
    promptBox.disabled = false;
    promptBox.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = promptBox.value.trim();
  if (!text) return;
  promptBox.value = "";
  promptBox.style.height = "auto";
  submitMessage(text);
});

promptBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

promptBox.addEventListener("input", () => {
  promptBox.style.height = "auto";
  promptBox.style.height = `${Math.min(promptBox.scrollHeight, 180)}px`;
});

$("#botName").addEventListener("input", (event) => {
  $("#title").textContent = event.target.value || "Local Bot";
});

$("#clear").addEventListener("click", () => {
  messages.length = 0;
  messageList.innerHTML = "";
  addMessage("assistant", "Conversation cleared. What would you like to do?");
  setStatus("Ready");
});
