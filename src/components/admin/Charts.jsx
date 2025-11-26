import React from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

// Custom Tooltip Component for Neomorphic look
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#e0e5ec] p-3 rounded-xl shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] border border-white/20">
                <p className="text-gray-700 font-bold text-sm mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * Elegant Area/Line Chart
 * Uses a gradient fill for a modern look
 */
export const LineChart = ({ data, dataKey, xKey, height = 300, color = '#3b82f6' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
                No data available
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis
                        dataKey={xKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color${dataKey})`}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Modern Bar Chart
 * Rounded bars with subtle animation
 */
export const BarChart = ({ data, valueKey, labelKey, height = 300, color = '#10b981' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
                No data available
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                    <XAxis
                        dataKey={labelKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar
                        dataKey={valueKey}
                        fill={color}
                        radius={[6, 6, 0, 0]}
                        animationDuration={1500}
                        barSize={40}
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Sleek Donut Chart
 * With centered total and clean legend
 */
export const DonutChart = ({ data, size = 250, thickness = 60 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: size }}>
                No data
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full flex flex-col items-center">
            <div style={{ width: '100%', height: size, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={size / 2 - thickness}
                            outerRadius={size / 2}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="label"
                            animationDuration={1500}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centered Total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-700">{total.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                </div>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-wrap gap-4 justify-center mt-4">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600 font-medium">
                            {item.label}
                            <span className="text-gray-400 ml-1 text-xs">
                                ({((item.value / total) * 100).toFixed(1)}%)
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Professional Heatmap
 * Using SVG for precision but styled to match Recharts
 */
export const Heatmap = ({ grid, width = '100%', height = 300, label = 'Interactions' }) => {
    if (!grid || grid.length === 0) {
        return (
            <div className="neo-card p-6 flex items-center justify-center text-gray-400" style={{ width, height }}>
                No {label.toLowerCase()} data
            </div>
        );
    }

    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    const getHeatColor = (value) => {
        // Blue gradient scale
        if (value === 0) return '#f1f5f9'; // slate-100
        if (value < 0.2) return '#bfdbfe'; // blue-200
        if (value < 0.4) return '#93c5fd'; // blue-300
        if (value < 0.6) return '#60a5fa'; // blue-400
        if (value < 0.8) return '#3b82f6'; // blue-500
        return '#2563eb'; // blue-600
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-4">
                <h4 className="text-sm font-bold text-gray-600">{label}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Low</span>
                    <div className="w-24 h-2 rounded-full bg-gradient-to-r from-slate-100 to-blue-600"></div>
                    <span>High</span>
                </div>
            </div>

            <div className="w-full relative rounded-xl overflow-hidden shadow-inner border border-white/50" style={{ height }}>
                <svg width="100%" height="100%" preserveAspectRatio="none">
                    {grid.map((row, y) =>
                        row.map((value, x) => (
                            <rect
                                key={`${x}-${y}`}
                                x={`${x * cellWidth}%`}
                                y={`${y * cellHeight}%`}
                                width={`${cellWidth}%`}
                                height={`${cellHeight}%`}
                                fill={getHeatColor(value)}
                                stroke="white"
                                strokeWidth="0.5"
                                strokeOpacity="0.5"
                                vectorEffect="non-scaling-stroke"
                                className="transition-colors duration-300 hover:opacity-80"
                            >
                                <title>{`Pos: ${x},${y} | Val: ${(value * 100).toFixed(0)}%`}</title>
                            </rect>
                        ))
                    )}
                </svg>
            </div>
        </div>
    );
};

/**
 * Stat Card Component
 * Enhanced with better typography and layout
 */
export const StatCard = ({ label, value, change, icon, color = 'blue' }) => {
    const colors = {
        blue: 'text-blue-500 bg-blue-50',
        green: 'text-green-500 bg-green-50',
        purple: 'text-purple-500 bg-purple-50',
        orange: 'text-orange-500 bg-orange-50',
        red: 'text-red-500 bg-red-50'
    };

    const iconColor = colors[color] || colors.blue;
    const isPositive = change >= 0;

    return (
        <div className="neo-card p-6 flex items-start gap-4 hover:translate-y-[-2px] transition-all duration-300 w-full group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${iconColor} shadow-inner transition-transform group-hover:scale-110`}>
                {icon}
            </div>

            <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider truncate mb-1">{label}</p>
                <div className="flex items-end gap-2 flex-wrap">
                    <p className="text-3xl font-bold text-gray-700 truncate leading-none">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>

                    {change !== undefined && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
