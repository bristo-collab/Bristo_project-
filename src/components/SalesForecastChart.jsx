import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { api } from '../services/api';

const SalesForecastChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const res = await api.get('/admin/analytics/forecast');
                // Ensure response structure matches backend
                if (!res.history || !res.forecast) return;

                const historyData = res.history.map(d => ({
                    name: d.date.split('-').slice(1).join('/'), // MM/DD
                    revenue: d.y,
                    type: 'History'
                }));

                const forecastData = res.forecast.map(d => ({
                    name: d.date.split('-').slice(1).join('/'),
                    revenue: d.revenue,
                    type: 'Forecast'
                }));

                // Combine: Last history point should connect to first forecast point visually?
                // For simplicity, just append.
                setData([...historyData, ...forecastData]);
            } catch (error) {
                console.error("Forecast Error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, []);

    if (loading) return <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading AI Prediction...</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                />
                {/* Visual marker for prediction start - roughly 30 days in */}
                <ReferenceLine x={data[29]?.name} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'AI Forecast', position: 'top', fill: '#10b981', fontSize: 10 }} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default SalesForecastChart;
