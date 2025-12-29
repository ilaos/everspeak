"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingPersistence = exports.SAMPLE_PERSONA_DATA = void 0;
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
// Storage keys
var STORAGE_KEYS = {
    ONBOARDING_STATE: 'everspeak_onboarding_state',
    DRAFT_ANSWERS: 'everspeak_onboarding_drafts',
};
// Sample persona data for dev tools
exports.SAMPLE_PERSONA_DATA = {
    'q1': {
        questionId: 'q1',
        textInput: 'John Smith',
        voiceTranscript: '',
        selectedOption: null,
        lastUpdated: new Date().toISOString(),
    },
    'q2': {
        questionId: 'q2',
        textInput: '',
        voiceTranscript: '',
        selectedOption: 'parent',
        lastUpdated: new Date().toISOString(),
    },
    'q3': {
        questionId: 'q3',
        textInput: 'He had a warm, hearty laugh and always knew how to lighten the mood. Quick-witted with a dry sense of humor, but also deeply caring and thoughtful.',
        voiceTranscript: '',
        selectedOption: null,
        lastUpdated: new Date().toISOString(),
    },
    'q4': {
        questionId: 'q4',
        textInput: 'Summer road trips to the lake, teaching me how to fish, Sunday morning pancakes with his "secret" recipe.',
        voiceTranscript: '',
        selectedOption: null,
        lastUpdated: new Date().toISOString(),
    },
    'q5': {
        questionId: 'q5',
        textInput: '"Hard work beats talent when talent doesn\'t work hard" - he said this whenever I felt discouraged.',
        voiceTranscript: '',
        selectedOption: null,
        lastUpdated: new Date().toISOString(),
    },
};
exports.onboardingPersistence = {
    // Save the current onboarding state
    saveState: function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var existingData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAllStates()];
                    case 1:
                        existingData = _a.sent();
                        existingData[state.personaId] = __assign(__assign({}, state), { lastUpdated: new Date().toISOString() });
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(existingData))];
                    case 2:
                        _a.sent();
                        console.log('[Persistence] Saved onboarding state for persona:', state.personaId);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('[Persistence] Failed to save onboarding state:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Get onboarding state for a specific persona
    getState: function (personaId) {
        return __awaiter(this, void 0, void 0, function () {
            var allStates, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAllStates()];
                    case 1:
                        allStates = _a.sent();
                        return [2 /*return*/, allStates[personaId] || null];
                    case 2:
                        error_2 = _a.sent();
                        console.error('[Persistence] Failed to get onboarding state:', error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Get all persisted states
    getAllStates: function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, async_storage_1.default.getItem(STORAGE_KEYS.ONBOARDING_STATE)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data ? JSON.parse(data) : {}];
                    case 2:
                        error_3 = _a.sent();
                        console.error('[Persistence] Failed to get all states:', error_3);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Save a draft answer (on every input change)
    saveDraftAnswer: function (personaId, draft) {
        return __awaiter(this, void 0, void 0, function () {
            var allDrafts, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 1:
                        allDrafts = _a.sent();
                        if (!allDrafts[personaId]) {
                            allDrafts[personaId] = {};
                        }
                        allDrafts[personaId][draft.questionId] = __assign(__assign({}, draft), { lastUpdated: new Date().toISOString() });
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts))];
                    case 2:
                        _a.sent();
                        console.log('[Persistence] Saved draft for question:', draft.questionId);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('[Persistence] Failed to save draft answer:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Get draft answer for a specific question
    getDraftAnswer: function (personaId, questionId) {
        return __awaiter(this, void 0, void 0, function () {
            var allDrafts, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 1:
                        allDrafts = _b.sent();
                        return [2 /*return*/, ((_a = allDrafts[personaId]) === null || _a === void 0 ? void 0 : _a[questionId]) || null];
                    case 2:
                        error_5 = _b.sent();
                        console.error('[Persistence] Failed to get draft answer:', error_5);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Get all drafts for a persona
    getPersonaDrafts: function (personaId) {
        return __awaiter(this, void 0, void 0, function () {
            var allDrafts, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 1:
                        allDrafts = _a.sent();
                        return [2 /*return*/, allDrafts[personaId] || {}];
                    case 2:
                        error_6 = _a.sent();
                        console.error('[Persistence] Failed to get persona drafts:', error_6);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Get all drafts
    getAllDrafts: function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, async_storage_1.default.getItem(STORAGE_KEYS.DRAFT_ANSWERS)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data ? JSON.parse(data) : {}];
                    case 2:
                        error_7 = _a.sent();
                        console.error('[Persistence] Failed to get all drafts:', error_7);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Clear draft for a specific question (after successful server save)
    clearDraft: function (personaId, questionId) {
        return __awaiter(this, void 0, void 0, function () {
            var allDrafts, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 1:
                        allDrafts = _a.sent();
                        if (!allDrafts[personaId]) return [3 /*break*/, 3];
                        delete allDrafts[personaId][questionId];
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        console.error('[Persistence] Failed to clear draft:', error_8);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    // ==================== DEV TOOLS ====================
    // Reset onboarding for a persona (clear state and drafts)
    resetOnboarding: function (personaId) {
        return __awaiter(this, void 0, void 0, function () {
            var allStates, allDrafts, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getAllStates()];
                    case 1:
                        allStates = _a.sent();
                        delete allStates[personaId];
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(allStates))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 3:
                        allDrafts = _a.sent();
                        delete allDrafts[personaId];
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts))];
                    case 4:
                        _a.sent();
                        console.log('[DevTools] Reset onboarding for persona:', personaId);
                        return [3 /*break*/, 6];
                    case 5:
                        error_9 = _a.sent();
                        console.error('[DevTools] Failed to reset onboarding:', error_9);
                        throw error_9;
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    // Reset all onboarding data
    resetAllOnboarding: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, async_storage_1.default.multiRemove([STORAGE_KEYS.ONBOARDING_STATE, STORAGE_KEYS.DRAFT_ANSWERS])];
                    case 1:
                        _a.sent();
                        console.log('[DevTools] Reset all onboarding data');
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('[DevTools] Failed to reset all onboarding:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Load sample persona data into drafts
    loadSamplePersona: function (personaId) {
        return __awaiter(this, void 0, void 0, function () {
            var allDrafts, allStates, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 1:
                        allDrafts = _a.sent();
                        allDrafts[personaId] = __assign({}, exports.SAMPLE_PERSONA_DATA);
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getAllStates()];
                    case 3:
                        allStates = _a.sent();
                        allStates[personaId] = {
                            personaId: personaId,
                            personaName: 'Sample Persona',
                            currentQuestionIndex: Object.keys(exports.SAMPLE_PERSONA_DATA).length,
                            progress: {
                                totalQuestions: 10,
                                answeredCount: Object.keys(exports.SAMPLE_PERSONA_DATA).length,
                                answeredQuestionIds: Object.keys(exports.SAMPLE_PERSONA_DATA),
                                percentComplete: (Object.keys(exports.SAMPLE_PERSONA_DATA).length / 10) * 100,
                            },
                            lastUpdated: new Date().toISOString(),
                            isComplete: false,
                        };
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(allStates))];
                    case 4:
                        _a.sent();
                        console.log('[DevTools] Loaded sample persona data for:', personaId);
                        return [3 /*break*/, 6];
                    case 5:
                        error_11 = _a.sent();
                        console.error('[DevTools] Failed to load sample persona:', error_11);
                        throw error_11;
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    // Skip to a specific step
    skipToStep: function (personaId, personaName, stepIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var allStates, error_12;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAllStates()];
                    case 1:
                        allStates = _b.sent();
                        allStates[personaId] = {
                            personaId: personaId,
                            personaName: personaName,
                            currentQuestionIndex: stepIndex,
                            progress: ((_a = allStates[personaId]) === null || _a === void 0 ? void 0 : _a.progress) || null,
                            lastUpdated: new Date().toISOString(),
                            isComplete: false,
                        };
                        return [4 /*yield*/, async_storage_1.default.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(allStates))];
                    case 2:
                        _b.sent();
                        console.log('[DevTools] Skipped to step:', stepIndex);
                        return [3 /*break*/, 4];
                    case 3:
                        error_12 = _b.sent();
                        console.error('[DevTools] Failed to skip to step:', error_12);
                        throw error_12;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Get debug info
    getDebugInfo: function () {
        return __awaiter(this, void 0, void 0, function () {
            var states, drafts, allKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllStates()];
                    case 1:
                        states = _a.sent();
                        return [4 /*yield*/, this.getAllDrafts()];
                    case 2:
                        drafts = _a.sent();
                        return [4 /*yield*/, async_storage_1.default.getAllKeys()];
                    case 3:
                        allKeys = _a.sent();
                        return [2 /*return*/, {
                                states: states,
                                drafts: drafts,
                                storageKeys: allKeys.filter(function (k) { return k.startsWith('everspeak'); }),
                            }];
                }
            });
        });
    },
    // Export all data (for debugging)
    exportData: function () {
        return __awaiter(this, void 0, void 0, function () {
            var debugInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDebugInfo()];
                    case 1:
                        debugInfo = _a.sent();
                        return [2 /*return*/, JSON.stringify(debugInfo, null, 2)];
                }
            });
        });
    },
};
// Expose dev tools to global scope in development
if (__DEV__) {
    global.onboardingDevTools = {
        reset: function (personaId) { return exports.onboardingPersistence.resetOnboarding(personaId); },
        resetAll: function () { return exports.onboardingPersistence.resetAllOnboarding(); },
        loadSample: function (personaId) { return exports.onboardingPersistence.loadSamplePersona(personaId); },
        skipTo: function (personaId, personaName, step) {
            return exports.onboardingPersistence.skipToStep(personaId, personaName, step);
        },
        debug: function () { return exports.onboardingPersistence.getDebugInfo(); },
        export: function () { return exports.onboardingPersistence.exportData(); },
    };
    console.log('[DevTools] Onboarding dev tools available on global.onboardingDevTools');
}
