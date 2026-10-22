import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number; // e.g. 12.8
  changePeriod?: string; // e.g. "vs previous period"
  subtitle?: string; // e.g. "44 present today"
  icon: React.ReactNode;
  iconBgColor?: string;
  sparklineData?: number[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last period',
  subtitle,
  icon,
  iconBgColor = 'bg-[#222429] text-[#E5484D]',
  sparklineData = [35, 42, 38, 55, 62, 58, 75],
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  // Simple SVG sparkline points
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 24;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-[#1C1D21] border border-[#26282D] hover:border-[#363940] transition-all duration-150 rounded-xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-[#9094A0] tracking-wide uppercase">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgColor} border border-[#2D3037]`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-[#EDEDED]">{value}</div>
        {/* Subtle mini sparkline visualization */}
        <div className="shrink-0 opacity-70">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={isPositive ? '#30A46C' : '#E5484D'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#26282D] flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                isPositive
                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                  : 'bg-red-950/50 text-red-400 border border-red-800/40'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 shrink-0" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-[#9094A0] text-[11px]">{changePeriod}</span>
          </div>
        ) : subtitle ? (
          <div className="text-[#9094A0] text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {subtitle}
          </div>
        ) : null}

        {subtitle && change !== undefined && (
          <span className="text-[#9094A0] text-[11px]">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
