// src/components/reports/KPICard.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * KPICard
 * props:
 *  - title: string
 *  - value: string | number
 *  - description?: string
 *  - borderColor?: hex color string (ex: '#1A7F3C')
 */
function KPICard({ title, value, description = '', borderColor = '#1A7F3C' }) {
  const borderStyle = { borderLeft: `4px solid ${borderColor}` };

  return (
    <motion.div
      className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={borderStyle} className="pl-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-extrabold text-gray-900">{value ?? 0}</p>
        </div>
        {description && <div className="mt-2 text-xs text-gray-400">{description}</div>}
      </div>
    </motion.div>
  );
}

export default KPICard;
