import { memo } from 'react';

const TabButton = memo(({ 
  isActive, 
  onClick, 
  icon, 
  label, 
  badge = null,
  size = 'normal' 
}) => {
  const sizeClasses = size === 'small' 
    ? 'p-4 min-w-[140px] max-w-[160px]' 
    : 'p-6 min-w-[200px]';
    
  const iconSize = size === 'small' 
    ? { width: 60, height: 60 } 
    : { width: 90, height: 90 };

  return (
    <div
      className={`flex flex-col items-center cursor-pointer bg-white rounded shadow transition-all duration-200 hover:shadow-2xl hover:bg-blue-50 ${
        isActive ? "ring-2 ring-blue-400" : ""
      } ${sizeClasses}`}
      onClick={onClick}
    >
      <img 
        src={icon} 
        alt={label} 
        style={iconSize} 
        className={size === 'small' ? 'mb-2' : 'mb-4'} 
      />
      <div className="relative">
        <span className={`font-semibold text-center ${
          size === 'small' ? 'text-sm' : 'text-xl'
        } ${isActive ? "text-blue-600 underline" : ""}`}>
          {label}
        </span>
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
});

TabButton.displayName = 'TabButton';

export default TabButton;