import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-purple-100 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  bgColor?: string;
}

const gradients = {
  'bg-blue-500': 'from-blue-500 to-cyan-500',
  'bg-green-500': 'from-green-500 to-emerald-500',
  'bg-purple-500': 'from-purple-500 to-pink-500',
  'bg-red-500': 'from-red-500 to-orange-500',
  'bg-orange-500': 'from-orange-500 to-yellow-500',
};

export function StatsCard({ title, value, icon, trend, bgColor = 'bg-blue-500' }: StatsCardProps) {
  const gradient = gradients[bgColor as keyof typeof gradients] || gradients['bg-blue-500'];

  return (
    <Card className="p-6 hover:scale-105 transform transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-2 font-semibold">📈 {trend}</p>}
        </div>
        <div className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform hover:rotate-12 transition-transform`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
