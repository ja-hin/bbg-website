import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

export function validateIFSC(ifsc: string): boolean {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
}

export function getDeviceAge(purchaseDate: Date): number {
  const now = new Date();
  const monthsDiff = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                    (now.getMonth() - purchaseDate.getMonth());
  return monthsDiff;
}

export function calculateClaimPercentage(deviceAge: number): number {
  if (deviceAge >= 6 && deviceAge <= 12) return 70;
  if (deviceAge >= 13 && deviceAge <= 18) return 60;
  if (deviceAge >= 19 && deviceAge <= 24) return 50;
  if (deviceAge >= 25 && deviceAge <= 30) return 40;
  if (deviceAge >= 31 && deviceAge <= 36) return 30;
  if (deviceAge >= 37 && deviceAge <= 48) return 25;
  if (deviceAge >= 49 && deviceAge <= 60) return 20;
  return 0;
}
