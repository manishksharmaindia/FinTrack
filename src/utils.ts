import {
  UtensilsCrossed, Home, Zap, Droplets, Wifi, Fuel, ShoppingCart, ShoppingBag,
  Film, Plane, Heart, GraduationCap, CreditCard, Shield, TrendingUp, MoreHorizontal,
  Banknote, Laptop, Briefcase, Building, Percent, PieChart, Sparkles, Gift,
  CircleDollarSign, Car, Coffee, Phone, Tv, Music, Book, Dumbbell, Baby,
  Dog, Flower2, Scissors, Shirt, Wrench, Umbrella, Globe, Bus, Train, Bike,
  Tag,
  type LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed, Home, Zap, Droplets, Wifi, Fuel, ShoppingCart, ShoppingBag,
  Film, Plane, Heart, GraduationCap, CreditCard, Shield, TrendingUp, MoreHorizontal,
  Banknote, Laptop, Briefcase, Building, Percent, PieChart, Sparkles, Gift,
  CircleDollarSign, Car, Coffee, Phone, Tv, Music, Book, Dumbbell, Baby,
  Dog, Flower2, Scissors, Shirt, Wrench, Umbrella, Globe, Bus, Train, Bike,
  Tag,
};

export const availableIcons = Object.keys(iconMap);

export const availableColors = [
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#64748b',
];

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || MoreHorizontal;
}

export const paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'] as const;

export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const years = Array.from({ length: 25 }, (_, i) => 2026 + i);

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
