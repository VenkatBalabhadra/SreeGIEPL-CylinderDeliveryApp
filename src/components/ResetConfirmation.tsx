import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const ResetConfirmation: React.FC<{ onCancel: () => void; onConfirm: () => void }> = ({ onCancel, onConfirm }) => {
  const { resetAll } = useInventory();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleConfirm = () => {
    if (parseInt(answer) === num1 + num2) {
      resetAll();
      onConfirm();
    } else {
      setError(true);
      setAnswer('');
      // Shake effect logic could go here, but simple error state is fine for now
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-10 h-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">End of Day Reset</h2>
        <p className="text-gray-500 mb-8">
          This will permanently delete all inventory and delivery history. This action cannot be undone.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Verify it's you. What is {num1} + {num2}?
          </label>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className={`w-full text-center text-2xl font-bold p-3 rounded-xl border-2 outline-none transition-all ${
              error ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="?"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!answer}
            className="py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
