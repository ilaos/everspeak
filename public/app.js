// State
let personas = [];
let selectedPersonaId = null;
let selectedPersona = null;
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
let wizardSection, setupWizardBtn, wizardModal, wizardForm, closeWizard, wizardPrev, wizardNext, wizardBeginConversation, wizardGiveMoment;
let wizardProgressFill, wizardCurrentStepText, wizardTotalStepsText;
let skipCircumstancesBtn;
let continueSetupContainer, continueSetupBtn;
let firstConversationBanner, btnBeginConversationBanner, btnCloseConversationBanner;
let sidebar, sidebarClose, sidebarOverlay, hamburgerMenu, sidebarRestartWizard;
let sidebarPersonaName, sidebarPersonaCompletion;
const WIZARD_TOTAL_STEPS = 11;
let voiceRecordBtn, voiceStatus, memoryTextInput;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let wizardMediaRecorder = null;
let wizardAudioChunks = [];
let isWizardRecording = false;
let wizardVoiceBtn;
let wizardWelcomeMain, wizardWelcomeMore, btnWizardReady, btnWizardTellMore, btnWizardOkayBegin, btnWizardBack;
let voiceNameConfirmation, voiceDetectedName, voiceNameCorrection, btnConfirmVoiceName, btnUseCorrection;
let detectedNameFromVoice = '';
let boostPersonaBtn, boostModal, closeBoost, refreshBoostBtn, applyToneBtn;
let boostLoading, boostResults;
let currentBoostRecommendations = null;

// Conversation Room elements
let conversationRoom, personaAvatar, avatarInitials, roomTitle, roomSubtitle;
let textSizeNormal, textSizeLarge, voiceToggle;
let emptyState;
let isFirstConversation = false;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Clear wizard snooze from previous session
  localStorage.removeItem('wizardSnoozed');
  
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
  continueSetupContainer = document.getElementById('continue-setup-container');
  continueSetupBtn = document.getElementById('continue-setup-btn');
  wizardModal = document.getElementById('wizard-modal');
  wizardForm = document.getElementById('wizard-form');
  closeWizard = document.getElementById('close-wizard');
  wizardPrev = document.getElementById('wizard-prev');
  wizardNext = document.getElementById('wizard-next');
  wizardBeginConversation = document.getElementById('wizard-begin-conversation');
  wizardGiveMoment = document.getElementById('wizard-give-moment');
  wizardProgressFill = document.getElementById('wizard-progress-fill');
  wizardCurrentStepText = document.getElementById('wizard-current-step');
  wizardTotalStepsText = document.getElementById('wizard-total-steps');
  skipCircumstancesBtn = document.getElementById('skip-circumstances');
  wizardVoiceBtn = document.getElementById('wizard-voice-btn');
  
  // Wizard welcome screen elements
  wizardWelcomeMain = document.getElementById('wizard-welcome-main');
  wizardWelcomeMore = document.getElementById('wizard-welcome-more');
  btnWizardReady = document.getElementById('btn-wizard-ready');
  btnWizardTellMore = document.getElementById('btn-wizard-tell-more');
  btnWizardOkayBegin = document.getElementById('btn-wizard-okay-begin');
  btnWizardBack = document.getElementById('btn-wizard-back');
  
  // Voice name confirmation elements
  voiceNameConfirmation = document.getElementById('voice-name-confirmation');
  voiceDetectedName = document.getElementById('voice-detected-name');
  voiceNameCorrection = document.getElementById('voice-name-correction');
  btnConfirmVoiceName = document.getElementById('btn-confirm-voice-name');
  btnUseCorrection = document.getElementById('btn-use-correction');
  
  // First conversation banner
  firstConversationBanner = document.getElementById('first-conversation-banner');
  btnBeginConversationBanner = document.getElementById('btn-begin-conversation-banner');
  btnCloseConversationBanner = document.getElementById('btn-close-conversation-banner');
  
  // Voice recording elements
  voiceRecordBtn = document.getElementById('voice-record-btn');
  voiceStatus = document.getElementById('voice-status');
  memoryTextInput = document.getElementById('memory-text');
  
  // Boost elements
  boostPersonaBtn = document.getElementById('boost-persona-btn');
  boostModal = document.getElementById('boost-modal');
  closeBoost = document.getElementById('close-boost');
  refreshBoostBtn = document.getElementById('refresh-boost-btn');
  applyToneBtn = document.getElementById('apply-tone-btn');
  boostLoading = document.getElementById('boost-loading');
  boostResults = document.getElementById('boost-results');
  
  // Conversation Room elements
  conversationRoom = document.getElementById('conversation-room');
  personaAvatar = document.getElementById('persona-avatar');
  avatarInitials = document.getElementById('avatar-initials');
  roomTitle = document.getElementById('room-title');
  roomSubtitle = document.getElementById('room-subtitle');
  textSizeNormal = document.getElementById('text-size-normal');
  textSizeLarge = document.getElementById('text-size-large');
  voiceToggle = document.getElementById('voice-toggle');
  emptyState = document.getElementById('empty-state');
  
  // Sidebar elements
  sidebar = document.getElementById('sidebar');
  sidebarClose = document.getElementById('sidebar-close');
  sidebarOverlay = document.getElementById('sidebar-overlay');
  hamburgerMenu = document.getElementById('hamburger-menu');
  sidebarRestartWizard = document.getElementById('sidebar-restart-wizard');
  sidebarPersonaName = document.getElementById('sidebar-persona-name');
  sidebarPersonaCompletion = document.getElementById('sidebar-persona-completion');
  
  await loadPersonas();
  await loadJournalEntries();
  setupEventListeners();
  
  // Initialize Conversation Room settings
  initializeConversationRoom();
});

