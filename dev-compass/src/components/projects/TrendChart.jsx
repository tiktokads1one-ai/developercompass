import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data, color = "hsl(142, 72%, 50%)", label = "Stars" }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: 'hsl(222, 44%, 8%)',
              border: '1px solid hsl(217, 33%, 18%)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(210, 40%, 96%)',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${label})`}
            strokeWidth={2}
            name={label}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}