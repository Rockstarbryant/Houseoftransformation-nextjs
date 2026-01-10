import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl w-full ${sizes[size]} my-8 flex flex-col max-h-[90vh]`}>
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
            {title && <h2 className="text-2xl font-bold text-blue-900">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showCloseButton: PropTypes.bool
};

export default Modal;