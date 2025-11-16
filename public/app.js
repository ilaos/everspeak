// State
let personas = [];
let selectedPersonaId = null;
let memories = [];
let snapshots = [];
let settings = null;
let bannerDismissed = false;
let userMessageCount = 0;
let healthyUseNudgeShown = false;
let strictMode = false;
let strictModeNoticeShown = false;
let editingMemoryId = null;
let wizardCurrentStep = 1;

// DOM Elements
let personaDropdown, personaForm, memoryForm, chatForm, memoriesList, chatMessages;
let groundingBanner, bannerDismissBtn, healthyUseNudge;
let strictModeIndicator, strictModeTurnOff;
let snapshotsSection, createSnapshotBtn, snapshotsList;
let settingsSection, toneModeSelect, saveSettingsBtn, settingsFeedback;
let humorSlider, honestySlider, sentimentalitySlider, energySlider, adviceSlider;
let humorValue, honestyValue, sentimentalityValue, energyValue, adviceValue;
let avoidRegretSpirals, noParanormalLanguage, softenSensitiveTopics, preferReassurance;
let bulkImportBtn, bulkImportModal, bulkImportForm, closeBulkImport, cancelBulkImport;
let wizardSection, setupWizardBtn, wizardModal, wizardForm, closeWizard, wizardPrev, wizardNext, wizardGenerate;
let wizardProgressFill, wizardCurrentStepText;

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
  
  // Settings elements
  settingsSection = document.getElementById('settings-section');
  toneModeSelect = document.getElementById('tone-mode-select');
  saveSettingsBtn = document.getElementById('save-settings-btn');
  settingsFeedback = document.getElementById('settings-feedback');
  
  // Sliders and their value displays
  humorSlider = document.getElementById('humor-slider');
  honestySlider = document.getElementById('honesty-slider');
  sentimentalitySlider = document.getElementById('sentimentality-slider');
  energySlider = document.getElementById('energy-slider');
  adviceSlider = document.getElementById('advice-slider');
  
  humorValue = document.getElementById('humor-value');
  honestyValue = document.getElementById('honesty-value');
  sentimentalityValue = document.getElementById('sentimentality-value');
  energyValue = document.getElementById('energy-value');
  adviceValue = document.getElementById('advice-value');
  
  // Boundary checkboxes
  avoidRegretSpirals = document.getElementById('avoid-regret-spirals');
  noParanormalLanguage = document.getElementById('no-paranormal-language');
  softenSensitiveTopics = document.getElementById('soften-sensitive-topics');
  preferReassurance = document.getElementById('prefer-reassurance');
  
  // Bulk import elements
  bulkImportBtn = document.getElementById('bulk-import-btn');
  bulkImportModal = document.getElementById('bulk-import-modal');
  bulkImportForm = document.getElementById('bulk-import-form');
  closeBulkImport = document.getElementById('close-bulk-import');
  cancelBulkImport = document.getElementById('cancel-bulk-import');
  
  // Wizard elements
  wizardSection = document.getElementById('wizard-section');
  setupWizardBtn = document.getElementById('setup-wizard-btn');
  wizardModal = document.getElementById('wizard-modal');
  wizardForm = document.getElementById('wizard-form');
  closeWizard = document.getElementById('close-wizard');
  wizardPrev = document.getElementById('wizard-prev');
  wizardNext = document.getElementById('wizard-next');
  wizardGenerate = document.getElementById('wizard-generate');
  wizardProgressFill = document.getElementById('wizard-progress-fill');
  wizardCurrentStepText = document.getElementById('wizard-current-step');
  
  await loadPersonas();
  await loadJournalEntries();
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
  
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', handleSaveSettings);
  }
  
  // Slider value updates
  if (humorSlider) {
    humorSlider.addEventListener('input', (e) => {
      humorValue.textContent = e.target.value;
    });
  }
  if (honestySlider) {
    honestySlider.addEventListener('input', (e) => {
      honestyValue.textContent = e.target.value;
    });
  }
  if (sentimentalitySlider) {
    sentimentalitySlider.addEventListener('input', (e) => {
      sentimentalityValue.textContent = e.target.value;
    });
  }
  if (energySlider) {
    energySlider.addEventListener('input', (e) => {
      energyValue.textContent = e.target.value;
    });
  }
  if (adviceSlider) {
    adviceSlider.addEventListener('input', (e) => {
      adviceValue.textContent = e.target.value;
    });
  }
  
  // Bulk import modal handlers
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', openBulkImportModal);
  }
  if (closeBulkImport) {
    closeBulkImport.addEventListener('click', closeBulkImportModal);
  }
  if (cancelBulkImport) {
    cancelBulkImport.addEventListener('click', closeBulkImportModal);
  }
  if (bulkImportForm) {
    bulkImportForm.addEventListener('submit', handleBulkImport);
  }
  
  // Close modal on background click
  if (bulkImportModal) {
    bulkImportModal.addEventListener('click', (e) => {
      if (e.target === bulkImportModal) {
        closeBulkImportModal();
      }
    });
  }
  
  // Wizard modal handlers
  if (setupWizardBtn) {
    setupWizardBtn.addEventListener('click', openWizardModal);
  }
  if (closeWizard) {
    closeWizard.addEventListener('click', closeWizardModal);
  }
  if (wizardPrev) {
    wizardPrev.addEventListener('click', wizardPreviousStep);
  }
  if (wizardNext) {
    wizardNext.addEventListener('click', wizardNextStep);
  }
  if (wizardForm) {
    wizardForm.addEventListener('submit', handleWizardSubmit);
  }
  if (wizardModal) {
    wizardModal.addEventListener('click', (e) => {
      if (e.target === wizardModal) {
        closeWizardModal();
      }
    });
  }
  
  // Wizard slider value updates
  const wizardSliders = [
    { slider: 'wizard-humor-level', value: 'wizard-humor-value' },
    { slider: 'wizard-honesty-level', value: 'wizard-honesty-value' },
    { slider: 'wizard-sentimentality-level', value: 'wizard-sentimentality-value' },
    { slider: 'wizard-energy-level', value: 'wizard-energy-value' },
    { slider: 'wizard-advice-level', value: 'wizard-advice-value' }
  ];
  
  wizardSliders.forEach(({ slider, value }) => {
    const sliderEl = document.getElementById(slider);
    const valueEl = document.getElementById(value);
    if (sliderEl && valueEl) {
      sliderEl.addEventListener('input', (e) => {
        valueEl.textContent = e.target.value;
      });
    }
  });
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
  
  // Also update journal persona dropdown
  updateJournalPersonaDropdown();
}

