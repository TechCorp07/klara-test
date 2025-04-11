// components/ui/Modal.js
import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Reusable modal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Title of the modal
 * @param {React.ReactNode} props.children - Content of the modal
 * @param {string} props.size - Size of the modal ('sm', 'md', 'lg', 'xl')
 * @param {boolean} props.closeOnClickOutside - Whether to close the modal when clicking outside
 * @param {React.ReactNode} props.footer - Footer content for the modal
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  closeOnClickOutside = true,
  footer = null
}) => {
  const modalRef = useRef(null);

  // Close on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle click outside
  const handleClickOutside = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Get modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '3xl': return 'max-w-3xl';
      case '4xl': return 'max-w-4xl';
      case 'full': return 'max-w-full';
      case 'md':
      default: return 'max-w-md';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? 'modal-title' : undefined}
      role="dialog"
      aria-modal="true"
      onClick={handleClickOutside}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={`relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${getModalWidth()} w-full`}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
          
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 
                className="text-lg font-medium text-gray-900" 
                id="modal-title"
              >
                {title}
              </h3>
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
