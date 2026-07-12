import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800/80 rounded-xl shadow-2xl p-6 overflow-hidden transition-all duration-300 animate-in fade-in-0 zoom-in-95 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-5">
          {title && <h3 className="text-md font-semibold text-zinc-100">{title}</h3>}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 hover:bg-zinc-800 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
