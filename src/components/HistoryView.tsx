import React, { useState, useMemo } from 'react';
import { Search, Calendar, User, MapPin, Package, ArrowUpDown, Share2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { DeliveryRecord } from '../types';

export const HistoryView: React.FC = () => {
  const { history } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        record =>
          record.customerName.toLowerCase().includes(lowerTerm) ||
          record.address.toLowerCase().includes(lowerTerm)
      );
    }

    result.sort((a, b) => {
      const dateA = a.timestamp.getTime();
      const dateB = b.timestamp.getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [history, searchTerm, sortOrder]);

  const handleResend = (record: DeliveryRecord) => {
    const dateStr = format(record.timestamp, 'dd/MM/yyyy HH:mm');
    const message = `Customer Name: ${record.customerName}
Address: ${record.address || 'N/A'}
Small delivered: ${record.deliveredSmall.length} Qty
Big delivered: ${record.deliveredBig.length} Qty
Big No.s: ${record.deliveredBig.join(', ') || 'None'}
Small No.s: ${record.deliveredSmall.join(', ') || 'None'}
Date and Time of Delivery: ${dateStr}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-10">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer or address..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 px-1">
          <span>{filteredHistory.length} deliveries found</span>
          <span>Sorted by Date ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})</span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No delivery records found</p>
          </div>
        ) : (
          filteredHistory.map((record) => (
            <div key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{record.customerName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {format(record.timestamp, 'dd MMM yyyy, HH:mm')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                <p>{record.address || 'No address provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-gray-500">Small Cylinders</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">{record.deliveredSmall.length}</div>
                  <p className="text-xs text-gray-400 break-all">
                    {record.deliveredSmall.length > 0 ? record.deliveredSmall.join(', ') : '-'}
                  </p>
                </div>

                <div className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-gray-500">Big Cylinders</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">{record.deliveredBig.length}</div>
                  <p className="text-xs text-gray-400 break-all">
                    {record.deliveredBig.length > 0 ? record.deliveredBig.join(', ') : '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleResend(record)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" />
                Resend WhatsApp Message
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
