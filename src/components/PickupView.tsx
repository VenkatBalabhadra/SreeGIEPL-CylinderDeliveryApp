import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Copy, Share2, ArrowRight, X, Delete } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const Keypad: React.FC<{
  onInput: (num: string) => void;
  onDelete: () => void;
  onAdd: () => void;
  disabled?: boolean;
  currentInput: string;
}> = ({ onInput, onDelete, onAdd, disabled, currentInput }) => {
  const buttons = [
    ['1', '2', '3', '4'],
    ['5', '6', '7', '8'],
    ['9', '0', 'DEL', 'ADD']
  ];

  const isButtonDisabled = (btn: string) => {
    if (btn === 'DEL' || btn === 'ADD') return false;
    
    // Prevent 0 as first digit
    if (currentInput === '' && btn === '0') return true;

    // Simulate next value
    const nextVal = parseInt(currentInput + btn, 10);

    // Max is 199
    if (nextVal > 199) return true;

    return false;
  };

  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      {buttons.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {row.map((btn) => {
            if (btn === 'DEL') {
              return (
                <button
                  key={btn}
                  onClick={onDelete}
                  className="bg-red-50 text-red-600 rounded-xl font-bold py-3 hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              );
            }
            if (btn === 'ADD') {
              return (
                <button
                  key={btn}
                  onClick={onAdd}
                  disabled={disabled}
                  className="bg-blue-600 text-white rounded-xl font-bold py-3 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  <Plus className="w-6 h-6" />
                </button>
              );
            }
            
            const isDisabled = isButtonDisabled(btn);
            
            return (
              <button
                key={btn}
                onClick={() => onInput(btn)}
                disabled={isDisabled}
                className={cn(
                  "rounded-xl font-bold py-3 transition-all text-lg",
                  isDisabled 
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed" 
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95"
                )}
              >
                {btn}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

const NumberInputSection: React.FC<{
  label: string;
  numbers: string[];
  onAdd: (num: string) => void;
  onRemove: (index: number) => void;
  colorClass: string;
  isActive: boolean;
  onActivate: () => void;
  inventoryNumbers: Set<string>;
  otherListNumbers: Set<string>;
}> = ({ label, numbers, onAdd, onRemove, colorClass, isActive, onActivate, inventoryNumbers, otherListNumbers }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInput = (num: string) => {
    if (input.length < 3) {
      setInput(prev => prev + num);
      setError(null);
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleAdd = () => {
    const num = parseInt(input, 10);
    
    if (isNaN(num)) return;

    if (num < 1 || num > 200) {
      setError('Number must be between 1 and 200');
      return;
    }

    const numStr = input; // Keep leading zeros if user typed them? Usually cylinder numbers are just integers. Let's use the string input but validated.
    // Actually, let's normalize to string without leading zeros for consistency unless 01 is different from 1.
    // Assuming 1 = 1.
    const normalizedStr = num.toString();

    if (numbers.includes(normalizedStr)) {
      setError('Number already in this list');
      return;
    }

    if (otherListNumbers.has(normalizedStr)) {
      setError('Number already in the other list');
      return;
    }

    if (inventoryNumbers.has(normalizedStr)) {
      setError('Number already in inventory');
      return;
    }

    onAdd(normalizedStr);
    setInput('');
    setError(null);
  };

  return (
    <div className={cn("p-4 rounded-2xl border transition-all", isActive ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-gray-200 bg-white")}>
      <div onClick={onActivate} className="cursor-pointer">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        
        {/* Display Added Numbers */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {numbers.length > 0 ? (
            numbers.map((num, idx) => (
              <span
                key={idx}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium bg-white border shadow-sm",
                  colorClass
                )}
              >
                {num}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                  className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">No numbers added</span>
          )}
        </div>

        {/* Input Display */}
        {isActive && (
          <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-2 mb-2">
            <span className="text-xl font-mono font-bold text-gray-900 min-h-[28px]">
              {input}
              <span className="animate-pulse text-blue-500">|</span>
            </span>
            <span className="text-xs text-gray-400">Type 1-200</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 font-medium mb-2 animate-pulse">{error}</p>
        )}
      </div>

      {isActive && (
        <Keypad 
          onInput={handleInput} 
          onDelete={handleDelete} 
          onAdd={handleAdd}
          disabled={!input}
          currentInput={input}
        />
      )}
    </div>
  );
};

export const PickupView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { addCylinders, inventory } = useInventory();
  const [smallNumbers, setSmallNumbers] = useState<string[]>([]);
  const [bigNumbers, setBigNumbers] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'small' | 'big' | null>('small');
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  // Create Sets for fast lookup
  const inventoryNumbers = new Set(inventory.map(c => c.number));
  const smallSet = new Set(smallNumbers);
  const bigSet = new Set(bigNumbers);

  const handleGenerate = () => {
    if (smallNumbers.length === 0 && bigNumbers.length === 0) return;

    const dateStr = format(new Date(), 'dd/MM/yyyy');
    
    const message = `Date: ${dateStr}
Small Cylinder : ${smallNumbers.length} Qty
Big Cylinder : ${bigNumbers.length} Qty
Small Cylinder No.s : ${smallNumbers.join(', ')}
Big Cylinder No.s: ${bigNumbers.join(', ')}`;

    setGeneratedMessage(message);
    setActiveField(null); // Close keypad
  };

  const handleConfirm = () => {
    if (smallNumbers.length > 0) addCylinders(smallNumbers, 'Small');
    if (bigNumbers.length > 0) addCylinders(bigNumbers, 'Big');

    setSmallNumbers([]);
    setBigNumbers([]);
    setGeneratedMessage(null);
    onComplete();
  };

  const copyToClipboard = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage);
      alert('Message copied to clipboard!');
    }
  };

  const shareOnWhatsApp = () => {
    if (generatedMessage) {
      // Add to inventory first
      if (smallNumbers.length > 0) addCylinders(smallNumbers, 'Small');
      if (bigNumbers.length > 0) addCylinders(bigNumbers, 'Big');

      // Open WhatsApp
      const url = `https://wa.me/?text=${encodeURIComponent(generatedMessage)}`;
      window.open(url, '_blank');

      // Reset and complete
      setSmallNumbers([]);
      setBigNumbers([]);
      setGeneratedMessage(null);
      onComplete();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Factory Pickup
        </h2>
        
        <div className="space-y-4">
          <NumberInputSection
            label="Small Cylinder Numbers"
            numbers={smallNumbers}
            onAdd={(num) => setSmallNumbers(prev => [...prev, num])}
            onRemove={(idx) => setSmallNumbers(prev => prev.filter((_, i) => i !== idx))}
            colorClass="text-blue-700 border-blue-200"
            isActive={activeField === 'small'}
            onActivate={() => setActiveField('small')}
            inventoryNumbers={inventoryNumbers}
            otherListNumbers={bigSet}
          />

          <NumberInputSection
            label="Big Cylinder Numbers"
            numbers={bigNumbers}
            onAdd={(num) => setBigNumbers(prev => [...prev, num])}
            onRemove={(idx) => setBigNumbers(prev => prev.filter((_, i) => i !== idx))}
            colorClass="text-green-700 border-green-200"
            isActive={activeField === 'big'}
            onActivate={() => setActiveField('big')}
            inventoryNumbers={inventoryNumbers}
            otherListNumbers={smallSet}
          />

          <button
            onClick={handleGenerate}
            disabled={smallNumbers.length === 0 && bigNumbers.length === 0}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Generate Message Preview
          </button>
        </div>
      </div>

      {generatedMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-6 rounded-2xl border border-blue-100"
        >
          <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-3">
            Message Preview
          </h3>
          <pre className="whitespace-pre-wrap font-mono text-sm text-blue-900 bg-white/50 p-4 rounded-lg mb-4">
            {generatedMessage}
          </pre>
          
          <div className="flex flex-col gap-3 mb-4">
            <button
              onClick={shareOnWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-200"
            >
              <Share2 className="w-5 h-5" />
              Open WhatsApp & Add to Inventory
            </button>
            
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 font-medium hover:bg-gray-50"
            >
              <Copy className="w-5 h-5" />
              Copy Message Only
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
