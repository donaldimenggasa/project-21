export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive';
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  revenue: number;
  employees: number;
  country: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  department: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
  category: string;
}

export interface DashboardStats {
  newAccounts: {
    count: number;
    percentage: number;
    trend: 'up' | 'down';
    score: number;
  };
  totalExpenses: {
    count: number;
    percentage: number;
    trend: 'up' | 'down';
    score: number;
  };
  companyValue: {
    amount: string;
    trend: 'up' | 'down';
    score: number;
  };
  newEmployees: {
    count: number;
    trend: 'up' | 'down';
    score: number;
  };
  income: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  expenses: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  spendings: {
    amount: string;
    percentage: number;
    trend: 'up' | 'down';
  };
  totals: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  targets: {
    income: number;
    expenses: number;
    spendings: number;
    totals: number;
  };
}

export interface TrafficSource {
  month: string;
  website: number;
  blog: number;
  socialMedia: number;
  conversion: number;
}