/**
 * Simple Line Chart Component (No external dependencies)
 * For displaying trends over time
 */
export const LineChart = ({ data, dataKey, xKey, height = 200, color = '#3b82f6' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
                No data available
            </div>
        );
    }

    const values = data.map(d => d[dataKey] || 0);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const width = 100; // percentage
    const padding = 10;
    const graphHeight = height - padding * 2;

    // Calculate points with safety checks
    const points = data.map((d, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
        const value = d[dataKey] || 0;
        const y = graphHeight - ((value - min) / range) * graphHeight;
        return `${x},${y + padding}`;
    }).join(' ');

    // Ensure we have valid points
    if (!points || points.includes('NaN')) {
        return (
            <div className="w-full flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
                Invalid data
            </div>
        );
    }

    return (
        <div className="w-full relative" style={{ height }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Grid lines */}
                <g className="opacity-20">
                    {[0, 25, 50, 75, 100].map(y => (
                        <line
                            key={y}
                            x1="0"
                            x2={width}
                            y1={y * height / 100}
                            y2={y * height / 100}
                            stroke="#94a3b8"
                            strokeWidth="0.5"
                        />
                    ))}
                </g>

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Area fill */}
                <polyline
                    points={`0,${height} ${points} ${width},${height}`}
                    fill={color}
                    fillOpacity="0.1"
                />

                {/* Data points */}
                {points.split(' ').map((point, i) => {
                    const [x, y] = point.split(',').map(Number);
                    if (isNaN(x) || isNaN(y)) return null;
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={color}
                        />
                    );
                })}
            </svg>

            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
                {data.length > 0 && (
                    <>
                        <span>{data[0][xKey]}</span>
                        <span>{data[data.length - 1][xKey]}</span>
                    </>
                )}
            </div>

            <div className="absolute top-0 right-0 text-xs text-gray-500 font-bold">
                Max: {max.toLocaleString()}
            </div>
        </div>
    );
};

/**
 * Bar Chart Component
 * For comparing values across categories
 */
export const BarChart = ({ data, valueKey, labelKey, height = 200, color = '#10b981' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
                No data available
            </div>
        );
    }

    const values = data.map(d => d[valueKey] || 0);
    const max = Math.max(...values, 1);

    return (
        <div className="w-full" style={{ height }}>
            <div className="h-full flex items-end gap-2 px-4">
                {data.map((item, i) => {
                    const barHeight = (item[valueKey] / max) * (height - 40);
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs font-bold text-gray-600 text-center">
                                {item[valueKey].toLocaleString()}
                            </div>
                            <div
                                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                                style={{
                                    height: `${barHeight}px`,
                                    backgroundColor: color
                                }}
                            />
                            <div className="text-xs text-gray-400 text-center truncate w-full">
                                {item[labelKey]}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Donut Chart Component
 * For showing proportions
 */
export const DonutChart = ({ data, size = 120, thickness = 20 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ width: size, height: size }}>
                No data
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ width: size, height: size }}>
                No data
            </div>
        );
    }

    const radius = size / 2;
    let currentAngle = -90;

    return (
        <div className="inline-flex flex-col items-center gap-3">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={radius}
                    cy={radius}
                    r={radius - thickness / 2}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={thickness}
                />

                {data.map((item, i) => {
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    const startX = radius + (radius - thickness / 2) * Math.cos((startAngle * Math.PI) / 180);
                    const startY = radius + (radius - thickness / 2) * Math.sin((startAngle * Math.PI) / 180);
                    const endX = radius + (radius - thickness / 2) * Math.cos((endAngle * Math.PI) / 180);
                    const endY = radius + (radius - thickness / 2) * Math.sin((endAngle * Math.PI) / 180);

                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const path = `M ${startX} ${startY} A ${radius - thickness / 2} ${radius - thickness / 2} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

                    currentAngle += angle;

                    return (
                        <path
                            key={i}
                            d={path}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={thickness}
                            strokeLinecap="round"
                        />
                    );
                })}

                <text
                    x={radius}
                    y={radius}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-700 font-bold text-sm"
                    transform={`rotate(90, ${radius}, ${radius})`}
                >
                    {total.toLocaleString()}
                </text>
            </svg>

            <div className="flex flex-wrap gap-3 justify-center">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">
                            {item.label}: {((item.value / total) * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Heatmap Component
 * For visualizing interaction data
 */
export const Heatmap = ({ grid, width = 300, height = 400, label = 'Interactions' }) => {
    if (!grid || grid.length === 0) {
        return (
            <div className="neo-card p-6 flex items-center justify-center text-gray-400" style={{ width, height }}>
                No {label.toLowerCase()} data
            </div>
        );
    }

    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    const getHeatColor = (value) => {
        if (value === 0) return 'rgba(229, 231, 235, 0.3)';
        if (value < 0.2) return 'rgba(147, 197, 253, 0.4)';
        if (value < 0.4) return 'rgba(96, 165, 250, 0.6)';
        if (value < 0.6) return 'rgba(59, 130, 246, 0.7)';
        if (value < 0.8) return 'rgba(37, 99, 235, 0.8)';
        return 'rgba(29, 78, 216, 0.9)';
    };

    return (
        <div className="neo-card p-4">
            <h4 className="text-sm font-bold text-gray-600 mb-3">{label}</h4>
            <svg width={width} height={height} className="rounded-lg overflow-hidden">
                {grid.map((row, y) =>
                    row.map((value, x) => (
                        <rect
                            key={`${x}-${y}`}
                            x={x * cellWidth}
                            y={y * cellHeight}
                            width={cellWidth}
                            height={cellHeight}
                            fill={getHeatColor(value)}
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                        >
                            <title>{`Position (${x}, ${y}): ${(value * 100).toFixed(1)}%`}</title>
                        </rect>
                    ))
                )}
            </svg>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>Low</span>
                <span>Activity Level</span>
                <span>High</span>
            </div>
        </div>
    );
};

/**
 * Stat Card Component
 * For displaying key metrics
 */
export const StatCard = ({ label, value, change, icon, color = 'blue' }) => {
    const colors = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        purple: 'text-purple-500',
        orange: 'text-orange-500',
        red: 'text-red-500'
    };

    const isPositive = change >= 0;

    return (
        <div className="neo-card p-6 flex items-center gap-4 hover:scale-105 transition-transform">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colors[color]} shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-700">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {change !== undefined && (
                        <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
