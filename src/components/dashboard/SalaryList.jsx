import React from 'react';

const SalaryList = () => {
  const salaries = [
    {
      name: 'Syafinah Lan',
      amount: '$2,540.00',
      date: 'Today',
      status: 'Waiting',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
    {
      name: 'Diwan Lane',
      amount: '$2,540.00',
      date: 'Today',
      status: 'Done',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    {
      name: 'Marvin McKinney',
      amount: '$2,540.00',
      date: 'Yesterday',
      status: 'Done',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    },
    {
      name: 'Diwan Lane',
      amount: '$2,540.00',
      date: 'Yesterday',
      status: 'Done',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
    {
      name: 'Eleanor Pena',
      amount: '$2,540.00',
      date: 'Yesterday',
      status: 'Failed',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-700';
      case 'Done':
        return 'bg-green-100 text-green-700';
      case 'Failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gradient-to-br from-accent-teal to-secondary-600 rounded-3xl p-6 text-white">
      <div className="mb-6">
        <p className="text-white/80 text-sm mb-1">Payout monthly</p>
        <h2 className="text-2xl font-bold">Salaries and incentive</h2>
      </div>

      <div className="space-y-3 mb-6">
        {salaries.map((salary, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={salary.avatar}
                  alt={salary.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm">{salary.name}</p>
                  <p className="text-xs text-white/70">{salary.date}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(salary.status)}`}>
                {salary.status}
              </span>
            </div>
            <p className="text-lg font-bold">{salary.amount}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Basic salary</span>
          <span className="font-semibold">$2,040</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Perform</span>
          <span className="font-semibold">$300</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Gift</span>
          <span className="font-semibold">$200</span>
        </div>
        <hr className="border-white/20" />
        <div className="flex justify-between items-center">
          <span className="text-sm">Payment</span>
          <span className="text-2xl font-bold">100%</span>
        </div>
        <div className="bg-primary-500 rounded-xl p-4 mt-4">
          <p className="text-sm mb-2">Take home pay</p>
          <p className="text-3xl font-bold">$2,540.00</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition">
          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="flex-1 bg-primary-500 rounded-xl p-3 hover:bg-primary-600 transition">
          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SalaryList;
