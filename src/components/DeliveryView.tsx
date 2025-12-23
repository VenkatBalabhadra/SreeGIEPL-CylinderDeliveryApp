import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Truck, Copy, Share2, CheckCircle, Package, MapPin, User } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { CUSTOMERS } from '../constants';

export const DeliveryView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { inventory, removeCylinders, addDeliveryRecord } = useInventory();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  const smallInventory = inventory.filter(c => c.type === 'Small');
  const bigInventory = inventory.filter(c => c.type === 'Big');

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomer(custId);
    
    if (custId) {
      const cust = CUSTOMERS.find(c => c.id === custId);
      if (cust) {
        setCustomerName(cust.name);
        setAddress(cust.address);
      }
    } else {
      setCustomerName('');
      setAddress('');
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleGenerate = () => {
    if (!customerName || selectedIds.size === 0) {
      alert("Please enter customer name and select at least one cylinder.");
      return;
    }

    const selectedCylinders = inventory.filter(c => selectedIds.has(c.id));
    const smallDelivered = selectedCylinders.filter(c => c.type === 'Small');
    const bigDelivered = selectedCylinders.filter(c => c.type === 'Big');
    
    const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

    const message = `Customer Name: ${customerName}
Address: ${address || 'N/A'}
Small delivered: ${smallDelivered.length} Qty
Big delivered: ${bigDelivered.length} Qty
Big No.s: ${bigDelivered.map(c => c.number).join(', ') || 'None'}
Small No.s: ${smallDelivered.map(c => c.number).join(', ') || 'None'}
Date and Time of Delivery: ${dateStr}`;

    setGeneratedMessage(message);
  };

  const handleComplete = () => {
    const selectedCylinders = inventory.filter(c => selectedIds.has(c.id));
    const smallDelivered = selectedCylinders.filter(c => c.type === 'Small').map(c => c.number);
    const bigDelivered = selectedCylinders.filter(c => c.type === 'Big').map(c => c.number);

    addDeliveryRecord({
      customerName,
      address,
      deliveredSmall: smallDelivered,
      deliveredBig: bigDelivered,
      timestamp: new Date(),
    });

    removeCylinders(Array.from(selectedIds));
    setCustomerName('');
    setAddress('');
    setSelectedCustomer('');
    setSelectedIds(new Set());
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
      const url = `https://wa.me/?text=${encodeURIComponent(generatedMessage)}`;
      window.open(url, '_blank');
    }
  };

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Cylinders in Inventory</h3>
        <p className="text-gray-500">Go to Pickup to add cylinders before making a delivery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-green-600" />
          Customer Delivery
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCustomer}
                onChange={handleCustomerSelect}
                className="w-full pl-9 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white appearance-none"
              >
                <option value="">-- Select a Customer --</option>
                {CUSTOMERS.map(cust => (
                  <option key={cust.id} value={cust.id}>{cust.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCustomer && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{customerName}</p>
                  <p className="text-sm text-gray-500">{address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="font-medium text-gray-900">Select Cylinders to Deliver</h3>
          
          <div className="space-y-4">
            {/* Small Cylinders Box */}
            <div className="border border-blue-100 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
                <span className="text-sm font-bold text-blue-800">Small Cylinders</span>
                <span className="text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  {smallInventory.length} Available
                </span>
              </div>
              <div className="p-4 bg-white">
                {smallInventory.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {smallInventory.map(cyl => (
                      <button
                        key={cyl.id}
                        onClick={() => toggleSelection(cyl.id)}
                        className={cn(
                          "p-2 text-sm rounded-lg border transition-all",
                          selectedIds.has(cyl.id)
                            ? "bg-blue-600 border-blue-600 text-white font-medium shadow-md"
                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        {cyl.number}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No small cylinders in stock</p>
                )}
              </div>
            </div>

            {/* Big Cylinders Box */}
            <div className="border border-green-100 rounded-xl overflow-hidden">
              <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                <span className="text-sm font-bold text-green-800">Big Cylinders</span>
                <span className="text-xs bg-white text-green-600 px-2 py-0.5 rounded-full font-medium">
                  {bigInventory.length} Available
                </span>
              </div>
              <div className="p-4 bg-white">
                {bigInventory.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {bigInventory.map(cyl => (
                      <button
                        key={cyl.id}
                        onClick={() => toggleSelection(cyl.id)}
                        className={cn(
                          "p-2 text-sm rounded-lg border transition-all",
                          selectedIds.has(cyl.id)
                            ? "bg-green-600 border-green-600 text-white font-medium shadow-md"
                            : "bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50"
                        )}
                      >
                        {cyl.number}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No big cylinders in stock</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Selected:</span>
              <span className="font-medium">{selectedIds.size} cylinders</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={selectedIds.size === 0 || !customerName}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Delivery Message
            </button>
          </div>
        </div>
      </div>

      {generatedMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 p-6 rounded-2xl border border-green-100"
        >
          <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wider mb-3">
            Message Preview
          </h3>
          <pre className="whitespace-pre-wrap font-mono text-sm text-green-900 bg-white/50 p-4 rounded-lg mb-4">
            {generatedMessage}
          </pre>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-200 font-medium hover:bg-gray-50"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            Complete Delivery
            <CheckCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
