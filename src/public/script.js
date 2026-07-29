const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadStatus = document.getElementById('upload-status');

const chatForm = document.getElementById('chat-form');
const questionInput = document.getElementById('question-input');
const askBtn = document.getElementById('ask-btn');
const chatMessages = document.getElementById('chat-messages');

let hasDocuments = false;

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return;

  uploadBtn.disabled = true;
  uploadStatus.textContent = `Processing "${file.name}"... this may take a moment.`;

  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    uploadStatus.textContent = `"${data.filename}" ready (${data.chunksStored} chunks indexed).`;
    hasDocuments = true;
    fileInput.value = '';

    if (chatMessages.querySelector('.empty-state')) {
      chatMessages.innerHTML = '';
    }
  } catch (error) {
    uploadStatus.textContent = `Error: ${error.message}`;
  } finally {
    uploadBtn.disabled = false;
  }
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  questionInput.value = '';
  askBtn.disabled = true;

  const loadingId = addMessage('Thinking...', 'ai');

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get an answer');
    }

    updateMessage(loadingId, data.answer, data.sources);
  } catch (error) {
    updateMessage(loadingId, `Error: ${error.message}`, []);
  } finally {
    askBtn.disabled = false;
  }
});

function addMessage(text, sender) {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const bubble = document.createElement('div');
  bubble.className = `message ${sender}`;
  bubble.id = messageId;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageId;
}

function updateMessage(messageId, text, sources) {
  const bubble = document.getElementById(messageId);
  if (!bubble) return;

  bubble.textContent = text;

  if (sources && sources.length > 0) {
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';
    sourcesDiv.innerHTML = '<strong>Sources:</strong>';

    sources.forEach((source, i) => {
      const sourceItem = document.createElement('div');
      sourceItem.className = 'source-item';
      sourceItem.textContent = `[${i + 1}] ${source.filename} (chunk ${source.chunkIndex}): "${source.text}..."`;
      sourcesDiv.appendChild(sourceItem);
    });

    bubble.appendChild(sourcesDiv);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}