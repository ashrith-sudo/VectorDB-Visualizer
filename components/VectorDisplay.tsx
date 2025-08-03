import React from 'react';
import { Vector } from '../types';

interface VectorDisplayProps {
  vector: Vector;
  highlight?: boolean;
}

// Maps a value from -1 to 1 to a Tailwind background color class
const getValueColor = (value: number): string => {
  if (value > 0.8) return 'bg-red-400';
  if (value > 0.6) return 'bg-orange-400';
  if (value > 0.4) return 'bg-amber-400';
  if (value > 0.2) return 'bg-yellow-400';
  if (value > 0) return 'bg-lime-400';
  if (value > -0.2) return 'bg-green-400';
  if (value > -0.4) return 'bg-emerald-400';
  if (value > -0.6) return 'bg-teal-400';
  if (value > -0.8) return 'bg-cyan-400';
  return 'bg-sky-400';
};

const VectorDisplay: React.FC<VectorDisplayProps> = ({ vector, highlight = false }) => {
  return (
    <div className="flex gap-1 items-center flex-wrap">
      {vector.map((val, index) => (
        <div
          key={index}
          className="group relative"
        >
          <div
            className={`w-4 h-6 rounded-sm ${getValueColor(val)} transition-transform duration-200 group-hover:scale-110`}
          />
          <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 ${highlight ? 'bg-yellow-400 text-slate-950' : 'bg-slate-950 text-white'} text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10`}>
            {val.toFixed(4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VectorDisplay;
