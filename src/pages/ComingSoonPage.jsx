import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Hourglass } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

export default function ComingSoonPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card 
        className="max-w-md w-full text-center border-slate-800 bg-slate-900/40 relative overflow-hidden" 
        padding="p-8"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto mb-5 shadow-[0_0_20px_rgba(37,99,235,0.15)] animate-pulse">
          <Hourglass className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
          {title} Module
          <Sparkles className="w-4 h-4 text-amber-450 shrink-0" />
        </h2>
        
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          We are currently building this ERP module. It will integrate PostgreSQL database workflows, real-time alerts, and automated audits.
        </p>

        <div className="mt-8 pt-5 border-t border-slate-700/30 flex justify-center">
          <Link to="/">
            <Button variant="secondary" icon={ArrowLeft} className="font-semibold text-xs py-2">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