// Check if wizard is incomplete for current persona
function isWizardIncomplete() {
  if (!selectedPersona) return false;
  
  // Check if wizard is completed (has onboarding_context.completed_at from wizard submission)
  // This is the only reliable indicator - completed_at is only set when wizard finishes
  const isComplete = !!(selectedPersona.onboarding_context && selectedPersona.onboarding_context.completed_at);
  return !isComplete;
}

// Check if wizard is snoozed for current session
function isWizardSnoozed() {
  const snoozeData = localStorage.getItem('wizardSnoozed');
  if (!snoozeData) return false;
  
  try {
    const { personaId, timestamp } = JSON.parse(snoozeData);
    // Check if snooze is for current persona
    if (personaId !== selectedPersonaId) return false;
    
    // Snooze is only valid for current session (cleared on page load)
    return true;
  } catch (e) {
    return false;
  }
}

// Update continue setup button visibility
function updateContinueSetupButton() {
  if (continueSetupContainer) {
    if (isWizardIncomplete()) {
      continueSetupContainer.style.display = 'block';
    } else {
      continueSetupContainer.style.display = 'none';
    }
  }
}

// Auto-open wizard if incomplete and not snoozed
function checkAndAutoOpenWizard() {
  if (isWizardIncomplete() && !isWizardSnoozed()) {
    // Small delay to let UI settle
    setTimeout(() => {
      openWizardModal();
    }, 300);
  }
}

// Handle "Give me a moment" button
function handleGiveMeAMoment() {
  // Snooze wizard for current session
  localStorage.setItem('wizardSnoozed', JSON.stringify({
    personaId: selectedPersonaId,
    timestamp: Date.now()
  }));
  
  // Close the wizard modal
  closeWizardModal();
  
  // Show the first conversation banner
  showFirstConversationBanner();
  
  // Store state to remember we're waiting for first conversation
  localStorage.setItem('waitingForFirstConversation', 'true');
}

// Show first conversation banner
function showFirstConversationBanner() {
  if (firstConversationBanner) {
    firstConversationBanner.style.display = 'flex';
    console.log('Banner shown, display:', firstConversationBanner.style.display);
  }
}

// Close first conversation banner
function closeFirstConversationBanner() {
  console.log('closeFirstConversationBanner called', {
    element: firstConversationBanner,
    currentDisplay: firstConversationBanner?.style.display
  });
  
  if (firstConversationBanner) {
    firstConversationBanner.style.display = 'none';
    console.log('Banner hidden, new display:', firstConversationBanner.style.display);
  } else {
    console.error('firstConversationBanner element not found!');
  }
  localStorage.removeItem('waitingForFirstConversation');
}

// Handle "Begin Conversation" from banner
async function handleBeginConversationFromBanner() {
  closeFirstConversationBanner();
  
  // Reload wizard inputs from persona or generate first message
  // For now, we'll just send a simple first message
  await generateFirstMessageFromBanner();
}

// Initialize Conversation Room
function initializeConversationRoom() {
  // Load text size preference
  const savedTextSize = localStorage.getItem('everspeak_chat_text_size') || 'normal';
  if (savedTextSize === 'large') {
    textSizeLarge.classList.add('active');
    textSizeNormal.classList.remove('active');
    conversationRoom.classList.add('text-size-large');
  }
  
  // Set up text size listeners
  textSizeNormal.addEventListener('click', () => handleTextSizeChange('normal'));
  textSizeLarge.addEventListener('click', () => handleTextSizeChange('large'));
  
  // Voice toggle is UI only - just update visual state
  if (voiceToggle) {
    voiceToggle.addEventListener('change', () => {
      // Visual feedback only - no actual functionality yet
      if (voiceToggle.checked) {
        console.log('Voice preview enabled (UI only)');
      } else {
        console.log('Voice preview disabled (UI only)');
      }
    });
  }
  
  // Update room state for initial empty state
  updateConversationRoomState();
}

// Handle text size change
function handleTextSizeChange(size) {
  if (size === 'large') {
    textSizeLarge.classList.add('active');
    textSizeNormal.classList.remove('active');
    conversationRoom.classList.add('text-size-large');
    localStorage.setItem('everspeak_chat_text_size', 'large');
  } else {
    textSizeNormal.classList.add('active');
    textSizeLarge.classList.remove('active');
    conversationRoom.classList.remove('text-size-large');
    localStorage.setItem('everspeak_chat_text_size', 'normal');
  }
}

// Update Conversation Room state based on selected persona
function updateConversationRoomState() {
  if (!selectedPersonaId) {
    // No persona selected
    avatarInitials.textContent = '?';
    roomTitle.textContent = 'Connection';
    roomSubtitle.textContent = 'Select someone to begin a conversation.';
    
    // Show empty state
    if (emptyState) {
      emptyState.style.display = 'block';
    }
    return;
  }
  
  const persona = personas.find(p => p.id === selectedPersonaId);
  if (!persona) return;
  
  // Update avatar initials
  const initials = getPersonaInitials(persona.name);
  avatarInitials.textContent = initials;
  
  // Update room title
  roomTitle.textContent = persona.name || 'Connection';
  
  // Check if wizard is completed (has onboarding_context or has memories)
  const isWizardComplete = persona.onboarding_context || (persona.memories && persona.memories.length > 0);
  
  if (!isWizardComplete) {
    // Incomplete setup state
    roomSubtitle.textContent = 'Complete setup to begin meaningful conversations.';
    showIncompleteSetupState();
  } else {
    // Ready state
    roomSubtitle.textContent = 'Based on the memories you\'ve shared about this person.';
    hideIncompleteSetupState();
    
    // Hide empty state
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
}

// Get initials from persona name
function getPersonaInitials(name) {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }
}

