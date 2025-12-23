import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cylinder, CylinderType, DeliveryRecord } from '../types';

interface InventoryContextType {
  inventory: Cylinder[];
  history: DeliveryRecord[];
  addCylinders: (numbers: string[], type: CylinderType) => void;
  removeCylinders: (ids: string[]) => void;
  addDeliveryRecord: (record: Omit<DeliveryRecord, 'id'>) => void;
  clearInventory: () => void;
  resetAll: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Cylinder[]>(() => {
    const saved = localStorage.getItem('cylinder_inventory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({ ...c, addedAt: new Date(c.addedAt) }));
      } catch (e) {
        console.error("Failed to parse inventory", e);
        return [];
      }
    }
    return [];
  });

  const [history, setHistory] = useState<DeliveryRecord[]>(() => {
    const saved = localStorage.getItem('delivery_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
      } catch (e) {
        console.error("Failed to parse history", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cylinder_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('delivery_history', JSON.stringify(history));
  }, [history]);

  const addCylinders = (numbers: string[], type: CylinderType) => {
    const newCylinders: Cylinder[] = numbers.map(num => ({
      id: crypto.randomUUID(),
      number: num,
      type,
      addedAt: new Date(),
    }));
    setInventory(prev => [...prev, ...newCylinders]);
  };

  const removeCylinders = (ids: string[]) => {
    setInventory(prev => prev.filter(c => !ids.includes(c.id)));
  };

  const addDeliveryRecord = (record: Omit<DeliveryRecord, 'id'>) => {
    const newRecord: DeliveryRecord = {
      ...record,
      id: crypto.randomUUID(),
    };
    setHistory(prev => [newRecord, ...prev]);
  };

  const clearInventory = () => {
    setInventory([]);
  };

  const resetAll = () => {
    setInventory([]);
    setHistory([]);
    localStorage.removeItem('cylinder_inventory');
    localStorage.removeItem('delivery_history');
  };

  return (
    <InventoryContext.Provider value={{ inventory, history, addCylinders, removeCylinders, addDeliveryRecord, clearInventory, resetAll }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
