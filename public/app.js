// State
let personas = [];
let selectedPersonaId = null;
let memories = [];

// DOM Elements
const personaDropdown = document.getElementById('persona-dropdown');
const personaForm = document.getElementById('persona-form');
const memoryForm = document.getElementById('memory-form');
const chatForm = document.getElementById('chat-form');
const memoriesList = document.getElementById('memories-list');
const chatMessages = document.getElementById('chat-messages');

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await loadPersonas();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  personaDropdown.addEventListener('change', handlePersonaChange);
  personaForm.addEventListener('submit', handleCreatePersona);
  memoryForm.addEventListener('submit', handleAddMemory);
  chatForm.addEventListener('submit', handleSendMessage);
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
    clearChat();
    return;
  }
  
  selectedPersonaId = personaId;
  await loadPersonaDetails(personaId);
}

// Load persona details and memories
async function loadPersonaDetails(personaId) {
  try {
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
    
    // Clear chat when switching personas
    clearChat();
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
  
  memoriesList.innerHTML = memories.map(memory => `
    <div class="memory-item" data-testid="memory-item-${memory.id}">
      <div class="memory-header">
        <span class="memory-category">${memory.category}</span>
        <span class="memory-weight">Weight: ${memory.weight}</span>
      </div>
      <p class="memory-text">${escapeHtml(memory.text)}</p>
      <button class="memory-delete" data-testid="button-delete-memory-${memory.id}" onclick="deleteMemory('${memory.id}')">Delete</button>
    </div>
  `).join('');
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
  
  // Clear input
  document.getElementById('chat-input').value = '';
  
  // Show typing indicator
  const typingIndicator = addTypingIndicator();
  
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_message: userMessage,
        persona_id: selectedPersonaId,
        emotional_state: emotionalState,
        tone_mode: toneMode
      })
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
  
  messageDiv.innerHTML = `
    <div class="message-header">${escapeHtml(sender)}</div>
    <div class="message-bubble">${escapeHtml(message)}</div>
  `;
  
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