// Show incomplete setup state
function showIncompleteSetupState() {
  if (emptyState) {
    emptyState.innerHTML = `
      <div class="incomplete-setup-state">
        <p>You\'ve started setting up this connection. To make conversations feel meaningful, complete the setup first.</p>
        <button class="btn-continue-setup" id="btn-continue-setup-inline" data-testid="button-continue-setup-inline">Continue Setup</button>
      </div>
    `;
    emptyState.style.display = 'block';
    
    // Add event listener to the continue setup button
    const continueBtn = document.getElementById('btn-continue-setup-inline');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (setupWizardBtn) {
          setupWizardBtn.click();
        }
      });
    }
  }
}

// Hide incomplete setup state
function hideIncompleteSetupState() {
  if (emptyState && emptyState.querySelector('.incomplete-setup-state')) {
    emptyState.style.display = 'none';
  }
}

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
  if (continueSetupBtn) {
    continueSetupBtn.addEventListener('click', openWizardModal);
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
  if (skipCircumstancesBtn) {
    skipCircumstancesBtn.addEventListener('click', () => {
      // Clear the circumstances textarea and move to next step
      const circumstancesInput = document.getElementById('wizard-circumstances');
      if (circumstancesInput) {
        circumstancesInput.value = '';
      }
      wizardNextStep();
    });
  }
  if (wizardBeginConversation) {
    wizardBeginConversation.addEventListener('click', async (e) => {
      e.preventDefault();
      // Trigger the wizard form submission which will generate first message
      if (wizardForm) {
        wizardForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }
  if (wizardGiveMoment) {
    wizardGiveMoment.addEventListener('click', handleGiveMeAMoment);
  }
  if (btnBeginConversationBanner) {
    btnBeginConversationBanner.addEventListener('click', handleBeginConversationFromBanner);
  }
  if (btnCloseConversationBanner) {
    btnCloseConversationBanner.addEventListener('click', closeFirstConversationBanner);
  }
  if (wizardModal) {
    wizardModal.addEventListener('click', (e) => {
      if (e.target === wizardModal) {
        closeWizardModal();
      }
    });
  }
  
  // Wizard voice button
  if (wizardVoiceBtn) {
    wizardVoiceBtn.addEventListener('click', handleWizardVoiceRecording);
  }
  
  // Wizard welcome screen buttons
  if (btnWizardReady) {
    btnWizardReady.addEventListener('click', wizardNextStep);
  }
  if (btnWizardTellMore) {
    btnWizardTellMore.addEventListener('click', showWizardTellMore);
  }
  if (btnWizardOkayBegin) {
    btnWizardOkayBegin.addEventListener('click', wizardNextStep);
  }
  if (btnWizardBack) {
    btnWizardBack.addEventListener('click', showWizardMain);
  }
  
  // Voice name confirmation buttons
  if (btnConfirmVoiceName) {
    btnConfirmVoiceName.addEventListener('click', confirmVoiceName);
  }
  if (btnUseCorrection) {
    btnUseCorrection.addEventListener('click', useNameCorrection);
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
  
  // Voice recording button
  if (voiceRecordBtn) {
    // Check if browser supports voice recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      voiceRecordBtn.disabled = true;
      voiceRecordBtn.title = 'Voice recording not supported in this browser';
    } else {
      voiceRecordBtn.addEventListener('click', handleVoiceRecording);
    }
  }
  
  // Boost persona button
  if (boostPersonaBtn) {
    boostPersonaBtn.addEventListener('click', openBoostModal);
  }
  if (closeBoost) {
    closeBoost.addEventListener('click', closeBoostModal);
  }
  if (refreshBoostBtn) {
    refreshBoostBtn.addEventListener('click', fetchBoostRecommendations);
  }
  if (applyToneBtn) {
    applyToneBtn.addEventListener('click', applyToneSuggestions);
  }
  if (boostModal) {
    boostModal.addEventListener('click', (e) => {
      if (e.target === boostModal) {
        closeBoostModal();
      }
    });
  }
  
  // Check if user is waiting for first conversation
  const waitingForFirstConversation = localStorage.getItem('waitingForFirstConversation');
  if (waitingForFirstConversation === 'true' && firstConversationBanner) {
    firstConversationBanner.style.display = 'flex';
  }
  
  // Sidebar event listeners
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', toggleSidebar);
  }
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }
  if (sidebarRestartWizard) {
    sidebarRestartWizard.addEventListener('click', handleRestartWizard);
  }
}

// Toggle sidebar
function toggleSidebar() {
  if (sidebar && sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// Open sidebar
function openSidebar() {
  if (sidebar) {
    sidebar.classList.add('open');
  }
  if (sidebarOverlay) {
    sidebarOverlay.classList.add('active');
  }
  if (hamburgerMenu) {
    hamburgerMenu.classList.add('active');
  }
  
  // Update sidebar content
  updateSidebarContent();
}

// Close sidebar
function closeSidebar() {
  if (sidebar) {
    sidebar.classList.remove('open');
  }
  if (sidebarOverlay) {
    sidebarOverlay.classList.remove('active');
  }
  if (hamburgerMenu) {
    hamburgerMenu.classList.remove('active');
  }
}

// Update sidebar content based on current persona
function updateSidebarContent() {
  if (!sidebarPersonaName || !sidebarPersonaCompletion) return;
  
  if (selectedPersona) {
    sidebarPersonaName.textContent = selectedPersona.name;
    
    if (isWizardIncomplete()) {
      sidebarPersonaCompletion.textContent = 'Setup incomplete';
      sidebarPersonaCompletion.style.color = '#e67e22';
    } else {
      sidebarPersonaCompletion.textContent = 'Setup complete';
      sidebarPersonaCompletion.style.color = '#27ae60';
    }
  } else {
    sidebarPersonaName.textContent = 'None selected';
    sidebarPersonaCompletion.textContent = 'Select a persona to begin';
    sidebarPersonaCompletion.style.color = '#7f8c8d';
  }
}

// Handle restart wizard from sidebar
function handleRestartWizard() {
  if (!selectedPersonaId) {
    showError('Please select a persona first');
    return;
  }
  
  // Close sidebar
  closeSidebar();
  
  // Clear any existing snooze
  localStorage.removeItem('wizardSnoozed');
  
  // Open wizard modal
  openWizardModal();
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
    updateConversationRoomState();
    return;
  }
  
  selectedPersonaId = personaId;
  await loadPersonaDetails(personaId);
  updateConversationRoomState();
  
  // Update sidebar to reflect new persona
  updateSidebarContent();
  
  // Update continue setup button visibility
  updateContinueSetupButton();
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
      selectedPersona = personaResult.data;
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
    
    // Update UI after all data is loaded
    updateContinueSetupButton();
    updateSidebarContent();
    
    // Auto-open wizard if incomplete and not snoozed
    checkAndAutoOpenWizard();
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
  // Show memory hint when persona is selected
  const memoryHint = document.getElementById('memory-hint');
  if (memoryHint && selectedPersonaId) {
    memoryHint.style.display = 'block';
  }
  
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
  // Snooze wizard for current session if it's incomplete
  if (isWizardIncomplete() && selectedPersonaId) {
    localStorage.setItem('wizardSnoozed', JSON.stringify({
      personaId: selectedPersonaId,
      timestamp: Date.now()
    }));
  }
  
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
  if (wizardCurrentStep < WIZARD_TOTAL_STEPS) {
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

// Wizard acknowledgments for each step
const wizardAcknowledgments = {
  2: "",
  3: "Thank you for sharing that. It gives me a sense of who they were.",
  4: "I hear you. That paints a more human picture of them.",
  5: "Thank you. Those details matter, even if they're hard to put into words.",
  6: "I hear you. That time in your life can hold a lot.",
  7: "Thank you for sharing that. We'll keep moving gently.",
  8: "Thank you. That tells me a lot about the emotional space you're coming from.",
  9: "Those memories are important. Thank you for trusting me with them.",
  10: "Thank you. You've shared a lot already, and you're doing more work than it might seem.",
  11: "Everything you've shared so far will be held carefully here."
};

// Update wizard UI
// Get step-specific progress text
function getStepProgressText(step) {
  const progressTexts = {
    1: '', // Step 1 doesn't show progress text
    2: "Learning your lost one's name...Next: Your Relationship",
    3: "Date of Passing...Next: Reason",
    4: "Capturing their humor...Next: When They Passed",
    5: "Acknowledging the loss...Next: Your Relationship",
    6: "Exploring your bond...Next: The Circumstances",
    7: "Honoring how it happened...Next: Key Memories",
    8: "Gathering cherished memories...Next: Conversations",
    9: "Remembering what they'd say...Next: Tone Settings",
    10: "Customizing their communication style...Next: Boundaries",
    11: "Setting healthy boundaries...Almost done"
  };
  
  return progressTexts[step] || '';
}

function updateWizardUI() {
  // Hide all steps
  for (let i = 1; i <= WIZARD_TOTAL_STEPS; i++) {
    const step = document.getElementById(`wizard-step-${i}`);
    if (step) {
      step.style.display = i === wizardCurrentStep ? 'block' : 'none';
    }
  }
  
  // Special handling for Step 3: Insert name dynamically
  if (wizardCurrentStep === 3) {
    const firstName = document.getElementById('wizard-first-name')?.value.trim() || 'them';
    const acknowledgmentEl = document.getElementById('step-3-acknowledgment');
    const questionEl = document.getElementById('step-3-question');
    
    if (acknowledgmentEl) {
      acknowledgmentEl.textContent = `Thank you for sharing that with me, ${firstName}.`;
      acknowledgmentEl.style.display = 'block';
    }
    if (questionEl) {
      questionEl.textContent = `Would you feel comfortable telling me when ${firstName} passed away?`;
      questionEl.style.display = 'block';
    }
  } else {
    // Update acknowledgment text for other steps
    const currentStep = document.getElementById(`wizard-step-${wizardCurrentStep}`);
    if (currentStep && wizardAcknowledgments[wizardCurrentStep]) {
      const acknowledgment = currentStep.querySelector('.step-acknowledgment');
      if (acknowledgment) {
        acknowledgment.textContent = wizardAcknowledgments[wizardCurrentStep];
        acknowledgment.style.display = 'block';
      }
    }
  }
  
  // Update progress
  const progressPercent = (wizardCurrentStep / WIZARD_TOTAL_STEPS) * 100;
  if (wizardProgressFill) {
    wizardProgressFill.style.width = `${progressPercent}%`;
  }
  
  // Update progress text based on step
  const progressTextEl = document.getElementById('wizard-progress-text');
  if (wizardCurrentStep === 1) {
    // Step 1 doesn't show progress
    if (progressTextEl) {
      progressTextEl.style.display = 'none';
    }
  } else {
    if (progressTextEl) {
      progressTextEl.style.display = 'block';
      progressTextEl.textContent = getStepProgressText(wizardCurrentStep);
    }
  }
  
  // Update navigation buttons
  if (wizardPrev) {
    wizardPrev.style.display = wizardCurrentStep > 1 ? 'inline-block' : 'none';
  }
  if (wizardNext) {
    wizardNext.style.display = wizardCurrentStep < WIZARD_TOTAL_STEPS ? 'inline-block' : 'none';
  }
  if (wizardBeginConversation) {
    wizardBeginConversation.style.display = wizardCurrentStep === WIZARD_TOTAL_STEPS ? 'inline-block' : 'none';
  }
  if (wizardGiveMoment) {
    wizardGiveMoment.style.display = wizardCurrentStep === WIZARD_TOTAL_STEPS ? 'inline-block' : 'none';
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
    first_name: document.getElementById('wizard-first-name').value.trim(),
    communication_style: document.getElementById('wizard-communication-style').value.trim(),
    humor: document.getElementById('wizard-humor').value.trim(),
    date_passed: document.getElementById('wizard-date-passed').value.trim(),
    relationship_end: document.getElementById('wizard-relationship-end').value.trim(),
    circumstances: document.getElementById('wizard-circumstances').value.trim(),
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
      
      // CRITICAL: Use the returned persona from POST response
      // This has onboarding_context.completed_at already set by the server
      if (result.persona) {
        selectedPersona = result.persona;
        
        // Also update in personas array
        const personaIndex = personas.findIndex(p => p.id === selectedPersonaId);
        if (personaIndex !== -1) {
          personas[personaIndex] = result.persona;
        }
      }
      
      // Now reload all persona-related data (snapshots, settings, etc.)
      await loadPersonaDetails(selectedPersonaId);
      
      // Update sidebar and continue setup button to reflect completion
      updateSidebarContent();
      updateContinueSetupButton();
      
      // Hide loading and close modal
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
      closeWizardModal();
      
      // Scroll to conversation room and add highlight effect
      if (conversationRoom) {
        conversationRoom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        conversationRoom.style.boxShadow = '0 0 20px rgba(212, 165, 116, 0.5)';
        setTimeout(() => {
          conversationRoom.style.transition = 'box-shadow 2s ease-out';
          conversationRoom.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
        }, 1000);
      }
      
      // Show pre-roll message
      showPreRollMessage();
      
      // Wait a moment, then generate first message
      await new Promise(resolve => setTimeout(resolve, 2000));
      removePreRollMessage();
      
      // Generate and send first message from persona
      await generateFirstMessage(wizardInputs);
      
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

// Generate first message from persona
async function generateFirstMessage(wizardInputs) {
  if (!selectedPersonaId) return;
  
  try {
    // Get current persona to construct first message
    const persona = personas.find(p => p.id === selectedPersonaId);
    if (!persona) return;
    
    // Construct a warm, grounded first message using onboarding data
    const firstMessagePrompt = buildFirstMessagePrompt(persona, wizardInputs);
    
    // Send to API to generate first message
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_message: firstMessagePrompt,
        persona_id: selectedPersonaId,
        emotional_state: 'neutral',
        tone_mode: 'auto',
        strict_persona: false,
        is_first_message: true
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.reply) {
      const personaName = result.data.meta?.persona_name || persona.name || 'Persona';
      // Display the first message in chat with special first-message styling
      addMessageToChat(personaName, result.data.reply, false, true);
      userMessageCount = 0; // Reset count since this is AI-initiated
    }
  } catch (error) {
    console.error('Failed to generate first message:', error);
  }
}

// Generate first message when coming from banner
async function generateFirstMessageFromBanner() {
  if (!selectedPersonaId) return;
  
  try {
    const persona = personas.find(p => p.id === selectedPersonaId);
    if (!persona) return;
    
    // Simpler prompt for banner case
    const prompt = `Generate a warm, grounded first message from ${persona.name} to start a conversation. Use their personality and relationship context. Keep it natural and familiar, not spooky or supernatural. Make it feel like they're genuinely reaching out.`;
    
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_message: prompt,
        persona_id: selectedPersonaId,
        emotional_state: 'neutral',
        tone_mode: 'auto',
        strict_persona: false,
        is_first_message: true
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.reply) {
      const personaName = result.data.meta?.persona_name || persona.name || 'Persona';
      addMessageToChat(personaName, result.data.reply, false, true);
      userMessageCount = 0;
    }
  } catch (error) {
    console.error('Failed to generate first message:', error);
  }
}

// Build first message prompt using wizard inputs
function buildFirstMessagePrompt(persona, wizardInputs) {
  const parts = [
    `You are ${persona.name}, reaching out to start a conversation with someone you care about.`,
    `Your personality: ${wizardInputs.personality || persona.description}`,
  ];
  
  if (wizardInputs.communication_style) {
    parts.push(`Your communication style: ${wizardInputs.communication_style}`);
  }
  
  if (wizardInputs.relationship_end) {
    parts.push(`Context about your relationship: ${wizardInputs.relationship_end}`);
  }
  
  parts.push(
    `Generate a warm, grounded first message. Make it feel like you\'re genuinely reaching out - familiar, natural, and true to who you were. Not spooky, not omniscient, not supernatural. Just... you.`,
    `Keep it brief (2-3 sentences max).`
  );
  
  return parts.join(' ');
}

// Handle voice recording
async function handleVoiceRecording() {
  if (!isRecording) {
    // Start recording
    await startVoiceRecording();
  } else {
    // Stop recording
    await stopVoiceRecording();
  }
}

// Start voice recording
async function startVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });
    
    mediaRecorder.addEventListener('stop', async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      await transcribeAudio(audioBlob);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    });
    
    mediaRecorder.start();
    isRecording = true;
    
    // Update UI
    voiceRecordBtn.classList.add('recording');
    showVoiceStatus('Recording... Click again to stop', 'info');
  } catch (error) {
    console.error('Failed to start recording:', error);
    showVoiceStatus('Could not access microphone. Please check permissions.', 'error');
  }
}

