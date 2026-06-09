import { useState, useEffect } from 'react';
import  stockApi  from "../../api/stockApi";  

export function ProfitCard() {
    const [profitMargin, setProfitMargin] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await stockApi.getProfitMargin();
                setProfitMargin(res.profit_margin);
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);
    if (!profitMargin) return null;
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold mb-4">💰 Profit Summary</h2>
            <div className="text-2xl font-bold text-green-600">
                {profitMargin}%
            </div>
            <div className="text-sm space-y-2 text-gray-600 mt-2">
                <div>Revenue: ${Number(profitMargin.revenue).toFixed(2)}</div>
                <div>Cost: ${Number(profitMargin.cost).toFixed(2)}</div>
                <div className="text-green-600 font-semibold">Profit: ${Number(profitMargin.profit).toFixed(2)}</div>
            </div>
        </div>
    );
}   