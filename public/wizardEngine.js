// Wizard Engine - Dynamic Question-Driven Onboarding
// Version 1.0.0

console.log('WizardEngine loaded');

class WizardEngine {
  constructor() {
    this.questions = [];
    this.sections = [];
    this.currentStep = 0; // 0 = welcome, 1-N = questions, N+1 = completion
    this.totalSteps = 0;
    this.answers = {};
    this.personaId = null;
    this.userName = '';
    this.lovedOneName = '';
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingTimer = null;
    this.recordingSeconds = 0;
  }

  // Initialize wizard with questions from API
  async init() {
    try {
      const response = await fetch('/api/onboarding/questions');
      const result = await response.json();

      if (result.success) {
        this.questions = result.data.questions;
        this.sections = result.data.sections;
        this.totalSteps = result.data.totalQuestions + 2; // +2 for welcome & completion
        console.log(`WizardEngine: Loaded ${this.questions.length} questions`);
      } else {
        console.error('Failed to load questions:', result.message);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  }

  // Generate the wizard HTML
  generateWizardHTML() {
    return `
      <div id="wizard-modal" class="modal wizard-modal" style="display: none;">
        <div class="modal-content wizard-content">
          <div class="wizard-header">
            <button class="wizard-close-btn" id="wizard-close-btn">&times;</button>
          </div>

          <!-- Section Progress -->
          <div class="wizard-section-progress" id="wizard-section-progress">
            <div class="section-indicator">
              <span class="section-name" id="wizard-section-name">Getting Started</span>
              <span class="section-step" id="wizard-section-step">1 of 2</span>
            </div>
          </div>

          <!-- Overall Progress Bar -->
          <div class="wizard-progress-bar">
            <div class="progress-fill" id="wizard-progress-fill"></div>
          </div>
          <p class="wizard-progress-text">
            Question <span id="wizard-current-q">1</span> of <span id="wizard-total-q">${this.questions.length}</span>
          </p>

          <!-- Step Container -->
          <div class="wizard-step-container" id="wizard-step-container">
            ${this.generateWelcomeStep()}
            ${this.questions.map((q, i) => this.generateQuestionStep(q, i + 1)).join('')}
            ${this.generateCompletionStep()}
          </div>

          <!-- Navigation -->
          <div class="wizard-nav">
            <button type="button" class="btn-wizard-prev" id="wizard-prev-btn" style="display: none;">Back</button>
            <div class="nav-spacer"></div>
            <button type="button" class="btn-wizard-next" id="wizard-next-btn">Next</button>
          </div>
        </div>
      </div>

      <!-- Breathing Exercise Screen -->
      <div class="wizard-breathing-screen" id="wizard-breathing-screen" style="display: none;">
        <div class="breathing-container">
          <h3 class="breathing-title">Let's take a moment together...</h3>
          <p class="breathing-instruction" id="breathing-instruction">Breathe in</p>
          <div class="breathing-circle-container">
            <div class="breathing-circle" id="breathing-circle">
              <div class="breathing-circle-inner"></div>
            </div>
          </div>
          <p class="breathing-subtitle">Just breathe with me</p>
          <button type="button" class="btn-skip-breathing" id="btn-skip-breathing">Skip</button>
        </div>
      </div>

      <!-- Microphone Permission Help Modal -->
      <div class="permission-help-modal" id="permission-help-modal" style="display: none;">
        <div class="permission-help-content">
          <h3>Microphone Access Needed</h3>
          <p id="permission-instructions"></p>
          <button type="button" class="btn-permission-ok" id="btn-permission-ok">Got it</button>
        </div>
      </div>
    `;
  }

  generateWelcomeStep() {
    return `
      <div class="wizard-step wizard-step-welcome active" data-step="0">
        <div class="wizard-welcome-main" id="wizard-welcome-main">
          <h3>Welcome to EverSpeak.</h3>
          <p class="step-description">Before we begin, I want to gently explain what this space is for.</p>
          <p class="step-description">EverSpeak was created to help you reconnect with the memory, personality, and presence of someone you've lost - not by replacing them, but by honoring the stories and love you shared.</p>
          <p class="step-description">To do that, I'll ask you some thoughtful questions. Each one helps me understand your loved one more fully - their personality, their humor, and the role they played in your life.</p>
          <p class="step-description">You are always in control. You can skip anything that feels too hard, and you can stop at any time. This isn't a test. It's a conversation we'll take at your pace.</p>

          <div class="voice-space-recommendation">
            <div class="voice-space-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <p class="voice-space-text"><strong>A gentle note:</strong> This experience works best when you can speak your answers aloud. If possible, find a quiet, private space where you feel comfortable speaking openly.</p>
          </div>

          <div class="wizard-welcome-actions">
            <button type="button" class="btn-wizard-primary" id="btn-wizard-ready">I'm ready to begin</button>
            <button type="button" class="btn-wizard-continue" id="btn-wizard-continue" style="display: none;">Continue where you left off</button>
            <button type="button" class="btn-wizard-secondary" id="btn-wizard-tell-more">I'm not sure... tell me more</button>
          </div>
        </div>

        <div class="wizard-welcome-more" id="wizard-welcome-more" style="display: none;">
          <h3>Of course. This isn't something anyone rushes into.</h3>
          <p class="step-description">EverSpeak will never pretend to actually be your loved one, and it will never claim to know things you didn't share. Instead, it listens closely to the memories you choose to tell and reflects them back with care, respect, and gentleness.</p>
          <p class="step-description">Many people find that simply talking about their loved one - telling stories, recalling their voice, remembering the small things - can bring comfort or even healing.</p>
          <p class="step-description">You can share as little or as much as you like. Nothing you share will be used for anything other than helping you build that experience.</p>

          <div class="wizard-welcome-actions">
            <button type="button" class="btn-wizard-primary" id="btn-wizard-okay-begin">Okay, let's begin</button>
            <button type="button" class="btn-wizard-secondary" id="btn-wizard-back-to-welcome">Back</button>
          </div>
        </div>
      </div>
    `;
  }

  generateQuestionStep(question, stepNumber) {
    const section = this.sections.find(s => s.id === question.sectionId);
    const isVoice = question.inputType === 'voice_primary';
    const isSelect = question.inputType === 'select';

    return `
      <div class="wizard-step" data-step="${stepNumber}" data-question-id="${question.id}" data-field="${question.fieldId}" style="display: none;">
        <div class="step-content">
          ${question.subtext ? `<p class="step-subtext">${question.subtext}</p>` : ''}
          <p class="step-question">${question.prompt}</p>

          ${isSelect ? this.generateSelectInput(question) : ''}
          ${isVoice ? this.generateVoiceInput(question, stepNumber) : ''}

          ${question.optional ? `
            <button type="button" class="btn-skip-step" data-skip-step="${stepNumber}">I'd rather not say</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  generateVoiceInput(question, stepNumber) {
    return `
      <div class="voice-recorder-container" data-field="${question.fieldId}">
        ${question.example ? `<p class="voice-guidance">${question.example}</p>` : ''}

        <!-- Default state: mic button -->
        <div class="voice-recorder-default">
          <button type="button" class="btn-start-recording" data-step="${stepNumber}">
            <svg class="mic-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
          <p class="tap-to-record">Tap to record</p>
        </div>

        <!-- Recording state -->
        <div class="voice-recorder-recording" style="display: none;">
          <div class="recording-indicator">
            <span class="recording-dot"></span>
            <span class="recording-timer">0:00</span>
          </div>
          <div class="slide-to-cancel">
            <span class="slide-arrow">&larr;</span>
            <span class="slide-text">Slide to cancel</span>
          </div>
          <button type="button" class="btn-stop-recording">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        </div>

        <!-- Processing state -->
        <div class="voice-recorder-processing" style="display: none;">
          <div class="processing-spinner"></div>
          <p class="processing-text">Transcribing...</p>
        </div>

        <!-- Complete state -->
        <div class="voice-recorder-complete" style="display: none;">
          <div class="transcription-preview">
            <p class="transcription-text"></p>
            <button type="button" class="btn-re-record">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Hidden input for value -->
        <input type="hidden" id="answer-${question.fieldId}" data-field="${question.fieldId}">

        <!-- Type fallback -->
        <div class="type-fallback">
          <button type="button" class="btn-type-instead">I'd rather type my answer</button>
        </div>

        <!-- Text input (hidden by default) -->
        <div class="text-input-fallback" style="display: none;">
          <textarea class="wizard-text-input" id="text-${question.fieldId}" placeholder="Type your answer here..." rows="4"></textarea>
          <button type="button" class="btn-use-voice">Use voice instead</button>
        </div>
      </div>
    `;
  }

  generateSelectInput(question) {
    return `
      <div class="select-container">
        <div class="select-options">
          ${question.options.map(opt => `
            <label class="select-option">
              <input type="radio" name="select-${question.fieldId}" value="${opt.value}">
              <span class="option-label">${opt.label}</span>
            </label>
          `).join('')}
        </div>
        <input type="hidden" id="answer-${question.fieldId}" data-field="${question.fieldId}">
      </div>
    `;
  }

  generateCompletionStep() {
    return `
      <div class="wizard-step wizard-step-completion" data-step="${this.questions.length + 1}" style="display: none;">
        <div class="completion-content">
          <div class="completion-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h3>Thank you for sharing.</h3>
          <p class="completion-text">What you've shared will help create a meaningful connection with <span id="completion-name">them</span>.</p>
          <p class="completion-subtext">EverSpeak takes this information and builds your loved one's persona. You can always visit settings to add new memories for a richer experience.</p>

          <div class="wizard-progress-container" id="wizard-building-progress" style="display: none;">
            <p class="wizard-progress-text">Building persona...</p>
            <div class="wizard-progress-bar">
              <div class="wizard-progress-fill" id="building-progress-fill"></div>
            </div>
          </div>

          <button type="button" class="btn-wizard-begin" id="btn-begin-conversation" style="display: none;">
            Begin your first conversation
          </button>
        </div>
      </div>
    `;
  }

  // Show the wizard
  open(personaId) {
    this.personaId = personaId;
    this.currentStep = 0;

    const modal = document.getElementById('wizard-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('visible'), 10);
      this.updateUI();
      this.attachEventListeners();

      // Hide bottom tab bar
      const tabBar = document.getElementById('bottom-tab-bar');
      if (tabBar) tabBar.style.display = 'none';
    }
  }

  // Close the wizard
  close() {
    const modal = document.getElementById('wizard-modal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.style.display = 'none', 300);

      // Show bottom tab bar
      const tabBar = document.getElementById('bottom-tab-bar');
      if (tabBar) tabBar.style.display = 'flex';
    }
  }

  // Navigate to next step
  async next() {
    // Save current answer
    await this.saveCurrentAnswer();

    // Show breathing exercise between some steps (not on every step)
    const showBreathing = this.currentStep > 0 &&
                          this.currentStep < this.questions.length &&
                          this.currentStep % 5 === 0;

    if (showBreathing) {
      await this.showBreathingExercise();
    }

    this.currentStep++;
    this.updateUI();
    this.saveProgress();
  }

  // Navigate to previous step
  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateUI();
    }
  }

