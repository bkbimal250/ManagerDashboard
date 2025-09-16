import React, { useState } from 'react';

const RotatingLogo = ({ className = "", size = "w-16 h-16", orbitRadius = "400px" }) => {
  const [isHidden, setIsHidden] = useState(false);
  const [showAxis, setShowAxis] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Responsive orbit radius calculation
  const getResponsiveOrbitRadius = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return '200px'; // sm
      if (width < 768) return '300px'; // md
      if (width < 1024) return '400px'; // lg
      return '500px'; // xl
    }
    return orbitRadius;
  };

  const handleLogoClick = () => {
    setIsHidden(true);
    setTimeout(() => {
      setShowAxis(true);
    }, 500);
  };

  const handleAxisClick = () => {
    setShowAxis(false);
    setTimeout(() => {
      setIsHidden(false);
    }, 500);
  };

  return (
    <div className={`${className} relative`}>
      {/* Circular orbit container */}
      <div 
        className="absolute animate-orbit"
        style={{
          width: getResponsiveOrbitRadius(),
          height: getResponsiveOrbitRadius(),
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: isHidden || isHovered ? 'none' : 'orbit 20s linear infinite',
          opacity: isHidden ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        {/* Logo positioned on the orbit path */}
        <div 
          className={`${size} absolute`}
          style={{
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: isHidden || isHovered ? 'none' : 'counter-orbit 20s linear infinite'
          }}
        >
          <img
            src="/companylogo.png"
            alt="Company Logo"
            className="w-full h-full object-contain cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            style={{
              animation: 'none',
              transition: 'all 0.3s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (!isHidden) {
                setIsHovered(true);
                e.target.style.animation = 'rotate 2s linear infinite';
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              setIsHovered(false);
              e.target.style.animation = 'none';
              e.target.style.transform = 'scale(1)';
            }}
            onClick={handleLogoClick}
          />
        </div>
      </div>

      {/* Alternative Axis - Shows when logo is hidden */}
      <div 
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: showAxis ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: showAxis ? 'auto' : 'none'
        }}
      >
        {/* X-Axis */}
        <div 
          className="absolute bg-blue-500 animate-pulse cursor-pointer"
          style={{
            width: '300px',
            height: '2px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={handleAxisClick}
          onMouseEnter={(e) => {
            e.target.style.height = '4px';
            e.target.style.backgroundColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.height = '2px';
            e.target.style.backgroundColor = '#3b82f6';
          }}
        />
        
        {/* Y-Axis */}
        <div 
          className="absolute bg-red-500 animate-pulse cursor-pointer"
          style={{
            width: '2px',
            height: '300px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={handleAxisClick}
          onMouseEnter={(e) => {
            e.target.style.width = '4px';
            e.target.style.backgroundColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.target.style.width = '2px';
            e.target.style.backgroundColor = '#ef4444';
          }}
        />
        
        {/* Center Point */}
        <div 
          className="absolute bg-green-500 rounded-full cursor-pointer"
          style={{
            width: '12px',
            height: '12px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={handleAxisClick}
          onMouseEnter={(e) => {
            e.target.style.width = '16px';
            e.target.style.height = '16px';
            e.target.style.backgroundColor = '#22c55e';
          }}
          onMouseLeave={(e) => {
            e.target.style.width = '12px';
            e.target.style.height = '12px';
            e.target.style.backgroundColor = '#22c55e';
          }}
        />
        
        {/* Axis Labels */}
        <div 
          className="absolute text-blue-500 font-bold text-sm"
          style={{
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Y
        </div>
        <div 
          className="absolute text-red-500 font-bold text-sm"
          style={{
            top: '50%',
            right: '20%',
            transform: 'translateY(-50%)'
          }}
        >
          X
        </div>
      </div>
      
      {/* Custom CSS for circular orbit and rotation */}
      <style jsx>{`
        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes counter-orbit {
          0% {
            transform: translateX(-50%) rotate(0deg);
          }
          100% {
            transform: translateX(-50%) rotate(-360deg);
          }
        }

        @keyframes rotate {
          0% {
            transform: scale(1.1) rotate(0deg);
          }
          100% {
            transform: scale(1.1) rotate(360deg);
          }
        }

        img:hover {
          transform: scale(1.1);
        }

        .animate-orbit {
          animation: orbit 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RotatingLogo;
