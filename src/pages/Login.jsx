import React from 'react';
import { LoginHeader, LoginForm, LoginFooter, AnimatedBackground, RotatingLogo } from '../Components/UI';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 md:py-6 md:px-6 lg:py-8 lg:px-8 relative overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/managerbackground.jpg')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>

      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Login Form Container */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-white/20 relative mx-2 sm:mx-4">
          {/* Rotating Logo - Responsive positioning and sizing */}
          <div className="absolute -top-8 -left-8 sm:-top-12 sm:-left-12 md:-top-16 md:-left-16 lg:-top-20 lg:-left-20 w-full h-full pointer-events-none hidden sm:block">
            <RotatingLogo 
              size="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16" 
              orbitRadius="200px sm:300px md:400px lg:500px"
              className="w-full h-full"
            />
          </div>
          
          <LoginHeader />
          
          <LoginForm />
          <LoginFooter />
        </div>
      </div>
    </div>
  );
};

export default Login;