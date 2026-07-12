import React, { useState, useEffect } from "react";
import Card from "../common/Card";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";
import { UserPlus } from "lucide-react";

export default function AllocationForm({
  assets = [],
  employees = [],
  selectedAssetId,
  setSelectedAssetId,
  selectedEmployeeId,
  setSelectedEmployeeId,
  expectedReturnDate,
  setExpectedReturnDate,
  onAllocate
}) {
  const [error, setError] = useState("");
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const isAlreadyAllocated = selectedAsset && selectedAsset.status !== "Available";

  // Pre-set a default expected return date of 30 days from now
  useEffect(() => {
    if (!expectedReturnDate) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      setExpectedReturnDate(date.toISOString().split("T")[0]);
    }
  }, [expectedReturnDate, setExpectedReturnDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError("Please select an asset.");
      return;
    }
    if (!selectedEmployeeId) {
      setError("Please select an employee.");
      return;
    }
    if (!expectedReturnDate) {
      setError("Please select an expected return date.");
      return;
    }

    if (isAlreadyAllocated) {
      setError("Asset is already allocated. Use Transfer Request instead.");
      return;
    }

    setError("");
    onAllocate(selectedAssetId, selectedEmployeeId, expectedReturnDate);
  };

  const assetOptions = assets.map(a => ({
    value: a.id,
    label: `${a.name} (${a.id}) — ${a.status}`
  }));

  const employeeOptions = employees.map(e => ({
    value: e.id,
    label: `${e.name} (${e.department})`
  }));

  return (
    <Card 
      title="Assign Asset Checkout" 
      subtitle="Issue hardware items to employees."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Select Asset"
          options={assetOptions}
          value={selectedAssetId}
          onChange={(e) => {
            setSelectedAssetId(e.target.value);
            setError("");
          }}
          placeholder="Choose hardware asset..."
          required
        />

        <Select
          label="Select Employee"
          options={employeeOptions}
          value={selectedEmployeeId}
          onChange={(e) => {
            setSelectedEmployeeId(e.target.value);
            setError("");
          }}
          placeholder="Choose recipient employee..."
          required
        />

        <Input
          label="Expected Return Date"
          type="date"
          value={expectedReturnDate}
          onChange={(e) => {
            setExpectedReturnDate(e.target.value);
            setError("");
          }}
          required
        />

        {error && (
          <span className="text-xs font-medium text-rose-450 mt-1 block">
            {error}
          </span>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="success"
            icon={UserPlus}
            className="w-full font-semibold"
            disabled={isAlreadyAllocated || !selectedAssetId || !selectedEmployeeId}
          >
            {isAlreadyAllocated ? "Asset Unavailable" : "Complete Asset Allocation"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