// Stop voice recording
async function stopVoiceRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    // Update UI
    voiceRecordBtn.classList.remove('recording');
    showVoiceStatus('Processing...', 'info');
  }
}

// Transcribe audio
async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success && result.text) {
      // Insert transcribed text into memory field
      const currentText = memoryTextInput.value.trim();
      if (currentText) {
        // Append to existing text
        memoryTextInput.value = currentText + ' ' + result.text;
      } else {
        // Replace empty field
        memoryTextInput.value = result.text;
      }
      
      showVoiceStatus('Transcription added. You can edit it before saving.', 'success');
      
      // Hide status after 3 seconds
      setTimeout(() => {
        if (voiceStatus) {
          voiceStatus.style.display = 'none';
        }
      }, 3000);
    } else {
      showVoiceStatus(result.error || 'Could not transcribe audio. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    showVoiceStatus('Could not transcribe audio. Please try again.', 'error');
  }
}

// Show voice status message
function showVoiceStatus(message, type) {
  if (voiceStatus) {
    voiceStatus.textContent = message;
    voiceStatus.className = 'voice-status';
    if (type === 'error') {
      voiceStatus.classList.add('error');
    } else if (type === 'success') {
      voiceStatus.classList.add('success');
    }
    voiceStatus.style.display = 'block';
  }
}

