import React, { useState, useEffect } from 'react';

const AnimatedBackground = () => {
  const [hiddenElements, setHiddenElements] = useState([]);
  const [isHiding, setIsHiding] = useState(false);

  // Auto-hide elements one by one after 10 seconds (except company name)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true);
      const elements = [
        'data-safety-1',
        'data-safety-2', 
        'data-safety-3',
        'data-safety-4', // Added for email
        'security-icon-1',
        'security-icon-2',
        'security-icon-3',
        'dots-pattern',
        'trust-message'
      ];

      elements.forEach((element, index) => {
        setTimeout(() => {
          setHiddenElements(prev => [...prev, element]);
        }, index * 800); // Hide each element with 800ms delay
      });
    }, 10000); // Start hiding after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const isElementHidden = (elementId) => hiddenElements.includes(elementId);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated floating text elements */}
      <div className="absolute inset-0">
        {/* Company Name - Main animated text */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 hidden sm:block">
          <div className="text-4xl sm:text-6xl md:text-8xl font-bold animate-pulse">
            {/* Disha */}
            <div className="flex">
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0s', animationDuration: '3s' }}>D</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.1s', animationDuration: '3s' }}>i</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.2s', animationDuration: '3s' }}>s</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.3s', animationDuration: '3s' }}>h</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.4s', animationDuration: '3s' }}>a</span>
            </div>
            {/* Online */}
            <div className="flex">
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>O</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.6s', animationDuration: '3s' }}>n</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.7s', animationDuration: '3s' }}>l</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.8s', animationDuration: '3s' }}>i</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '0.9s', animationDuration: '3s' }}>n</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1s', animationDuration: '3s' }}>e</span>
            </div>
            {/* Solution */}
            <div className="flex">
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.1s', animationDuration: '3s' }}>S</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.2s', animationDuration: '3s' }}>o</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.3s', animationDuration: '3s' }}>l</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.4s', animationDuration: '3s' }}>u</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>t</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.6s', animationDuration: '3s' }}>i</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.7s', animationDuration: '3s' }}>o</span>
              <span className="inline-block animate-bounce animate-color-change" style={{ animationDelay: '1.8s', animationDuration: '3s' }}>n</span>
            </div>
          </div>
        </div>

        {/* Data Safety Message - Floating text */}
        <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2 hidden sm:block">
          <div className="text-sm sm:text-lg md:text-xl font-semibold text-gray-800/90 max-w-xs">
            <div 
              className={`animate-fade-in-up transition-all duration-1000 ease-in-out ${
                isElementHidden('data-safety-1') ? 'opacity-0 translate-y-10 scale-75' : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{ animationDelay: '2s', animationDuration: '2s' }}
            >
              <span className="inline-block animate-typewriter text-gray-800 font-semibold" style={{ animationDelay: '2s' }}>
                Our Company Will Keep Data Safe
              </span>
            </div>
            <div 
              className={`animate-fade-in-up mt-2 transition-all duration-1000 ease-in-out ${
                isElementHidden('data-safety-2') ? 'opacity-0 translate-y-10 scale-75' : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{ animationDelay: '2.5s', animationDuration: '2s' }}
            >
              <span className="inline-block animate-typewriter text-gray-800 font-semibold" style={{ animationDelay: '2.5s' }}>
                You will get your information and all data
              </span>
            </div>
            <div 
              className={`animate-fade-in-up mt-2 transition-all duration-1000 ease-in-out ${
                isElementHidden('data-safety-3') ? 'opacity-0 translate-y-10 scale-75' : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{ animationDelay: '3s', animationDuration: '2s' }}
            >
              <span className="inline-block animate-typewriter text-gray-800 font-semibold" style={{ animationDelay: '3s' }}>
                Any issue found contact to administration
              </span>
            </div>
            <div 
              className={`animate-fade-in-up mt-3 transition-all duration-1000 ease-in-out ${
                isElementHidden('data-safety-4') ? 'opacity-0 translate-y-10 scale-75' : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{ animationDelay: '3.5s', animationDuration: '2s' }}
            >
              <span className="inline-block animate-typewriter text-blue-600 font-bold" style={{ animationDelay: '3.5s' }}>
                📧 dos.bimal@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Floating security icons */}
        <div 
          className={`absolute top-1/2 left-1/6 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out hidden sm:block ${
            isElementHidden('security-icon-1') ? 'opacity-0 scale-0 rotate-45' : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <div className="text-2xl sm:text-4xl text-gray-600/60 animate-float">
            🔒
          </div>
        </div>

        <div 
          className={`absolute top-2/3 right-1/6 transform translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out hidden sm:block ${
            isElementHidden('security-icon-2') ? 'opacity-0 scale-0 rotate-45' : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <div className="text-2xl sm:text-4xl text-gray-600/60 animate-float" style={{ animationDelay: '1s' }}>
            🛡️
          </div>
        </div>

        <div 
          className={`absolute top-1/6 right-1/3 transform translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out hidden sm:block ${
            isElementHidden('security-icon-3') ? 'opacity-0 scale-0 rotate-45' : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <div className="text-xl sm:text-3xl text-gray-600/60 animate-float" style={{ animationDelay: '2s' }}>
            🔐
          </div>
        </div>

        {/* Animated dots pattern */}
        <div 
          className={`absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2 transition-all duration-1000 ease-in-out hidden sm:block ${
            isElementHidden('dots-pattern') ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex space-x-2 sm:space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-600/40 rounded-full animate-ping"
                style={{ animationDelay: `${i * 0.5}s`, animationDuration: '2s' }}
              />
            ))}
          </div>
        </div>

        {/* Trust message */}
        <div 
          className={`absolute bottom-1/3 left-1/4 transform -translate-x-1/2 translate-y-1/2 transition-all duration-1000 ease-in-out hidden sm:block ${
            isElementHidden('trust-message') ? 'opacity-0 translate-y-5 scale-90' : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <div className="text-xs sm:text-sm md:text-base text-gray-700/70 font-medium">
            <div className="animate-fade-in" style={{ animationDelay: '3.5s', animationDuration: '2s' }}>
              Trusted • Secure • Reliable
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes color-change {
          0% {
            color: #3b82f6; /* blue-500 */
          }
          25% {
            color: #ef4444; /* red-500 */
          }
          50% {
            color: #10b981; /* emerald-500 */
          }
          75% {
            color: #f59e0b; /* amber-500 */
          }
          100% {
            color: #22c55e; /* green-500 */
          }
        }

        @keyframes typewriter {
          0% {
            width: 0;
            opacity: 0.8;
          }
          10% {
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes blink-cursor {
          0%, 50% {
            border-color: transparent;
          }
          51%, 100% {
            border-color: #3b82f6;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 2s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 2s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-color-change {
          animation: color-change 4s ease-in-out infinite;
        }

        .animate-typewriter {
          animation: typewriter 3s steps(40, end) forwards, blink-cursor 1s infinite;
          white-space: nowrap;
          overflow: hidden;
          border-right: 2px solid #3b82f6;
          opacity: 1;
          display: inline-block;
          min-width: 0;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
