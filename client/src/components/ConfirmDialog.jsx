import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  confirmVariant = "danger",
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
          <ExclamationTriangleIcon className="h-6 w-6" />
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>
        <div className="flex items-center space-x-3 w-full pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