// ===================================
// Wizard Voice Recording Functions
// ===================================

// Handle wizard voice recording
async function handleWizardVoiceRecording() {
  if (!isWizardRecording) {
    // Start recording
    await startWizardVoiceRecording();
  } else {
    // Stop recording
    await stopWizardVoiceRecording();
  }
}

// Start wizard voice recording
async function startWizardVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    wizardMediaRecorder = new MediaRecorder(stream);
    wizardAudioChunks = [];
    
    wizardMediaRecorder.addEventListener('dataavailable', (event) => {
      wizardAudioChunks.push(event.data);
    });
    
    wizardMediaRecorder.addEventListener('stop', async () => {
      const audioBlob = new Blob(wizardAudioChunks, { type: 'audio/webm' });
      await transcribeWizardAudio(audioBlob);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    });
    
    wizardMediaRecorder.start();
    isWizardRecording = true;
    
    // Update UI
    wizardVoiceBtn.classList.add('recording');
    wizardVoiceBtn.title = 'Recording... Click to stop';
  } catch (error) {
    console.error('Failed to start wizard recording:', error);
    showError('Could not access microphone. Please check permissions.');
  }
}

// Stop wizard voice recording
async function stopWizardVoiceRecording() {
  if (wizardMediaRecorder && isWizardRecording) {
    wizardMediaRecorder.stop();
    isWizardRecording = false;
    
    // Update UI
    wizardVoiceBtn.classList.remove('recording');
    wizardVoiceBtn.title = 'Speak instead of typing';
  }
}

