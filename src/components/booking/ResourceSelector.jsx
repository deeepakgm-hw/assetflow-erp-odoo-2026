import React from "react";
import { DoorOpen, Car, Monitor, Users, MapPin } from "lucide-react";

export default function ResourceSelector({
  resources = [],
  selectedResourceId,
  setSelectedResourceId
}) {
  const getIcon = (type) => {
    switch (type) {
      case "Room":
        return DoorOpen;
      case "Vehicle":
        return Car;
      default:
        return Monitor;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Select Resource
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5">
        {resources.map((res) => {
          const Icon = getIcon(res.type);
          const isSelected = res.id === selectedResourceId;

          return (
            <div
              key={res.id}
              onClick={() => setSelectedResourceId(res.id)}
              className={`
                flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "bg-slate-900 text-blue-400 border-blue-500/80 shadow-md shadow-blue-500/10"
                    : "bg-slate-800 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600 text-slate-300"
                }
              `}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                isSelected ? "bg-blue-600/10 text-blue-400 border border-blue-500/25" : "bg-slate-900 text-slate-400 border border-slate-700/40"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold truncate ${isSelected ? "text-slate-100" : "text-slate-200"}`}>
                    {res.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium font-mono shrink-0">
                    {res.id}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{res.capacity}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{res.location}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
