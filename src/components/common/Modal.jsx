import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = "md"
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Prevent body scroll when dialog is active
        document.body.style.overflow = "hidden";
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className={`
        fixed bg-slate-800 border border-slate-750 rounded-xl text-slate-100 p-0 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm
        w-[calc(100%-2rem)] md:w-full ${sizes[size]}
        outline-none focus:outline-none transition-all duration-300
        left-0 right-0 top-0 bottom-0 m-auto
        open:scale-100 scale-95 opacity-0 open:opacity-100
        ${className}
      `}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: "200ms"
      }}
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h3>
          <Button
            variant="ghost"
            onClick={onClose}
            icon={X}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 active:scale-95"
          />
        </div>
        
        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto text-sm text-slate-350">
          {children}
        </div>
      </div>
    </dialog>
  );
}