// Extract name from transcription text
function extractNameFromTranscription(text) {
  // Common patterns: "Her name was X", "His name was X", "Their name was X", "It was X", or just "X"
  const patterns = [
    /(?:her|his|their|the)\s+name\s+(?:was|is)\s+([a-zA-Z]+)/i,
    /(?:name|called)\s+(?:was|is)\s+([a-zA-Z]+)/i,
    /(?:it|that)(?:'s|\s+is|\s+was)\s+([a-zA-Z]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If no pattern matches, assume the whole text is the name (trimmed and take first word)
  const words = text.trim().split(/\s+/);
  return words[0] || text.trim();
}

// Transcribe wizard audio
async function transcribeWizardAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'wizard-recording.webm');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success && result.text) {
      // Special handling for Step 2 (first name)
      if (wizardCurrentStep === 2) {
        const extractedName = extractNameFromTranscription(result.text);
        detectedNameFromVoice = extractedName;
        
        // Show confirmation UI
        if (voiceDetectedName && voiceNameConfirmation) {
          voiceDetectedName.textContent = extractedName;
          voiceNameConfirmation.style.display = 'block';
          
          // Prefill the correction field with detected name
          if (voiceNameCorrection) {
            voiceNameCorrection.value = extractedName;
          }
          
          showSuccess('Name detected from voice');
        }
      } else {
        // For other steps, use normal behavior
        const currentInputField = getCurrentWizardInputField();
        
        if (currentInputField) {
          const currentText = currentInputField.value.trim();
          if (currentText) {
            // Append to existing text
            currentInputField.value = currentText + ' ' + result.text;
          } else {
            // Replace empty field
            currentInputField.value = result.text;
          }
          showSuccess('Voice transcribed successfully');
        } else {
          showError('No input field available for this step');
        }
      }
    } else {
      showError(result.error || 'Could not transcribe audio. Please try again.');
    }
  } catch (error) {
    console.error('Wizard transcription error:', error);
    showError('Could not transcribe audio. Please try again.');
  }
}

// Confirm the detected voice name
function confirmVoiceName() {
  const firstNameInput = document.getElementById('wizard-first-name');
  if (firstNameInput && detectedNameFromVoice) {
    firstNameInput.value = detectedNameFromVoice;
    hideVoiceNameConfirmation();
    showSuccess('Name confirmed');
  }
}

// Use the corrected spelling
function useNameCorrection() {
  const firstNameInput = document.getElementById('wizard-first-name');
  const correctionValue = voiceNameCorrection ? voiceNameCorrection.value.trim() : '';
  
  if (firstNameInput && correctionValue) {
    firstNameInput.value = correctionValue;
    hideVoiceNameConfirmation();
    showSuccess('Name updated with your spelling');
  } else if (!correctionValue) {
    showError('Please enter the correct spelling');
  }
}

// Hide voice name confirmation UI
function hideVoiceNameConfirmation() {
  if (voiceNameConfirmation) {
    voiceNameConfirmation.style.display = 'none';
  }
  if (voiceNameCorrection) {
    voiceNameCorrection.value = '';
  }
  detectedNameFromVoice = '';
}

// Get the current wizard step's input field
function getCurrentWizardInputField() {
  const currentStep = wizardCurrentStep;
  
  // Map each step to its input field
  const stepInputMap = {
    2: 'wizard-first-name',
    3: 'wizard-date-passed',
    4: 'wizard-humor',
    5: 'wizard-communication-style',
    6: 'wizard-relationship-end',
    7: 'wizard-circumstances',
    8: 'wizard-memories',
    9: 'wizard-conversations'
  };
  
  const inputId = stepInputMap[currentStep];
  if (inputId) {
    return document.getElementById(inputId);
  }
  
  return null;
}

