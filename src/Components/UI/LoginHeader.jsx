import React from 'react';

const LoginHeader = () => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center" 
            
            style={{
              backgroundImage: `url('/companylogo.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            >
        
            </div>
          </div>
        </div>
      </div>
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 leading-tight">
        Disha Online Solution
      </h1>
      <p className="text-xs sm:text-sm md:text-base text-primary-600 font-medium">
        Manager Dashboard
      </p>
    </div>
  );
};

export default LoginHeader;
