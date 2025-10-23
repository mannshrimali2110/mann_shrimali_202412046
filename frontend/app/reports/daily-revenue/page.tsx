'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Report = { date: string; total: string };

export default function DailyRevenuePage() {
    const [report, setReport] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await apiFetch<{ data: { report: Report[] } }>('/reports/daily-revenue', { auth: true });
                setReport(data.data.report);
                setLoading(false);
            } catch (err: any) {
                setErrorMsg(err.message || 'Failed to load report');
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) return <div className="text-gray-700 font-medium">Loading report...</div>;
    if (errorMsg) return <div className="text-red-700 font-medium">{errorMsg}</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Revenue</h1>
            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">Date</th>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">Total Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    {report.map((r, idx) => (
                        <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900 font-medium">{r.date}</td>
                            <td className="px-4 py-2 text-gray-900 font-medium">${parseFloat(r.total).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
