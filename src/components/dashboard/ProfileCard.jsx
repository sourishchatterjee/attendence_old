import React from 'react';

const ProfileCard = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
            alt="Profile"
            className="w-32 h-32 rounded-2xl object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
            4+ years experience
          </div>
        </div>

        <div className="mt-4 text-center w-full">
          <h3 className="text-xl font-bold text-gray-800">Chris Jonathan</h3>
          <p className="text-gray-500 text-sm">General manager</p>

          <div className="flex gap-2 justify-center mt-4">
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
