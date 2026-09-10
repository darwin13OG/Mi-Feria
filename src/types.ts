export type PlanType = 'standard' | 'premium';

export interface Product {
  id: string;
  name: string;
  price: number;
  initialStock: number;
}

export interface SaleSnapshot {
  id: string;
  productId: string;
  n: string; // Frozen product name
  p: number; // Frozen unit price
  c: number; // Quantity sold
  subtotal: number;
  t: string; // ISO date timestamp
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  t: string;
}

export interface StandConfig {
  projectName: string;
  institutionName: string;
  teamMembers: string[]; // Premium
  initialInvestment: number;
  products: Product[];
  plan: PlanType;
  ownerName: string;
  standId: string;
  licenseKey: string;
  isConfigured: boolean;
}

export interface AppState {
  config: StandConfig;
  sales: SaleSnapshot[];
  expenses: Expense[];
  isLocked: boolean;
}
