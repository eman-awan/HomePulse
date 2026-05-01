import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import InputField from './InputField';
import { useAuthStore } from '../store/useAuthStore';

interface QuickBudgetModalProps {
  visible: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function QuickBudgetModal({ visible, onClose }: QuickBudgetModalProps) {
  const { user, updateBudget } = useAuthStore();
  const [budget, setBudget] = useState(user?.budget_limit?.toString() || '500');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && user) {
      setBudget(user.budget_limit?.toString() || '500');
      setError('');
    }
  }, [visible, user]);

  const handleSave = () => {
    setError('');
    const val = parseFloat(budget);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid budget limit');
      return;
    }
    updateBudget(val);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Budget Limit</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>Update your monthly global budget limit.</Text>

          <InputField
            label="Budget Limit ($)"
            placeholder="e.g. 500"
            value={budget}
            onChangeText={(text) => { setBudget(text); setError(''); }}
            keyboardType="numeric"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F5F5F7',
    borderRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3250',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  errorText: {
    color: '#C55A5A',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2D3250',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
