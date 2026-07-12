import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

export default function TransferModal({
  isOpen,
  onClose,
  asset,
  employees,
  onSubmit
}) {
  const [toEmployeeId, setToEmployeeId] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");

  const currentHolder = employees.find(e => e.id === asset?.currentHolderId) || {
    name: "N/A"
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setToEmployeeId("");
      setReason("");
      setPriority("Medium");
      setError("");
    }
  }, [isOpen]);

  const sameEmployee = (left, right) => String(left) === String(right);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!toEmployeeId) {
      setError("Please select the target recipient employee.");
      return;
    }
    if (sameEmployee(toEmployeeId, asset?.currentHolderId)) {
      setError("Cannot transfer an asset to its current holder.");
      return;
    }
    if (!reason.trim()) {
      setError("Please explain the reason for this transfer.");
      return;
    }

    onSubmit({
      assetId: asset.id,
      fromEmployeeId: asset.currentHolderId,
      toEmployeeId,
      reason,
      priority
    });
  };

  const recipientOptions = employees
    .filter(e => !sameEmployee(e.id, asset?.currentHolderId))
    .map(e => ({ value: e.id, label: `${e.name} (${e.department})` }));

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Asset Transfer" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {asset && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs flex justify-between">
            <div>
              <span className="text-slate-500 block">Asset to Transfer</span>
              <strong className="text-slate-205">{asset.name}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Serial / ID</span>
              <strong className="text-slate-205">{asset.id}</strong>
            </div>
          </div>
        )}

        <Input
          label="From Employee (Current Holder)"
          value={currentHolder.name}
          disabled
          readOnly
          className="bg-slate-950 text-slate-500 border-slate-850"
        />

        <Select
          label="To Employee (Recipient)"
          options={recipientOptions}
          value={toEmployeeId}
          onChange={(e) => {
            setToEmployeeId(e.target.value);
            setError("");
          }}
          placeholder="Select recipient employee..."
          required
        />

        <Select
          label="Priority Level"
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Reason for Transfer</label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="Explain why this transfer is needed..."
            rows="3"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-sm py-2 px-3 placeholder-slate-500 hover:border-slate-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 resize-none"
            required
          />
        </div>

        {error && (
          <span className="text-xs font-medium text-rose-450 mt-1 block">
            {error}
          </span>
        )}

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