// Show "tell me more" section in wizard welcome
function showWizardTellMore() {
  if (wizardWelcomeMain && wizardWelcomeMore) {
    wizardWelcomeMain.style.display = 'none';
    wizardWelcomeMore.style.display = 'block';
  }
}

// Show main welcome section
function showWizardMain() {
  if (wizardWelcomeMain && wizardWelcomeMore) {
    wizardWelcomeMain.style.display = 'block';
    wizardWelcomeMore.style.display = 'none';
  }
}

// Open boost modal
async function openBoostModal() {
  if (!selectedPersonaId) {
    showError('Please select a persona first');
    return;
  }
  
  if (boostModal) {
    boostModal.style.display = 'flex';
  }
  
  // Reset UI and state
  if (boostLoading) boostLoading.style.display = 'block';
  if (boostResults) boostResults.style.display = 'none';
  boostSnapshotCreated = false; // Reset snapshot flag for new boost session
  
  // Fetch recommendations
  await fetchBoostRecommendations();
}

// Close boost modal
function closeBoostModal() {
  if (boostModal) {
    boostModal.style.display = 'none';
  }
  currentBoostRecommendations = null;
}

// Fetch boost recommendations
async function fetchBoostRecommendations() {
  if (!selectedPersonaId) {
    showError('No persona selected');
    closeBoostModal();
    return;
  }
  
  try {
    // Show loading
    if (boostLoading) boostLoading.style.display = 'block';
    if (boostResults) boostResults.style.display = 'none';
    
    const response = await fetch(`/api/personas/${selectedPersonaId}/boost`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentBoostRecommendations = result.recommendations;
      displayBoostRecommendations(result.recommendations);
    } else {
      showError(result.message || 'Failed to fetch recommendations');
      closeBoostModal();
    }
  } catch (error) {
    console.error('Failed to fetch boost recommendations:', error);
    showError('Failed to fetch recommendations');
    closeBoostModal();
  }
}

// Display boost recommendations
function displayBoostRecommendations(recommendations) {
  // Hide loading, show results
  if (boostLoading) boostLoading.style.display = 'none';
  if (boostResults) boostResults.style.display = 'block';
  
  // Display missing categories
  const missingCategoriesList = document.getElementById('missing-categories-list');
  if (missingCategoriesList) {
    if (recommendations.missing_categories && recommendations.missing_categories.length > 0) {
      missingCategoriesList.innerHTML = recommendations.missing_categories.map(cat => 
        `<span class="category-tag">${cat}</span>`
      ).join('');
    } else {
      missingCategoriesList.innerHTML = '<span class="category-tag empty">All categories covered</span>';
    }
  }
  
  // Display suggested memories
  const suggestedMemoriesList = document.getElementById('suggested-memories-list');
  if (suggestedMemoriesList) {
    if (recommendations.new_memories && recommendations.new_memories.length > 0) {
      suggestedMemoriesList.innerHTML = recommendations.new_memories.map((mem, index) => `
        <div class="suggested-memory-card" data-memory-index="${index}">
          <div class="memory-card-header">
            <span class="memory-card-category">${mem.category}</span>
            <span class="memory-card-weight">Weight: ${mem.weight}</span>
          </div>
          <p class="memory-card-text">${escapeHtml(mem.text)}</p>
          <button class="btn-add-suggested" data-testid="button-add-suggested-${index}" onclick="addSuggestedMemory(${index})">Add Memory</button>
        </div>
      `).join('');
    } else {
      suggestedMemoriesList.innerHTML = '<p class="placeholder">No new memories suggested</p>';
    }
  }
  
  // Display tone suggestions
  const toneSuggestionsContainer = document.getElementById('tone-suggestions-container');
  if (toneSuggestionsContainer && recommendations.tone_suggestions) {
    const toneFields = [
      { key: 'humor', label: 'Humor' },
      { key: 'honesty', label: 'Honesty' },
      { key: 'sentimentality', label: 'Sentimentality' },
      { key: 'energy', label: 'Energy' },
      { key: 'advice_giving', label: 'Advice-giving' }
    ];
    
    const currentSettings = settings || {};
    let hasSuggestions = false;
    
    const html = toneFields.map(field => {
      const current = currentSettings[`${field.key}_level`] || 3;
      const suggested = recommendations.tone_suggestions[field.key];
      
      if (suggested !== undefined && suggested !== null) {
        hasSuggestions = true;
        return `
          <div class="tone-comparison">
            <span class="tone-comparison-label">${field.label}</span>
            <div class="tone-comparison-values">
              <span class="tone-value current">Current: ${current}</span>
              <span class="tone-value suggested">→ ${suggested}</span>
            </div>
          </div>
        `;
      }
      return '';
    }).filter(h => h).join('');
    
    toneSuggestionsContainer.innerHTML = html || '<p class="placeholder">No tone adjustments suggested</p>';
    
    // Reset and show/hide apply tone button
    if (applyToneBtn) {
      applyToneBtn.style.display = hasSuggestions ? 'block' : 'none';
      applyToneBtn.disabled = false;
      applyToneBtn.textContent = 'Apply Tone Suggestions';
    }
  }
  
  // Display boundary flags
  const boundaryFlagsList = document.getElementById('boundary-flags-list');
  if (boundaryFlagsList) {
    if (recommendations.boundary_flags && recommendations.boundary_flags.length > 0) {
      boundaryFlagsList.innerHTML = recommendations.boundary_flags.map(flag => 
        `<div class="boundary-flag">${escapeHtml(flag)}</div>`
      ).join('');
    } else {
      boundaryFlagsList.innerHTML = '<p class="placeholder">No boundary issues detected</p>';
    }
  }
}

