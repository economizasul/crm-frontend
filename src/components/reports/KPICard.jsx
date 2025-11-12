// src/components/reports/KPICard.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * KPICard
 * props:
 *  - title
 *  - value
 *  - description (optional)
 *  - Icon (component optional)
 *  - borderColor (hex string)
 */
export default function KPICard({ title, value, description = '', Icon = null, borderColor = '#1A7F3C' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="bg-white rounded-2xl shadow p-4 border border-transparent"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-4">
        {Icon ? <div className="p-2 rounded-md bg-gray-100"><Icon className="text-xl" /></div> : null}
        <div className="flex-1">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900">{value}</div>
          {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
        </div>
      </div>
    </motion.div>
  );
}
