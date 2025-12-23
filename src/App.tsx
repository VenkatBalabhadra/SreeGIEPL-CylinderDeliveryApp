import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { PickupView } from './components/PickupView';
import { DeliveryView } from './components/DeliveryView';
import { HistoryView } from './components/HistoryView';
import { ResetConfirmation } from './components/ResetConfirmation';
import { Package, Truck, LayoutDashboard, History, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

type Tab = 'dashboard' | 'pickup' | 'delivery' | 'history' | 'reset_confirm';

const Dashboard: React.FC<{ onChangeTab: (tab: Tab) => void }> = ({ onChangeTab }) => {
  const { inventory, history } = useInventory();
  const smallCount = inventory.filter(c => c.type === 'Small').length;
  const bigCount = inventory.filter(c => c.type === 'Big').length;
  
  const totalDelivered = history.reduce((acc, curr) => acc + curr.deliveredSmall.length + curr.deliveredBig.length, 0);
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
        <div className="mb-4 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
          {format(today, 'EEEE, dd MMMM')}
        </div>
        <h1 className="text-3xl font-bold mb-2">Hello there, 👋</h1>
        <p className="text-blue-100 opacity-90">Ready for today's deliveries?</p>
        
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <p className="text-blue-100 text-xs font-medium mb-1">Small Stock</p>
            <p className="text-2xl font-bold">{smallCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <p className="text-blue-100 text-xs font-medium mb-1">Big Stock</p>
            <p className="text-2xl font-bold">{bigCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <p className="text-blue-100 text-xs font-medium mb-1">Delivered</p>
            <p className="text-2xl font-bold">{totalDelivered}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onChangeTab('pickup')}
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Factory Pickup</h3>
            <p className="text-gray-500 text-sm mt-1">Add new cylinders to inventory</p>
          </div>
        </button>

        <button
          onClick={() => onChangeTab('delivery')}
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Truck className="w-24 h-24 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Customer Delivery</h3>
            <p className="text-gray-500 text-sm mt-1">Deliver cylinders and generate receipt</p>
          </div>
        </button>

        <button
          onClick={() => onChangeTab('history')}
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <History className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delivery History</h3>
            <p className="text-gray-500 text-sm mt-1">View past deliveries and search</p>
          </div>
        </button>

        <button
          onClick={() => onChangeTab('reset_confirm')}
          className="group relative overflow-hidden bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 hover:bg-red-100 transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trash2 className="w-24 h-24 text-red-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-red-900">End of Day</h3>
            <p className="text-red-700 text-sm mt-1">Clear all inventory and history</p>
          </div>
        </button>
      </div>
    </div>
  );
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-6 h-6"
              >
                <path d="M12 3l9.5 5.5-9.5 5.5-9.5-5.5z" />
                <path d="M12 14l9.5 5.5-9.5 5.5-9.5-5.5z" />
                <path d="M12 14v10" />
                <path d="M12 14l-9.5-5.5" />
                <path d="M12 14l9.5-5.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-gray-900 leading-none tracking-tight">Gayathree</h1>
              <p className="text-[10px] text-gray-500 font-medium leading-none mt-1">Innovative Energies Pvt Ltd</p>
            </div>
          </div>
          {activeTab !== 'dashboard' && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Back
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-24 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard onChangeTab={setActiveTab} />
            </motion.div>
          )}
          {activeTab === 'pickup' && (
            <motion.div
              key="pickup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PickupView onComplete={() => setActiveTab('dashboard')} />
            </motion.div>
          )}
          {activeTab === 'delivery' && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DeliveryView onComplete={() => setActiveTab('dashboard')} />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HistoryView />
            </motion.div>
          )}
          {activeTab === 'reset_confirm' && (
            <motion.div
              key="reset_confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ResetConfirmation 
                onCancel={() => setActiveTab('dashboard')} 
                onConfirm={() => setActiveTab('dashboard')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation for quick access */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              activeTab === 'dashboard' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              activeTab === 'pickup' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">Pickup</span>
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              activeTab === 'delivery' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Deliver</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              activeTab === 'history' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
