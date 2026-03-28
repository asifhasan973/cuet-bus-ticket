import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-dark-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h3 className="font-bold text-lg text-dark-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-dark-100 transition-colors"
          >
            <HiX className="text-lg" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
