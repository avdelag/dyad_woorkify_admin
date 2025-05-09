"use client";
import { ArrowUp, ArrowDown } from "lucide-react";

interface CardProps {
  title: string;
  value: string;
  change: string;
}

export const Card = ({ title, value, change }: CardProps) => {
  const isPositive = change.startsWith("+");
  
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {change}
        </span>
      </div>
    </div>
  );
};