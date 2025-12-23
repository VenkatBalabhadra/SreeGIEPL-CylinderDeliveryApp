export type CylinderType = 'Small' | 'Big';

export interface Cylinder {
  id: string;
  number: string;
  type: CylinderType;
  addedAt: Date;
}

export interface DeliveryRecord {
  id: string;
  customerName: string;
  address: string;
  deliveredSmall: string[]; // Cylinder numbers
  deliveredBig: string[];   // Cylinder numbers
  timestamp: Date;
}