  // Update UI based on current step
  updateUI() {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
      step.style.display = 'none';
      step.classList.remove('active');
    });

    // Show current step
    const currentStepEl = document.querySelector(`.wizard-step[data-step="${this.currentStep}"]`);
    if (currentStepEl) {
      currentStepEl.style.display = 'block';
      setTimeout(() => currentStepEl.classList.add('active'), 20);
    }

    // Update progress bar
    const progressFill = document.getElementById('wizard-progress-fill');
    const currentQ = document.getElementById('wizard-current-q');
    const totalQ = document.getElementById('wizard-total-q');

    if (this.currentStep === 0) {
      // Welcome step
      if (progressFill) progressFill.style.width = '0%';
      if (currentQ) currentQ.textContent = '0';
    } else if (this.currentStep > this.questions.length) {
      // Completion step
      if (progressFill) progressFill.style.width = '100%';
      if (currentQ) currentQ.textContent = this.questions.length;
    } else {
      const percent = Math.round((this.currentStep / this.questions.length) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (currentQ) currentQ.textContent = this.currentStep;
    }

    // Update section indicator
    this.updateSectionIndicator();

    // Update navigation buttons
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    if (prevBtn) {
      prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
    }

    if (nextBtn) {
      if (this.currentStep === 0) {
        nextBtn.style.display = 'none';
      } else if (this.currentStep > this.questions.length) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'block';
        nextBtn.textContent = this.currentStep === this.questions.length ? 'Complete' : 'Next';
      }
    }

    // Hide progress bar on welcome/completion steps
    const progressContainer = document.querySelector('.wizard-progress-bar');
    const progressText = document.querySelector('.wizard-progress-text');
    if (progressContainer) {
      progressContainer.style.display = this.currentStep === 0 || this.currentStep > this.questions.length ? 'none' : 'block';
    }
    if (progressText) {
      progressText.style.display = this.currentStep === 0 || this.currentStep > this.questions.length ? 'none' : 'block';
    }
  }

  updateSectionIndicator() {
    const sectionName = document.getElementById('wizard-section-name');
    const sectionStep = document.getElementById('wizard-section-step');
    const indicator = document.getElementById('wizard-section-progress');

    if (this.currentStep === 0 || this.currentStep > this.questions.length) {
      if (indicator) indicator.style.display = 'none';
      return;
    }

    if (indicator) indicator.style.display = 'flex';

    const currentQuestion = this.questions[this.currentStep - 1];
    if (!currentQuestion) return;

    const section = this.sections.find(s => s.id === currentQuestion.sectionId);
    const sectionQuestions = this.questions.filter(q => q.sectionId === currentQuestion.sectionId);
    const questionIndexInSection = sectionQuestions.findIndex(q => q.id === currentQuestion.id) + 1;

    if (sectionName && section) {
      sectionName.textContent = section.title;
    }
    if (sectionStep) {
      sectionStep.textContent = `${questionIndexInSection} of ${sectionQuestions.length}`;
    }
  }

  // Save current answer to local state
  async saveCurrentAnswer() {
    if (this.currentStep === 0 || this.currentStep > this.questions.length) return;

    const currentQuestion = this.questions[this.currentStep - 1];
    const fieldId = currentQuestion.fieldId;

    // Get value from hidden input or text input
    const hiddenInput = document.getElementById(`answer-${fieldId}`);
    const textInput = document.getElementById(`text-${fieldId}`);

    let value = '';
    if (hiddenInput?.value) {
      value = hiddenInput.value;
    } else if (textInput?.value) {
      value = textInput.value;
    }

    // For select inputs, get the selected radio value
    if (currentQuestion.inputType === 'select') {
      const selected = document.querySelector(`input[name="select-${fieldId}"]:checked`);
      if (selected) {
        value = selected.value;
        if (hiddenInput) hiddenInput.value = value;
      }
    }

    if (value) {
      this.answers[fieldId] = value;

      // Track special fields
      if (fieldId === 'user_name') {
        this.userName = value;
      } else if (fieldId === 'loved_one_name') {
        this.lovedOneName = value;
        // Update completion step name
        const completionName = document.getElementById('completion-name');
        if (completionName) completionName.textContent = value;
      }
    }
  }

  // Save progress to localStorage
  saveProgress() {
    const progress = {
      personaId: this.personaId,
      currentStep: this.currentStep,
      answers: this.answers,
      userName: this.userName,
      lovedOneName: this.lovedOneName,
      timestamp: Date.now()
    };
    localStorage.setItem('wizardProgress', JSON.stringify(progress));
  }

  // Load progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem('wizardProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        if (progress.personaId === this.personaId) {
          this.currentStep = progress.currentStep || 0;
          this.answers = progress.answers || {};
          this.userName = progress.userName || '';
          this.lovedOneName = progress.lovedOneName || '';
          return true;
        }
      } catch (e) {
        console.error('Error loading wizard progress:', e);
      }
    }
    return false;
  }

  // Show breathing exercise
  showBreathingExercise() {
    return new Promise((resolve) => {
      const breathingScreen = document.getElementById('wizard-breathing-screen');
      const breathingCircle = document.getElementById('breathing-circle');
      const instruction = document.getElementById('breathing-instruction');
      const skipBtn = document.getElementById('btn-skip-breathing');

      if (!breathingScreen) {
        resolve();
        return;
      }

      breathingScreen.style.display = 'flex';
      setTimeout(() => breathingScreen.classList.add('visible'), 10);

      let phase = 0;
      const phases = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
      const durations = [4000, 2000, 4000, 2000]; // 12 seconds total

      let completed = false;

      const runPhase = () => {
        if (completed) return;

        if (instruction) instruction.textContent = phases[phase];
        if (breathingCircle) {
          breathingCircle.classList.remove('inhale', 'hold', 'exhale');
          if (phase === 0) breathingCircle.classList.add('inhale');
          else if (phase === 2) breathingCircle.classList.add('exhale');
          else breathingCircle.classList.add('hold');
        }

        phase++;
        if (phase < phases.length) {
          setTimeout(runPhase, durations[phase - 1]);
        } else {
          setTimeout(() => {
            if (!completed) {
              completed = true;
              breathingScreen.classList.remove('visible');
              setTimeout(() => breathingScreen.style.display = 'none', 300);
              resolve();
            }
          }, durations[durations.length - 1]);
        }
      };

      runPhase();

      // Skip button handler
      if (skipBtn) {
        skipBtn.onclick = () => {
          completed = true;
          breathingScreen.classList.remove('visible');
          setTimeout(() => breathingScreen.style.display = 'none', 300);
          resolve();
        };
      }
    });
  }

  // Start voice recording
  async startRecording(stepNumber) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording(stepNumber);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingSeconds = 0;

      // Start timer
      const container = document.querySelector(`.wizard-step[data-step="${stepNumber}"] .voice-recorder-container`);
      if (container) {
        container.querySelector('.voice-recorder-default').style.display = 'none';
        container.querySelector('.voice-recorder-recording').style.display = 'flex';

        const timerEl = container.querySelector('.recording-timer');
        this.recordingTimer = setInterval(() => {
          this.recordingSeconds++;
          const mins = Math.floor(this.recordingSeconds / 60);
          const secs = this.recordingSeconds % 60;
          if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
      }
    } catch (error) {
      console.error('Recording error:', error);
      this.showMicrophoneHelp();
    }
  }

  // Stop voice recording
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;

      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
    }
  }

  // Process recorded audio
  async processRecording(stepNumber) {
    const container = document.querySelector(`.wizard-step[data-step="${stepNumber}"] .voice-recorder-container`);
    if (!container) return;

    // Show processing state
    container.querySelector('.voice-recorder-recording').style.display = 'none';
    container.querySelector('.voice-recorder-processing').style.display = 'flex';

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success && result.data.text) {
        const text = result.data.text;

        // Show complete state with transcription
        container.querySelector('.voice-recorder-processing').style.display = 'none';
        container.querySelector('.voice-recorder-complete').style.display = 'flex';
        container.querySelector('.transcription-text').textContent = text;

        // Store value in hidden input
        const fieldId = container.dataset.field;
        const hiddenInput = document.getElementById(`answer-${fieldId}`);
        if (hiddenInput) hiddenInput.value = text;
      } else {
        throw new Error(result.message || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      container.querySelector('.voice-recorder-processing').style.display = 'none';
      container.querySelector('.voice-recorder-default').style.display = 'flex';
      alert('Sorry, we couldn\'t transcribe your recording. Please try again or type your answer.');
    }
  }

  // Show microphone permission help
  showMicrophoneHelp() {
    const modal = document.getElementById('permission-help-modal');
    const instructions = document.getElementById('permission-instructions');

    if (!modal) return;

    // Detect browser/platform
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome|CriOS/i.test(ua) && !/Edge|Edg/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua);

    let message = '';

    if (isIOS && isSafari) {
      message = 'On iOS Safari: Go to Settings > Safari > Microphone, then ensure this site is allowed.';
    } else if (isIOS && isChrome) {
      message = 'On iOS Chrome: Tap the "Aa" icon in the address bar, then tap "Website Settings" and allow Microphone.';
    } else if (isAndroid && isChrome) {
      message = 'On Android Chrome: Tap the lock icon in the address bar, then tap "Permissions" and allow Microphone.';
    } else if (isChrome) {
      message = 'In Chrome: Click the lock icon in the address bar, find Microphone, and set it to Allow.';
    } else {
      message = 'Please check your browser settings to enable microphone access for this site.';
    }

    if (instructions) instructions.textContent = message;
    modal.style.display = 'flex';

    const okBtn = document.getElementById('btn-permission-ok');
    if (okBtn) {
      okBtn.onclick = () => modal.style.display = 'none';
    }
  }

  // Attach event listeners
  attachEventListeners() {
    // Close button
    const closeBtn = document.getElementById('wizard-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    // Navigation buttons
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    if (prevBtn) {
      prevBtn.onclick = () => this.prev();
    }

    if (nextBtn) {
      nextBtn.onclick = async () => {
        if (this.currentStep === this.questions.length) {
          // Complete the wizard
          await this.complete();
        } else {
          await this.next();
        }
      };
    }

    // Welcome screen buttons
    const readyBtn = document.getElementById('btn-wizard-ready');
    const okayBeginBtn = document.getElementById('btn-wizard-okay-begin');
    const tellMoreBtn = document.getElementById('btn-wizard-tell-more');
    const backToWelcomeBtn = document.getElementById('btn-wizard-back-to-welcome');

    if (readyBtn) {
      readyBtn.onclick = () => this.next();
    }

    if (okayBeginBtn) {
      okayBeginBtn.onclick = () => this.next();
    }

    if (tellMoreBtn) {
      tellMoreBtn.onclick = () => {
        document.getElementById('wizard-welcome-main').style.display = 'none';
        document.getElementById('wizard-welcome-more').style.display = 'block';
      };
    }

    if (backToWelcomeBtn) {
      backToWelcomeBtn.onclick = () => {
        document.getElementById('wizard-welcome-more').style.display = 'none';
        document.getElementById('wizard-welcome-main').style.display = 'block';
      };
    }

    // Voice recording buttons
    document.querySelectorAll('.btn-start-recording').forEach(btn => {
      btn.onclick = () => {
        const step = btn.dataset.step;
        this.startRecording(parseInt(step));
      };
    });

    document.querySelectorAll('.btn-stop-recording').forEach(btn => {
      btn.onclick = () => this.stopRecording();
    });

    document.querySelectorAll('.btn-re-record').forEach(btn => {
      btn.onclick = () => {
        const container = btn.closest('.voice-recorder-container');
        if (container) {
          container.querySelector('.voice-recorder-complete').style.display = 'none';
          container.querySelector('.voice-recorder-default').style.display = 'flex';
          const hiddenInput = container.querySelector('input[type="hidden"]');
          if (hiddenInput) hiddenInput.value = '';
        }
      };
    });

    // Type instead / voice instead toggles
    document.querySelectorAll('.btn-type-instead').forEach(btn => {
      btn.onclick = () => {
        const container = btn.closest('.voice-recorder-container');
        if (container) {
          container.querySelector('.voice-recorder-default').style.display = 'none';
          container.querySelector('.type-fallback').style.display = 'none';
          container.querySelector('.text-input-fallback').style.display = 'block';
        }
      };
    });

    document.querySelectorAll('.btn-use-voice').forEach(btn => {
      btn.onclick = () => {
        const container = btn.closest('.voice-recorder-container');
        if (container) {
          container.querySelector('.text-input-fallback').style.display = 'none';
          container.querySelector('.voice-recorder-default').style.display = 'flex';
          container.querySelector('.type-fallback').style.display = 'block';
        }
      };
    });

    // Skip buttons
    document.querySelectorAll('.btn-skip-step').forEach(btn => {
      btn.onclick = () => this.next();
    });

    // Begin conversation button
    const beginBtn = document.getElementById('btn-begin-conversation');
    if (beginBtn) {
      beginBtn.onclick = () => {
        this.close();
        // Navigate to conversation page
        if (typeof navigateToPage === 'function') {
          navigateToPage('conversation');
        }
      };
    }
  }

  // Complete the wizard and submit answers
  async complete() {
    await this.saveCurrentAnswer();
    this.currentStep = this.questions.length + 1;
    this.updateUI();

    const buildingProgress = document.getElementById('wizard-building-progress');
    const progressFill = document.getElementById('building-progress-fill');
    const beginBtn = document.getElementById('btn-begin-conversation');

    if (buildingProgress) buildingProgress.style.display = 'block';

    try {
      // Animate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        if (progressFill) progressFill.style.width = `${Math.min(progress, 90)}%`;
        if (progress >= 90) clearInterval(progressInterval);
      }, 100);

      // Submit to API
      const wizardInputs = {
        user_name: this.answers.user_name || '',
        first_name: this.answers.loved_one_name || '',
        relationship: this.answers.relationship_to_user || '',
        date_passed: this.answers.when_passed || '',
        circumstances: this.answers.how_passed || '',
        relationship_end: this.answers.persona_for || '',
        personality: this.answers.personality || '',
        at_their_best: this.answers.at_their_best || '',
        quirks_habits: this.answers.quirks_habits || '',
        their_laugh: this.answers.their_laugh || '',
        daily_rituals: this.answers.daily_rituals || '',
        how_they_spoke: this.answers.how_they_spoke || '',
        how_they_comforted: this.answers.how_they_comforted || '',
        phrases_sayings: this.answers.phrases_sayings || '',
        showing_love: this.answers.showing_love || '',
        what_mattered: this.answers.what_mattered || '',
        hard_times_belief: this.answers.hard_times_belief || '',
        want_to_remember: this.answers.want_to_remember || '',
        flaws_frustrations: this.answers.flaws_frustrations || '',
        important_memory: this.answers.important_memory || '',
        moments_shared: this.answers.moments_shared || '',
        if_walked_in: this.answers.if_walked_in || '',
        photos_videos: this.answers.photos_videos || '',
        topics_avoid: this.answers.topics_avoid || '',
        would_feel_wrong: this.answers.would_feel_wrong || '',
        awareness_level: this.answers.awareness_level || '',
        talk_about_presence: this.answers.talk_about_presence || '',
        anything_else: this.answers.anything_else || ''
      };

      const response = await fetch(`/api/personas/${this.personaId}/wizard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wizard_inputs: wizardInputs })
      });

      const result = await response.json();

      clearInterval(progressInterval);
      if (progressFill) progressFill.style.width = '100%';

      if (result.success) {
        // Clear saved progress
        localStorage.removeItem('wizardProgress');

        // Show begin button
        if (beginBtn) beginBtn.style.display = 'block';
      } else {
        throw new Error(result.message || 'Failed to save persona');
      }
    } catch (error) {
      console.error('Error completing wizard:', error);
      if (buildingProgress) buildingProgress.style.display = 'none';
      alert('There was an error saving your persona. Please try again.');
    }
  }
}

// Create global instance
window.wizardEngine = new WizardEngine();
