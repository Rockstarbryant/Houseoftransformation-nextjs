import React from 'react';
import Modal from '../common/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
  return (
    <Modal isOpen={true} onClose={onClose} size="sm">
      {mode === 'login' ? (
        <LoginForm onSuccess={onClose} onSwitchToSignup={() => onSwitchMode('signup')} />
      ) : (
        <SignupForm onSuccess={onClose} onSwitchToLogin={() => onSwitchMode('login')} />
      )}
    </Modal>
  );
};

export default AuthModal;