// Handle persona selection change
async function handlePersonaChange(event) {
  const personaId = event.target.value;
  
  // Close wizard modal if open (prevents confusion when switching personas)
  if (wizardModal && wizardModal.style.display === 'flex') {
    closeWizardModal();
  }
  
  if (!personaId) {
    selectedPersonaId = null;
    clearPersonaInfo();
    clearMemories();
    clearSnapshots();
    clearSettings();
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
    
    // Load settings
    await loadPersonaSettings(personaId);
    
    // Show bulk import button
    if (bulkImportBtn) {
      bulkImportBtn.style.display = 'inline-block';
    }
    
    // Show wizard section
    if (wizardSection) {
      wizardSection.style.display = 'block';
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

// Hide persona-specific UI elements
function hidePersonaControls() {
  if (wizardSection) {
    wizardSection.style.display = 'none';
  }
  if (bulkImportBtn) {
    bulkImportBtn.style.display = 'none';
  }
}

// Clear persona info
function clearPersonaInfo() {
  document.getElementById('info-name').textContent = '-';
  document.getElementById('info-relationship').textContent = '-';
  document.getElementById('info-description').textContent = '-';
  hidePersonaControls();
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
  hidePersonaControls();
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

// Open bulk import modal
function openBulkImportModal() {
  if (!selectedPersonaId) {
    showError('Please select a persona first');
    return;
  }
  if (bulkImportModal) {
    bulkImportModal.style.display = 'flex';
  }
}

// Close bulk import modal
function closeBulkImportModal() {
  if (bulkImportModal) {
    bulkImportModal.style.display = 'none';
  }
  if (bulkImportForm) {
    bulkImportForm.reset();
  }
}

// Handle bulk import
async function handleBulkImport(event) {
  event.preventDefault();
  
  if (!selectedPersonaId) {
    showError('Please select a persona first');
    return;
  }
  
  const text = document.getElementById('bulk-text').value.trim();
  const autoWeight = document.getElementById('auto-weight-checkbox').checked;
  
  if (!text) {
    showError('Please enter some memories to import');
    return;
  }
  
  try {
    showSuccess('Importing memories... This may take a moment.');
    
    const response = await fetch(`/api/personas/${selectedPersonaId}/memories/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        auto_weight: autoWeight
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Add imported memories to list
      memories = [...memories, ...result.memories];
      displayMemories();
      
      // Close modal
      closeBulkImportModal();
      
      // Reload snapshots to show auto-created snapshot
      try {
        const snapshotsResponse = await fetch(`/api/personas/${selectedPersonaId}/snapshots`);
        const snapshotsResult = await snapshotsResponse.json();
        if (snapshotsResult.success) {
          snapshots = snapshotsResult.data;
          displaySnapshots();
        }
      } catch (err) {
        console.error('Failed to reload snapshots:', err);
      }
      
      showSuccess(`Successfully imported ${result.imported} memories!`);
    } else {
      showError(result.message || 'Failed to import memories');
    }
  } catch (error) {
    console.error('Failed to import memories:', error);
    showError('Failed to import memories');
  }
}

// Open wizard modal
function openWizardModal() {
  if (!selectedPersonaId) {
    showError('Please select a persona first');
    return;
  }
  wizardCurrentStep = 1;
  updateWizardUI();
  if (wizardModal) {
    wizardModal.style.display = 'flex';
  }
}

// Close wizard modal
function closeWizardModal() {
  if (wizardModal) {
    wizardModal.style.display = 'none';
  }
  if (wizardForm) {
    wizardForm.reset();
  }
  wizardCurrentStep = 1;
  updateWizardUI();
}

// Wizard next step
function wizardNextStep() {
  if (wizardCurrentStep < 6) {
    wizardCurrentStep++;
    updateWizardUI();
  }
}

// Wizard previous step
function wizardPreviousStep() {
  if (wizardCurrentStep > 1) {
    wizardCurrentStep--;
    updateWizardUI();
  }
}

// Update wizard UI
function updateWizardUI() {
  // Hide all steps
  for (let i = 1; i <= 6; i++) {
    const step = document.getElementById(`wizard-step-${i}`);
    if (step) {
      step.style.display = i === wizardCurrentStep ? 'block' : 'none';
    }
  }
  
  // Update progress
  const progressPercent = (wizardCurrentStep / 6) * 100;
  if (wizardProgressFill) {
    wizardProgressFill.style.width = `${progressPercent}%`;
  }
  if (wizardCurrentStepText) {
    wizardCurrentStepText.textContent = wizardCurrentStep;
  }
  
  // Update navigation buttons
  if (wizardPrev) {
    wizardPrev.style.display = wizardCurrentStep > 1 ? 'inline-block' : 'none';
  }
  if (wizardNext) {
    wizardNext.style.display = wizardCurrentStep < 6 ? 'inline-block' : 'none';
  }
  if (wizardGenerate) {
    wizardGenerate.style.display = wizardCurrentStep === 6 ? 'inline-block' : 'none';
  }
}

// Handle wizard form submission
async function handleWizardSubmit(event) {
  event.preventDefault();
  
  // Double-check persona is still selected (defensive)
  if (!selectedPersonaId) {
    showError('No persona selected. Please select a persona first.');
    closeWizardModal();
    return;
  }
  
  // Show loading
  const loadingEl = document.getElementById('wizard-loading');
  if (loadingEl) {
    loadingEl.style.display = 'block';
  }
  
  // Collect wizard inputs
  const wizardInputs = {
    personality: document.getElementById('wizard-personality').value.trim(),
    humor: document.getElementById('wizard-humor').value.trim(),
    memories: document.getElementById('wizard-memories').value.trim(),
    conversations: document.getElementById('wizard-conversations').value.trim(),
    tone_preferences: {
      humor_level: parseFloat(document.getElementById('wizard-humor-level').value),
      honesty_level: parseFloat(document.getElementById('wizard-honesty-level').value),
      sentimentality_level: parseFloat(document.getElementById('wizard-sentimentality-level').value),
      energy_level: parseFloat(document.getElementById('wizard-energy-level').value),
      advice_level: parseFloat(document.getElementById('wizard-advice-level').value)
    }
  };
  
  try {
    const response = await fetch(`/api/personas/${selectedPersonaId}/wizard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ wizard_inputs: wizardInputs })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Add created memories to list
      memories = [...memories, ...result.memories];
      displayMemories();
      
      // Reload persona details to refresh settings and snapshots
      await loadPersonaDetails(selectedPersonaId);
      
      // Close modal
      closeWizardModal();
      
      showSuccess(`Persona Ready! Created ${result.memories_created} memories.`);
    } else {
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
      showError(result.message || 'Failed to complete wizard');
    }
  } catch (error) {
    console.error('Failed to complete wizard:', error);
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
    showError('Failed to complete wizard');
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

// Load persona settings
async function loadPersonaSettings(personaId) {
  try {
    const response = await fetch(`/api/personas/${personaId}/settings`);
    const result = await response.json();
    
    if (result.success) {
      settings = result.data;
      displaySettings();
      if (settingsSection) {
        settingsSection.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
    showError('Failed to load settings');
  }
}

// Display settings in UI
function displaySettings() {
  if (!settings) return;
  
  // Set tone mode
  if (toneModeSelect) {
    toneModeSelect.value = settings.default_tone_mode || 'auto';
  }
  
  // Set slider values
  if (humorSlider) {
    humorSlider.value = settings.humor_level || 3;
    humorValue.textContent = settings.humor_level || 3;
  }
  if (honestySlider) {
    honestySlider.value = settings.honesty_level || 3;
    honestyValue.textContent = settings.honesty_level || 3;
  }
  if (sentimentalitySlider) {
    sentimentalitySlider.value = settings.sentimentality_level || 3;
    sentimentalityValue.textContent = settings.sentimentality_level || 3;
  }
  if (energySlider) {
    energySlider.value = settings.energy_level || 3;
    energyValue.textContent = settings.energy_level || 3;
  }
  if (adviceSlider) {
    adviceSlider.value = settings.advice_level || 2;
    adviceValue.textContent = settings.advice_level || 2;
  }
  
  // Set boundaries checkboxes
  if (settings.boundaries) {
    if (avoidRegretSpirals) {
      avoidRegretSpirals.checked = settings.boundaries.avoid_regret_spirals !== false;
    }
    if (noParanormalLanguage) {
      noParanormalLanguage.checked = settings.boundaries.no_paranormal_language !== false;
    }
    if (softenSensitiveTopics) {
      softenSensitiveTopics.checked = settings.boundaries.soften_sensitive_topics !== false;
    }
    if (preferReassurance) {
      preferReassurance.checked = settings.boundaries.prefer_reassurance !== false;
    }
  }
}

// Clear settings
function clearSettings() {
  settings = null;
  if (settingsSection) {
    settingsSection.style.display = 'none';
  }
}

// Handle save settings
async function handleSaveSettings() {
  if (!selectedPersonaId) return;
  
  try {
    const updatedSettings = {
      default_tone_mode: toneModeSelect.value,
      humor_level: parseFloat(humorSlider.value),
      honesty_level: parseFloat(honestySlider.value),
      sentimentality_level: parseFloat(sentimentalitySlider.value),
      energy_level: parseFloat(energySlider.value),
      advice_level: parseFloat(adviceSlider.value),
      boundaries: {
        avoid_regret_spirals: avoidRegretSpirals.checked,
        no_paranormal_language: noParanormalLanguage.checked,
        soften_sensitive_topics: softenSensitiveTopics.checked,
        prefer_reassurance: preferReassurance.checked
      }
    };
    
    const response = await fetch(`/api/personas/${selectedPersonaId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    });
    
    const result = await response.json();
    
    if (result.success) {
      settings = result.data;
      showSettingsFeedback('Settings saved successfully!', 'success');
    } else {
      showSettingsFeedback(result.message || 'Failed to save settings', 'error');
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    showSettingsFeedback('Failed to save settings', 'error');
  }
}

// Show settings feedback message
function showSettingsFeedback(message, type) {
  if (!settingsFeedback) return;
  
  settingsFeedback.textContent = message;
  settingsFeedback.className = `settings-feedback ${type}`;
  settingsFeedback.style.display = 'block';
  
  setTimeout(() => {
    settingsFeedback.style.display = 'none';
  }, 3000);
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

// =====================
// JOURNAL SYSTEM
// =====================

const journalEntriesList = document.getElementById('journal-entries-list');
const journalForm = document.getElementById('journal-form');
const journalTextInput = document.getElementById('journal-text');
const journalMoodInput = document.getElementById('journal-mood');
const journalPersonaSelect = document.getElementById('journal-persona');
const journalTagsInput = document.getElementById('journal-tags');
const generateReflectionCheckbox = document.getElementById('generate-reflection');

let journalEntries = [];
let editingJournalId = null;

// Load all journal entries
async function loadJournalEntries() {
  try {
    const response = await fetch('/api/journal');
    const result = await response.json();
    
    if (result.success) {
      journalEntries = result.data;
      displayJournalEntries();
    }
  } catch (error) {
    console.error('Failed to load journal entries:', error);
  }
}

// Display journal entries
function displayJournalEntries() {
  if (!journalEntries || journalEntries.length === 0) {
    journalEntriesList.innerHTML = '<p class="placeholder">No journal entries yet</p>';
    return;
  }

  journalEntriesList.innerHTML = '';
  
  journalEntries.forEach(entry => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'journal-entry';
    entryDiv.dataset.testid = `journal-entry-${entry.id}`;
    
    const dateStr = new Date(entry.created_at).toLocaleString();
    const moodBadge = entry.mood ? `<span class="journal-mood-badge">${escapeHtml(entry.mood)}</span>` : '';
    const tagsBadges = entry.tags && entry.tags.length > 0 
      ? entry.tags.map(tag => `<span class="journal-tag-badge">${escapeHtml(tag)}</span>`).join(' ')
      : '';
    
    entryDiv.innerHTML = `
      <div class="journal-entry-header">
        <span class="journal-entry-date">${dateStr}</span>
        ${moodBadge}
      </div>
      <div class="journal-entry-text">${escapeHtml(entry.text)}</div>
      ${tagsBadges ? `<div class="journal-entry-tags">${tagsBadges}</div>` : ''}
      ${entry.ai_reflection ? `<div class="journal-reflection">
        <em>Reflection:</em> ${escapeHtml(entry.ai_reflection)}
      </div>` : ''}
      <div class="journal-entry-actions">
        <button class="btn-delete-journal" data-id="${entry.id}" data-testid="button-delete-journal-${entry.id}">Delete</button>
      </div>
    `;
    
    journalEntriesList.appendChild(entryDiv);
  });
  
  // Attach delete listeners
  document.querySelectorAll('.btn-delete-journal').forEach(btn => {
    btn.addEventListener('click', handleDeleteJournal);
  });
}

// Handle journal form submission
async function handleJournalSubmit(e) {
  e.preventDefault();
  
  const text = journalTextInput.value.trim();
  if (!text) {
    showError('Journal text is required');
    return;
  }
  
  const mood = journalMoodInput.value || null;
  const personaId = journalPersonaSelect.value || null;
  const tagsStr = journalTagsInput.value.trim();
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : null;
  const generateReflection = generateReflectionCheckbox.checked;
  
  try {
    const response = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        mood,
        persona_id: personaId,
        tags,
        generate_reflection: generateReflection
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Clear form
      journalForm.reset();
      
      // Reload entries
      await loadJournalEntries();
      
      showSuccess('Journal entry saved');
    } else {
      showError(result.message || 'Failed to save journal entry');
    }
  } catch (error) {
    console.error('Error saving journal entry:', error);
    showError('Failed to save journal entry');
  }
}

// Handle delete journal entry
async function handleDeleteJournal(e) {
  const entryId = e.target.dataset.id;
  
  if (!confirm('Delete this journal entry?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/journal/${entryId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      await loadJournalEntries();
      showSuccess('Journal entry deleted');
    } else {
      showError(result.message || 'Failed to delete journal entry');
    }
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    showError('Failed to delete journal entry');
  }
}

// Update journal persona dropdown when personas change
function updateJournalPersonaDropdown() {
  if (!journalPersonaSelect) return;
  
  // Save current selection
  const currentSelection = journalPersonaSelect.value;
  
  // Clear and rebuild
  journalPersonaSelect.innerHTML = '<option value="">-- None --</option>';
  
  personas.forEach(persona => {
    const option = document.createElement('option');
    option.value = persona.id;
    option.textContent = persona.name;
    journalPersonaSelect.appendChild(option);
  });
  
  // Restore selection if still valid
  if (currentSelection && personas.find(p => p.id === currentSelection)) {
    journalPersonaSelect.value = currentSelection;
  }
}

// Initialize journal event listeners
if (journalForm) {
  journalForm.addEventListener('submit', handleJournalSubmit);
}
