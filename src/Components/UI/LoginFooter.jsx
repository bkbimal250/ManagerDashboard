import React from 'react';

const LoginFooter = () => {
  return (
    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
      <p className="text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
        © {new Date().getFullYear()} Disha Online Solution. All rights reserved.
      </p>
    </div>
  );
};

export default LoginFooter;
