import React, { useState, useEffect } from 'react';
import { stockApi } from "../../api/stockApi";

export function TopProductsCard() {
    const [products, setProducts] = useState([]);
    

    useEffect(() => {
        const load = async () => {
          const res = await stockApi.getTopProducts();
          setProducts(res);
              
        };
        load();
    }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-lg font-semibold mb-4">🏆 Top 5 Selling Products</h2>
      <ul className="space-y-2">
        {products.map((p, i) => (
          <li key={i} className="flex justify-between items-center">
            <span className="font-medium">{p.name}</span>
            <span className="text-gray-600">{p.total_sold}</span>
          </li>
        ))}
      </ul>
    </div>
  );
    
}