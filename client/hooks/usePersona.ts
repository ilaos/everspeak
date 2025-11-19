import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Persona } from '../types';
import { personaService } from '../services/personaService';

const SELECTED_PERSONA_KEY = '@everspeak/selected_persona_id';

export function useSelectedPersona() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load selected persona ID from storage
  useEffect(() => {
    loadSelectedPersonaId();
  }, []);

  // Load persona details when ID changes
  useEffect(() => {
    if (selectedPersonaId) {
      loadPersonaDetails(selectedPersonaId);
    } else {
      setSelectedPersona(null);
      setLoading(false);
    }
  }, [selectedPersonaId]);

  const loadSelectedPersonaId = async () => {
    try {
      const id = await AsyncStorage.getItem(SELECTED_PERSONA_KEY);
      setSelectedPersonaId(id);
    } catch (err) {
      console.error('Failed to load selected persona ID:', err);
      setLoading(false);
    }
  };

  const loadPersonaDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await personaService.getPersona(id);
      setSelectedPersona(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load persona');
      setSelectedPersona(null);
    } finally {
      setLoading(false);
    }
  };

  const selectPersona = async (id: string | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem(SELECTED_PERSONA_KEY, id);
      } else {
        await AsyncStorage.removeItem(SELECTED_PERSONA_KEY);
      }
      setSelectedPersonaId(id);
    } catch (err) {
      console.error('Failed to save selected persona ID:', err);
    }
  };

  const refreshPersona = () => {
    if (selectedPersonaId) {
      loadPersonaDetails(selectedPersonaId);
    }
  };

  return {
    selectedPersonaId,
    selectedPersona,
    loading,
    error,
    selectPersona,
    refreshPersona,
  };
}
