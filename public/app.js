// State
let personas = [];
let selectedPersonaId = null;
let memories = [];
let snapshots = [];
let bannerDismissed = false;
let userMessageCount = 0;
let healthyUseNudgeShown = false;
let strictMode = false;
let strictModeNoticeShown = false;
let editingMemoryId = null;

// DOM Elements
let personaDropdown, personaForm, memoryForm, chatForm, memoriesList, chatMessages;
let groundingBanner, bannerDismissBtn, healthyUseNudge;
let strictModeIndicator, strictModeTurnOff;
let snapshotsSection, createSnapshotBtn, snapshotsList;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM element references
  personaDropdown = document.getElementById('persona-dropdown');
  personaForm = document.getElementById('persona-form');
  memoryForm = document.getElementById('memory-form');
  chatForm = document.getElementById('chat-form');
  memoriesList = document.getElementById('memories-list');
  chatMessages = document.getElementById('chat-messages');
  groundingBanner = document.getElementById('grounding-banner');
  bannerDismissBtn = document.getElementById('banner-dismiss');
  healthyUseNudge = document.getElementById('healthy-use-nudge');
  strictModeIndicator = document.getElementById('strict-mode-indicator');
  strictModeTurnOff = document.getElementById('strict-mode-turn-off');
  snapshotsSection = document.getElementById('snapshots-section');
  createSnapshotBtn = document.getElementById('create-snapshot-btn');
  snapshotsList = document.getElementById('snapshots-list');
  
  await loadPersonas();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  personaDropdown.addEventListener('change', handlePersonaChange);
  personaForm.addEventListener('submit', handleCreatePersona);
  memoryForm.addEventListener('submit', handleAddMemory);
  chatForm.addEventListener('submit', handleSendMessage);
  bannerDismissBtn.addEventListener('click', handleBannerDismiss);
  
  if (strictModeTurnOff) {
    strictModeTurnOff.addEventListener('click', handleStrictModeTurnOff);
  }
  
  if (createSnapshotBtn) {
    createSnapshotBtn.addEventListener('click', handleCreateSnapshot);
  }
}

// Enable strict mode
function enableStrictMode() {
  strictMode = true;
  
  if (strictModeIndicator) {
    strictModeIndicator.style.display = 'block';
  }
  
  // Show one-time notice
  if (!strictModeNoticeShown) {
    const noticeDiv = document.createElement('div');
    noticeDiv.className = 'strict-mode-notice';
    noticeDiv.textContent = "Okay, I'll stick closer to how you described them.";
    noticeDiv.setAttribute('data-testid', 'strict-mode-notice');
    
    // Insert before chat controls
    const chatControls = document.querySelector('.chat-controls');
    if (chatControls && chatControls.parentNode) {
      chatControls.parentNode.insertBefore(noticeDiv, chatControls);
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        noticeDiv.remove();
      }, 4000);
    }
    
    strictModeNoticeShown = true;
  }
}

// Handle strict mode turn off
function handleStrictModeTurnOff(event) {
  event.preventDefault();
  strictMode = false;
  
  if (strictModeIndicator) {
    strictModeIndicator.style.display = 'none';
  }
}

// Handle banner dismiss
function handleBannerDismiss() {
  bannerDismissed = true;
  groundingBanner.classList.add('hidden');
}

// Load all personas
async function loadPersonas() {
  try {
    const response = await fetch('/api/personas');
    const result = await response.json();
    
    if (result.success) {
      personas = result.data;
      populatePersonaDropdown();
      
      // Auto-select first persona
      if (personas.length > 0) {
        selectedPersonaId = personas[0].id;
        personaDropdown.value = selectedPersonaId;
        await loadPersonaDetails(selectedPersonaId);
      }
    }
  } catch (error) {
    console.error('Failed to load personas:', error);
    showError('Failed to load personas');
  }
}

