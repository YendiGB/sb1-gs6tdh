import React from 'react';
import { BarChart3, BookOpen, Target, Users } from 'lucide-react';

const Overview: React.FC = () => {
  const stats = [
    { title: 'Total Books', value: '24', icon: BookOpen, color: 'bg-blue-500' },
    { title: 'Active Challenges', value: '12', icon: Target, color: 'bg-green-500' },
    { title: 'Total Users', value: '1,234', icon: Users, color: 'bg-purple-500' },
    { title: 'Monthly Revenue', value: '$12,345', icon: BarChart3, color: 'bg-yellow-500' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`text-${stat.color.split('-')[1]}-500`} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;