// Add suggested memory
async function addSuggestedMemory(index) {
  if (!selectedPersonaId || !currentBoostRecommendations) return;
  
  const memory = currentBoostRecommendations.new_memories[index];
  if (!memory) return;
  
  try {
    const response = await fetch(`/api/personas/${selectedPersonaId}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: memory.category,
        text: memory.text,
        weight: memory.weight
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Add to memories list
      memories.push(result.data);
      displayMemories();
      
      // Update button to show added state
      const btn = document.querySelector(`[data-testid="button-add-suggested-${index}"]`);
      if (btn) {
        btn.textContent = 'Added ✓';
        btn.classList.add('added');
        btn.disabled = true;
      }
      
      showSuccess('Memory added successfully!');
      
      // Auto-create snapshot after first memory added
      await createBoostSnapshot();
    } else {
      showError(result.message || 'Failed to add memory');
    }
  } catch (error) {
    console.error('Failed to add suggested memory:', error);
    showError('Failed to add memory');
  }
}

// Apply tone suggestions
async function applyToneSuggestions() {
  if (!selectedPersonaId || !currentBoostRecommendations) return;
  
  try {
    const toneSuggestions = currentBoostRecommendations.tone_suggestions;
    
    const updatedSettings = {
      ...settings,
      humor_level: toneSuggestions.humor !== undefined ? parseFloat(toneSuggestions.humor) : settings.humor_level,
      honesty_level: toneSuggestions.honesty !== undefined ? parseFloat(toneSuggestions.honesty) : settings.honesty_level,
      sentimentality_level: toneSuggestions.sentimentality !== undefined ? parseFloat(toneSuggestions.sentimentality) : settings.sentimentality_level,
      energy_level: toneSuggestions.energy !== undefined ? parseFloat(toneSuggestions.energy) : settings.energy_level,
      advice_level: toneSuggestions.advice_giving !== undefined ? parseFloat(toneSuggestions.advice_giving) : settings.advice_level
    };
    
    const response = await fetch(`/api/personas/${selectedPersonaId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedSettings)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update local settings
      settings = updatedSettings;
      
      // Update UI sliders
      if (humorSlider) humorSlider.value = updatedSettings.humor_level;
      if (humorValue) humorValue.textContent = updatedSettings.humor_level;
      if (honestySlider) honestySlider.value = updatedSettings.honesty_level;
      if (honestyValue) honestyValue.textContent = updatedSettings.honesty_level;
      if (sentimentalitySlider) sentimentalitySlider.value = updatedSettings.sentimentality_level;
      if (sentimentalityValue) sentimentalityValue.textContent = updatedSettings.sentimentality_level;
      if (energySlider) energySlider.value = updatedSettings.energy_level;
      if (energyValue) energyValue.textContent = updatedSettings.energy_level;
      if (adviceSlider) adviceSlider.value = updatedSettings.advice_level;
      if (adviceValue) adviceValue.textContent = updatedSettings.advice_level;
      
      showSuccess('Tone settings applied successfully!');
      
      // Auto-create snapshot
      await createBoostSnapshot();
      
      // Disable apply button
      if (applyToneBtn) {
        applyToneBtn.textContent = 'Applied ✓';
        applyToneBtn.disabled = true;
      }
    } else {
      showError(result.message || 'Failed to apply tone suggestions');
    }
  } catch (error) {
    console.error('Failed to apply tone suggestions:', error);
    showError('Failed to apply tone suggestions');
  }
}

// Create boost snapshot
let boostSnapshotCreated = false;
async function createBoostSnapshot() {
  if (boostSnapshotCreated || !selectedPersonaId) return;
  
  try {
    const name = `Auto Snapshot – Persona Booster (${new Date().toLocaleString()})`;
    const response = await fetch(`/api/personas/${selectedPersonaId}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    const result = await response.json();
    
    if (result.success) {
      snapshots.push(result.data);
      displaySnapshots();
      boostSnapshotCreated = true;
    }
  } catch (error) {
    console.error('Failed to create boost snapshot:', error);
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

// Show pre-roll message for first conversation
function showPreRollMessage() {
  // Remove empty state or incomplete setup state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Add pre-roll message
  const preRoll = document.createElement('div');
  preRoll.className = 'pre-roll-message';
  preRoll.id = 'pre-roll-message';
  preRoll.innerHTML = `
    <p>EverSpeak is gently gathering what you\'ve shared about this person…</p>
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  chatMessages.appendChild(preRoll);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return preRoll;
}

// Remove pre-roll message
function removePreRollMessage() {
  const preRoll = document.getElementById('pre-roll-message');
  if (preRoll) {
    preRoll.remove();
  }
}

// Add message to chat
function addMessageToChat(sender, message, isUser, isFirstMessage = false) {
  const messageDiv = document.createElement('div');
  let className = `message ${isUser ? 'user' : 'persona'}`;
  if (isFirstMessage && !isUser) {
    className += ' first-message';
  }
  messageDiv.className = className;
  messageDiv.setAttribute('data-testid', `message-${isUser ? 'user' : 'persona'}`);
  
  let messageHTML = `
    <div class="message-header">${escapeHtml(sender)}</div>
    <div class="message-bubble">${escapeHtml(message)}</div>
  `;
  
  // Add grounding line for persona messages (not for user or system messages)
  if (!isUser && sender !== 'System') {
    const personaName = sender;
    messageHTML += `
      <div class="message-grounding">Based on the memories you\'ve shared about ${escapeHtml(personaName)}.</div>
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
  
  // Remove placeholder or empty state if exists
  const placeholder = chatMessages.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  if (emptyState) {
    emptyState.style.display = 'none';
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
  // Remove all messages but preserve the empty-state div
  const messages = chatMessages.querySelectorAll('.message, .pre-roll-message');
  messages.forEach(msg => msg.remove());
  
  // Remove placeholder if exists
  const placeholder = chatMessages.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Show empty state with default message
  if (emptyState) {
    emptyState.innerHTML = '<p>To begin, create or select someone you\'d like to talk to.</p>';
    emptyState.style.display = 'block';
  }
  
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