// Populate persona dropdown
function populatePersonaDropdown() {
  // Clear existing options except the first placeholder
  while (personaDropdown.options.length > 1) {
    personaDropdown.remove(1);
  }
  
  personas.forEach(persona => {
    const option = document.createElement('option');
    option.value = persona.id;
    option.textContent = persona.name;
    personaDropdown.appendChild(option);
  });
}

// Handle persona selection change
async function handlePersonaChange(event) {
  const personaId = event.target.value;
  
  if (!personaId) {
    selectedPersonaId = null;
    clearPersonaInfo();
    clearMemories();
    clearSnapshots();
    clearChat();
    return;
  }
  
  selectedPersonaId = personaId;
  await loadPersonaDetails(personaId);
}

// Load persona details and memories
async function loadPersonaDetails(personaId) {
  try {
    // Clear chat immediately when switching personas
    clearChat();
    
    // Load persona info
    const personaResponse = await fetch(`/api/personas/${personaId}`);
    const personaResult = await personaResponse.json();
    
    if (personaResult.success) {
      displayPersonaInfo(personaResult.data);
    }
    
    // Load memories
    const memoriesResponse = await fetch(`/api/personas/${personaId}/memories`);
    const memoriesResult = await memoriesResponse.json();
    
    if (memoriesResult.success) {
      memories = memoriesResult.data;
      displayMemories();
    }
    
    // Load snapshots
    const snapshotsResponse = await fetch(`/api/personas/${personaId}/snapshots`);
    const snapshotsResult = await snapshotsResponse.json();
    
    if (snapshotsResult.success) {
      snapshots = snapshotsResult.data;
      displaySnapshots();
      if (snapshotsSection) {
        snapshotsSection.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Failed to load persona details:', error);
    showError('Failed to load persona details');
  }
}

// Display persona info
function displayPersonaInfo(persona) {
  document.getElementById('info-name').textContent = persona.name || '-';
  document.getElementById('info-relationship').textContent = persona.relationship || '-';
  document.getElementById('info-description').textContent = persona.description || '-';
}

// Clear persona info
function clearPersonaInfo() {
  document.getElementById('info-name').textContent = '-';
  document.getElementById('info-relationship').textContent = '-';
  document.getElementById('info-description').textContent = '-';
}

// Display memories
function displayMemories() {
  if (memories.length === 0) {
    memoriesList.innerHTML = '<p class="placeholder">No memories yet. Add some below!</p>';
    return;
  }
  
  memoriesList.innerHTML = memories.map(memory => {
    if (editingMemoryId === memory.id) {
      // Show edit form for this memory
      return `
        <div class="memory-item memory-editing" data-testid="memory-item-${memory.id}">
          <div class="memory-edit-form">
            <div class="form-group">
              <label>Category</label>
              <select id="edit-category-${memory.id}" class="edit-category" data-testid="select-edit-category-${memory.id}">
                <option value="humor" ${memory.category === 'humor' ? 'selected' : ''}>Humor</option>
                <option value="regrets" ${memory.category === 'regrets' ? 'selected' : ''}>Regrets</option>
                <option value="childhood" ${memory.category === 'childhood' ? 'selected' : ''}>Childhood</option>
                <option value="advice" ${memory.category === 'advice' ? 'selected' : ''}>Advice</option>
                <option value="personality" ${memory.category === 'personality' ? 'selected' : ''}>Personality</option>
                <option value="misc" ${memory.category === 'misc' ? 'selected' : ''}>Misc</option>
              </select>
            </div>
            <div class="form-group">
              <label>Memory Text</label>
              <textarea id="edit-text-${memory.id}" class="edit-text" rows="3" data-testid="input-edit-text-${memory.id}">${escapeHtml(memory.text)}</textarea>
            </div>
            <div class="form-group">
              <label>Weight (0.1 - 5.0)</label>
              <input type="number" id="edit-weight-${memory.id}" class="edit-weight" min="0.1" max="5.0" step="0.1" value="${memory.weight}" data-testid="input-edit-weight-${memory.id}">
            </div>
            <div class="memory-edit-error" id="edit-error-${memory.id}" style="display: none;"></div>
            <div class="memory-edit-actions">
              <button class="btn-save" data-testid="button-save-memory-${memory.id}" onclick="saveMemoryEdit('${memory.id}')">Save</button>
              <button class="btn-cancel" data-testid="button-cancel-edit-${memory.id}" onclick="cancelMemoryEdit()">Cancel</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Show normal display
      return `
        <div class="memory-item" data-testid="memory-item-${memory.id}">
          <div class="memory-header">
            <span class="memory-category">${memory.category}</span>
            <span class="memory-weight">Weight: ${memory.weight}</span>
          </div>
          <p class="memory-text">${escapeHtml(memory.text)}</p>
          <div class="memory-actions">
            <button class="memory-edit" data-testid="button-edit-memory-${memory.id}" onclick="enterMemoryEditMode('${memory.id}')">Edit</button>
            <button class="memory-delete" data-testid="button-delete-memory-${memory.id}" onclick="deleteMemory('${memory.id}')">Delete</button>
          </div>
        </div>
      `;
    }
  }).join('');
}

// Clear memories
function clearMemories() {
  memories = [];
  memoriesList.innerHTML = '<p class="placeholder">Select a persona to view memories</p>';
}

// Handle create persona
async function handleCreatePersona(event) {
  event.preventDefault();
  
  const name = document.getElementById('persona-name').value.trim();
  const relationship = document.getElementById('persona-relationship').value.trim();
  const description = document.getElementById('persona-description').value.trim();
  
  if (!name) {
    showError('Name is required');
    return;
  }
  
  try {
    const response = await fetch('/api/personas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        relationship: relationship || undefined,
        description: description || undefined
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Add to personas list
      personas.push(result.data);
      populatePersonaDropdown();
      
      // Select the new persona
      selectedPersonaId = result.data.id;
      personaDropdown.value = selectedPersonaId;
      
      // Load its details
      await loadPersonaDetails(selectedPersonaId);
      
      // Clear form
      personaForm.reset();
      
      showSuccess('Persona created successfully!');
    } else {
      showError(result.message || 'Failed to create persona');
    }
  } catch (error) {
    console.error('Failed to create persona:', error);
    showError('Failed to create persona');
  }
}

// Handle add memory
async function handleAddMemory(event) {
  event.preventDefault();
  
  if (!selectedPersonaId) {
    showError('Please select a persona first');
    return;
  }
  
  const category = document.getElementById('memory-category').value;
  const text = document.getElementById('memory-text').value.trim();
  const weight = parseFloat(document.getElementById('memory-weight').value);
  
  if (!category || !text) {
    showError('Category and memory text are required');
    return;
  }
  
  try {
    const response = await fetch(`/api/personas/${selectedPersonaId}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category,
        text,
        weight
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Add to memories list
      memories.push(result.data);
      displayMemories();
      
      // Clear form
      memoryForm.reset();
      document.getElementById('memory-weight').value = '1.0';
      
      showSuccess('Memory added successfully!');
    } else {
      showError(result.message || 'Failed to add memory');
    }
  } catch (error) {
    console.error('Failed to add memory:', error);
    showError('Failed to add memory');
  }
}

// Delete memory
async function deleteMemory(memoryId) {
  if (!selectedPersonaId) return;
  
  if (!confirm('Are you sure you want to delete this memory?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/personas/${selectedPersonaId}/memories/${memoryId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Remove from memories list
      memories = memories.filter(m => m.id !== memoryId);
      displayMemories();
      
      showSuccess('Memory deleted successfully!');
    } else {
      showError(result.message || 'Failed to delete memory');
    }
  } catch (error) {
    console.error('Failed to delete memory:', error);
    showError('Failed to delete memory');
  }
}

// Enter memory edit mode
function enterMemoryEditMode(memoryId) {
  editingMemoryId = memoryId;
  displayMemories();
}

// Cancel memory edit
function cancelMemoryEdit() {
  editingMemoryId = null;
  displayMemories();
}

// Save memory edit
async function saveMemoryEdit(memoryId) {
  if (!selectedPersonaId) return;
  
  const category = document.getElementById(`edit-category-${memoryId}`).value;
  const text = document.getElementById(`edit-text-${memoryId}`).value.trim();
  const weight = parseFloat(document.getElementById(`edit-weight-${memoryId}`).value);
  const errorDiv = document.getElementById(`edit-error-${memoryId}`);
  
  // Clear previous errors
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';
  
  // Validate
  if (!text) {
    errorDiv.textContent = 'Memory text is required';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (isNaN(weight) || weight < 0.1 || weight > 5.0) {
    errorDiv.textContent = 'Weight must be between 0.1 and 5.0';
    errorDiv.style.display = 'block';
    return;
  }
  
  try {
    const response = await fetch(`/api/personas/${selectedPersonaId}/memories/${memoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, text, weight })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update memory in list
      const memory = memories.find(m => m.id === memoryId);
      if (memory) {
        memory.category = result.data.category;
        memory.text = result.data.text;
        memory.weight = result.data.weight;
      }
      
      editingMemoryId = null;
      displayMemories();
      showSuccess('Memory updated successfully!');
    } else {
      // Show validation errors inline
      if (result.details && result.details.length > 0) {
        errorDiv.textContent = result.details.map(d => d.message).join(', ');
      } else {
        errorDiv.textContent = result.message || 'Failed to update memory';
      }
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to update memory:', error);
    errorDiv.textContent = 'Failed to update memory';
    errorDiv.style.display = 'block';
  }
}

// Display snapshots
function displaySnapshots() {
  if (!snapshotsList) return;
  
  if (snapshots.length === 0) {
    snapshotsList.innerHTML = '<p class="placeholder">No snapshots yet</p>';
    return;
  }
  
  snapshotsList.innerHTML = snapshots.map(snapshot => {
    const date = new Date(snapshot.created_at);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="snapshot-item" data-testid="snapshot-item-${snapshot.id}">
        <div class="snapshot-info">
          <div class="snapshot-name" data-testid="text-snapshot-name-${snapshot.id}">${escapeHtml(snapshot.name)}</div>
          <div class="snapshot-date">${formattedDate}</div>
        </div>
        <button class="btn-restore-snapshot" data-testid="button-restore-snapshot-${snapshot.id}" onclick="restoreSnapshot('${snapshot.id}')">Restore</button>
      </div>
    `;
  }).join('');
}

// Clear snapshots
function clearSnapshots() {
  snapshots = [];
  if (snapshotsList) {
    snapshotsList.innerHTML = '<p class="placeholder">No snapshots yet</p>';
  }
  if (snapshotsSection) {
    snapshotsSection.style.display = 'none';
  }
}

// Handle create snapshot
async function handleCreateSnapshot() {
  if (!selectedPersonaId) return;
  
  const name = prompt('Name this snapshot (optional):');
  
  // User clicked cancel
  if (name === null) {
    return;
  }
  
  try {
    const body = name && name.trim() ? { name: name.trim() } : {};
    const response = await fetch(`/api/personas/${selectedPersonaId}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    
    if (result.success) {
      snapshots.push(result.data);
      displaySnapshots();
      showSuccess('Snapshot created successfully!');
    } else {
      showError(result.message || 'Failed to create snapshot');
    }
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    showError('Failed to create snapshot');
  }
}

// Restore snapshot
async function restoreSnapshot(snapshotId) {
  if (!selectedPersonaId) return;
  
  if (!confirm('Restore this version? Current memories and settings for this persona will be replaced.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/personas/${selectedPersonaId}/snapshots/${snapshotId}/restore`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Refresh persona details, memories, and chat
      await loadPersonaDetails(selectedPersonaId);
      showSuccess('Persona restored successfully!');
    } else {
      showError(result.message || 'Failed to restore snapshot');
    }
  } catch (error) {
    console.error('Failed to restore snapshot:', error);
    showError('Failed to restore snapshot');
  }
}

// Handle send message
async function handleSendMessage(event) {
  event.preventDefault();
  
  if (!selectedPersonaId) {
    alert('Please select or create a persona first!');
    return;
  }
  
  const userMessage = document.getElementById('chat-input').value.trim();
  const emotionalState = document.getElementById('emotional-state').value;
  const toneMode = document.getElementById('tone-mode').value;
  
  if (!userMessage) {
    showError('Please enter a message');
    return;
  }
  
  // Add user message to chat
  addMessageToChat('You', userMessage, true);
  
  // Increment user message count
  userMessageCount++;
  
  // Show healthy-use nudge after 12 messages (once per session)
  if (userMessageCount >= 12 && !healthyUseNudgeShown && healthyUseNudge) {
    healthyUseNudge.style.display = 'block';
    healthyUseNudgeShown = true;
  }
  
  // Clear input
  document.getElementById('chat-input').value = '';
  
  // Show typing indicator
  const typingIndicator = addTypingIndicator();
  
  try {
    // Build request body
    const requestBody = {
      user_message: userMessage,
      persona_id: selectedPersonaId,
      emotional_state: emotionalState,
      tone_mode: toneMode
    };
    
    // Include strict_persona if strict mode is enabled
    if (strictMode) {
      requestBody.strict_persona = true;
    }
    
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    // Remove typing indicator
    typingIndicator.remove();
    
    if (result.success) {
      const personaName = result.data.meta?.persona_name || 'Persona';
      const reply = result.data.reply;
      
      // Add persona reply to chat
      addMessageToChat(personaName, reply, false);
    } else {
      showError(result.message || 'Failed to get response');
      addMessageToChat('System', 'Sorry, I could not process your message.', false);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    typingIndicator.remove();
    showError('Failed to send message');
    addMessageToChat('System', 'Sorry, there was an error processing your message.', false);
  }
}

// Add message to chat
function addMessageToChat(sender, message, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'persona'}`;
  messageDiv.setAttribute('data-testid', `message-${isUser ? 'user' : 'persona'}`);
  
  let messageHTML = `
    <div class="message-header">${escapeHtml(sender)}</div>
    <div class="message-bubble">${escapeHtml(message)}</div>
  `;
  
  // Add grounding line for persona messages (not for user or system messages)
  if (!isUser && sender !== 'System') {
    const personaName = sender;
    messageHTML += `
      <div class="message-grounding">Based on the memories you've shared about ${escapeHtml(personaName)}.</div>
    `;
  }
  
  messageDiv.innerHTML = messageHTML;
  
  // Add "Doesn't sound like them?" link for persona messages (not system messages)
  if (!isUser && sender !== 'System') {
    const strictLink = document.createElement('a');
    strictLink.href = '#';
    strictLink.className = 'strict-mode-link';
    strictLink.textContent = "Doesn't sound like them?";
    strictLink.setAttribute('data-testid', 'link-strict-mode');
    strictLink.addEventListener('click', (e) => {
      e.preventDefault();
      enableStrictMode();
    });
    messageDiv.appendChild(strictLink);
  }
  
  // Remove placeholder if exists
  const placeholder = chatMessages.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message persona';
  typingDiv.id = 'typing-indicator';
  
  typingDiv.innerHTML = `
    <div class="message-header">Typing...</div>
    <div class="message-bubble">...</div>
  `;
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return typingDiv;
}

// Clear chat
function clearChat() {
  chatMessages.innerHTML = '<p class="placeholder">Select a persona and start chatting</p>';
  
  // Reset message counter and healthy-use nudge when switching personas
  userMessageCount = 0;
  healthyUseNudgeShown = false;
  if (healthyUseNudge) {
    healthyUseNudge.style.display = 'none';
  }
  
  // Reset strict mode when switching personas
  strictMode = false;
  strictModeNoticeShown = false;
  if (strictModeIndicator) {
    strictModeIndicator.style.display = 'none';
  }
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Utility: Show error
function showError(message) {
  alert('Error: ' + message);
}

// Utility: Show success
function showSuccess(message) {
  // Simple success indication - could be improved with a toast notification
  console.log('Success:', message);
}
