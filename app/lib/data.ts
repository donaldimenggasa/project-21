import { Account, DashboardStats, Employee, Expense, Income, TrafficSource } from './types';
import { format } from 'date-fns';

// Mock data for the dashboard
let employees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    hireDate: '2023-01-15',
    salary: 85000,
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Product Manager',
    department: 'Product',
    hireDate: '2022-11-05',
    salary: 95000,
    status: 'active',
  },
  {
    id: '3',
    name: 'Michael Johnson',
    position: 'UX Designer',
    department: 'Design',
    hireDate: '2023-03-20',
    salary: 78000,
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Williams',
    position: 'Marketing Specialist',
    department: 'Marketing',
    hireDate: '2023-02-10',
    salary: 72000,
    status: 'active',
  },
  {
    id: '5',
    name: 'Robert Brown',
    position: 'Sales Representative',
    department: 'Sales',
    hireDate: '2022-12-01',
    salary: 68000,
    status: 'inactive',
  },
];

let accounts: Account[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Technology',
    revenue: 5000000,
    employees: 250,
    country: 'United States',
    createdAt: '2023-01-10',
    status: 'active',
  },
  {
    id: '2',
    name: 'Global Innovations',
    industry: 'Manufacturing',
    revenue: 8500000,
    employees: 420,
    country: 'Germany',
    createdAt: '2023-02-15',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bright Future Solar',
    industry: 'Energy',
    revenue: 3200000,
    employees: 180,
    country: 'Australia',
    createdAt: '2023-01-25',
    status: 'active',
  },
  {
    id: '4',
    name: 'EcoSolutions',
    industry: 'Environmental',
    revenue: 1800000,
    employees: 95,
    country: 'Canada',
    createdAt: '2023-03-05',
    status: 'active',
  },
  {
    id: '5',
    name: 'TechNova Systems',
    industry: 'Technology',
    revenue: 4200000,
    employees: 210,
    country: 'United Kingdom',
    createdAt: '2023-02-20',
    status: 'inactive',
  },
];

let expenses: Expense[] = [
  {
    id: '1',
    title: 'Office Rent',
    amount: 12500,
    category: 'Facilities',
    date: '2023-03-01',
    department: 'Administration',
  },
  {
    id: '2',
    title: 'Software Licenses',
    amount: 8750,
    category: 'Technology',
    date: '2023-03-05',
    department: 'IT',
  },
  {
    id: '3',
    title: 'Marketing Campaign',
    amount: 15000,
    category: 'Marketing',
    date: '2023-03-10',
    department: 'Marketing',
  },
  {
    id: '4',
    title: 'Employee Training',
    amount: 5500,
    category: 'Human Resources',
    date: '2023-03-15',
    department: 'HR',
  },
  {
    id: '5',
    title: 'Equipment Purchase',
    amount: 9200,
    category: 'Capital Expenditure',
    date: '2023-03-20',
    department: 'Engineering',
  },
];

let incomes: Income[] = [
  {
    id: '1',
    source: 'Product Sales',
    amount: 125000,
    date: '2023-03-05',
    category: 'Sales',
  },
  {
    id: '2',
    source: 'Consulting Services',
    amount: 45000,
    date: '2023-03-10',
    category: 'Services',
  },
  {
    id: '3',
    source: 'Subscription Revenue',
    amount: 78500,
    date: '2023-03-15',
    category: 'Recurring',
  },
  {
    id: '4',
    source: 'Licensing Fees',
    amount: 32000,
    date: '2023-03-20',
    category: 'Intellectual Property',
  },
  {
    id: '5',
    source: 'Investment Returns',
    amount: 18500,
    date: '2023-03-25',
    category: 'Investments',
  },
];

export const dashboardStats: DashboardStats = {
  newAccounts: {
    count: 234,
    percentage: 23,
    trend: 'up',
    score: 58,
  },
  totalExpenses: {
    count: 71,
    percentage: 12,
    trend: 'down',
    score: 62,
  },
  companyValue: {
    amount: '1.45M',
    trend: 'up',
    score: 72,
  },
  newEmployees: {
    count: 34,
    trend: 'up',
    score: 81,
  },
  income: {
    amount: 5456,
    percentage: 14,
    trend: 'up',
  },
  expenses: {
    amount: 4764,
    percentage: 8,
    trend: 'down',
  },
  spendings: {
    amount: '1.5M',
    percentage: 15,
    trend: 'up',
  },
  totals: {
    amount: 31564,
    percentage: 76,
    trend: 'up',
  },
  targets: {
    income: 71,
    expenses: 54,
    spendings: 32,
    totals: 89,
  },
};

