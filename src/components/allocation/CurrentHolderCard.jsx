import React from "react";
import { AlertTriangle, RefreshCw, Calendar, User, Briefcase } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

export default function CurrentHolderCard({ asset, employees, onTransferRequest }) {
  if (!asset || asset.status === "Available") return null;

  const holder = employees.find(e => e.id === asset.currentHolderId) || {
    name: "Unknown Employee",
    department: "N/A"
  };

  const isOverdue = asset.status === "Overdue";

  return (
    <Card
      className={`border-l-4 ${
        isOverdue ? "border-l-rose-500 border-rose-500/25 bg-rose-500/5" : "border-l-amber-500 border-amber-500/25 bg-amber-500/5"
      } animate-pulse`}
      padding="p-5"
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg shrink-0 ${
          isOverdue ? "bg-rose-550/10 text-rose-400" : "bg-amber-550/10 text-amber-400"
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isOverdue ? "text-rose-450" : "text-amber-450"
            }`}>
              {isOverdue ? "Warning: Return Overdue" : "Warning: Already Allocated"}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mt-1">
            {asset.name} ({asset.id}) is currently assigned to another employee.
          </h4>

          {/* Grid details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mt-4 pt-3 border-t border-slate-700/20 text-xs text-slate-350">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Current Holder: <strong>{holder.name}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>Department: <strong>{holder.department}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Allocated Date: <strong>{asset.allocatedDate}</strong></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Expected Return: <strong className={isOverdue ? "text-rose-400" : ""}>{asset.expectedReturnDate}</strong></span>
            </div>
          </div>

          <div className="mt-5">
            <Button
              variant={isOverdue ? "danger" : "primary"}
              icon={RefreshCw}
              onClick={onTransferRequest}
              className="w-full sm:w-auto font-semibold"
            >
              Request Asset Transfer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
