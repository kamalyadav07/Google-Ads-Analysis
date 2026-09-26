import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { Clock, AlertOctagon, UserX, FileSpreadsheet } from 'lucide-react';

export default function FormFrictionWaterfall() {
  const { forms, isLoading } = useAnalytics();

  if (isLoading && forms.length === 0) {
    return <div className="card-surface p-6 h-56 animate-pulse bg-slate-800/40"></div>;
  }

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Form Field Friction & Abandonment Waterfall</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dwell time, validation errors, and last-focused fields before visitor exit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Field Friction List */}
        <div className="space-y-3 font-mono">
          {forms.map((f, i) => {
            const hasHighFriction = f.abandonments > 10 || f.errors > 10;

            return (
              <div
                key={f.fieldName}
                className={`p-3 rounded-lg border transition ${
                  hasHighFriction
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[11px]">{i + 1}.</span>
                    <span className="font-bold text-white uppercase">{f.fieldName}</span>
                    {hasHighFriction && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                        High Friction
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-xs">{f.interactions} touches</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Avg Dwell</span>
                    <span className="font-bold text-slate-200">{f.avgDwellSeconds}s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Validation Errors</span>
                    <span className={`font-bold ${f.errors > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {f.errors}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Abandonments</span>
                    <span className={`font-bold ${f.abandonments > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {f.abandonments}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic Callout */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between text-xs">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2 font-sans">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Form Friction Diagnosis
            </h4>
            <p className="text-slate-300 leading-relaxed font-sans mb-3">
              Users spend an average of <strong>38 seconds</strong> on the requirement text field on mobile devices. 
              Constraint validation triggers high abandonment because mobile keyboards do not auto-capitalize or format multi-line notes cleanly.
            </p>
            <div className="space-y-2 font-sans">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                <span className="text-sky-400 font-bold block mb-0.5">Recommendation 1:</span>
                Switch the open-ended requirement field to a 4-option pill selector (e.g. 4-8 Cameras, 16-32 Cameras, Enterprise Setup).
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                <span className="text-sky-400 font-bold block mb-0.5">Recommendation 2:</span>
                Implement Google Places autocomplete for Company Location to reduce mobile typing fatigue.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