export const trafficSources: TrafficSource[] = [
  { month: 'Jan 00', website: 400, blog: 240, socialMedia: 180, conversion: 30 },
  { month: 'Feb 00', website: 500, blog: 280, socialMedia: 220, conversion: 40 },
  { month: 'Mar 00', website: 400, blog: 230, socialMedia: 170, conversion: 25 },
  { month: 'Apr 00', website: 650, blog: 320, socialMedia: 280, conversion: 45 },
  { month: 'May 00', website: 230, blog: 180, socialMedia: 150, conversion: 20 },
  { month: 'Jun 00', website: 350, blog: 250, socialMedia: 200, conversion: 35 },
  { month: 'Jul 00', website: 280, blog: 220, socialMedia: 170, conversion: 15 },
  { month: 'Aug 00', website: 340, blog: 260, socialMedia: 210, conversion: 30 },
  { month: 'Sep 00', website: 380, blog: 270, socialMedia: 220, conversion: 25 },
  { month: 'Oct 00', website: 320, blog: 240, socialMedia: 190, conversion: 20 },
  { month: 'Nov 00', website: 280, blog: 210, socialMedia: 170, conversion: 15 },
  { month: 'Dec 00', website: 220, blog: 180, socialMedia: 150, conversion: 10 },
];

// CRUD operations for employees
export async function getEmployees(): Promise<Employee[]> {
  return [...employees];
}

export async function getEmployee(id: string): Promise<Employee | undefined> {
  return employees.find((employee) => employee.id === id);
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const newEmployee = {
    ...employee,
    id: Math.random().toString(36).substring(2, 9),
  };
  employees.push(newEmployee);
  return newEmployee;
}

export async function updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee | undefined> {
  const index = employees.findIndex((e) => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...employee };
    return employees[index];
  }
  return undefined;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const initialLength = employees.length;
  employees = employees.filter((employee) => employee.id !== id);
  return initialLength !== employees.length;
}

// CRUD operations for accounts
export async function getAccounts(): Promise<Account[]> {
  return [...accounts];
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return accounts.find((account) => account.id === id);
}

export async function createAccount(account: Omit<Account, 'id'>): Promise<Account> {
  const newAccount = {
    ...account,
    id: Math.random().toString(36).substring(2, 9),
  };
  accounts.push(newAccount);
  return newAccount;
}

export async function updateAccount(id: string, account: Partial<Account>): Promise<Account | undefined> {
  const index = accounts.findIndex((a) => a.id === id);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...account };
    return accounts[index];
  }
  return undefined;
}

export async function deleteAccount(id: string): Promise<boolean> {
  const initialLength = accounts.length;
  accounts = accounts.filter((account) => account.id !== id);
  return initialLength !== accounts.length;
}

// CRUD operations for expenses
export async function getExpenses(): Promise<Expense[]> {
  return [...expenses];
}

export async function getExpense(id: string): Promise<Expense | undefined> {
  return expenses.find((expense) => expense.id === id);
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const newExpense = {
    ...expense,
    id: Math.random().toString(36).substring(2, 9),
  };
  expenses.push(newExpense);
  return newExpense;
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense | undefined> {
  const index = expenses.findIndex((e) => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...expense };
    return expenses[index];
  }
  return undefined;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const initialLength = expenses.length;
  expenses = expenses.filter((expense) => expense.id !== id);
  return initialLength !== expenses.length;
}

// CRUD operations for incomes
export async function getIncomes(): Promise<Income[]> {
  return [...incomes];
}

export async function getIncome(id: string): Promise<Income | undefined> {
  return incomes.find((income) => income.id === id);
}

export async function createIncome(income: Omit<Income, 'id'>): Promise<Income> {
  const newIncome = {
    ...income,
    id: Math.random().toString(36).substring(2, 9),
  };
  incomes.push(newIncome);
  return newIncome;
}

export async function updateIncome(id: string, income: Partial<Income>): Promise<Income | undefined> {
  const index = incomes.findIndex((i) => i.id === id);
  if (index !== -1) {
    incomes[index] = { ...incomes[index], ...income };
    return incomes[index];
  }
  return undefined;
}

export async function deleteIncome(id: string): Promise<boolean> {
  const initialLength = incomes.length;
  incomes = incomes.filter((income) => income.id !== id);
  return initialLength !== incomes.length;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
}