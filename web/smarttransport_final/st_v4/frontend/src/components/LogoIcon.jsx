import React from 'react';

const LogoVariants = {
  primary: '/icons/logo-primary.svg',
  green: '/icons/logo-green.svg',
  red: '/icons/logo-red.svg',
  orange: '/icons/logo-orange.svg'
};

const LogoIcon = ({ 
  size = '1em', 
  variant = 'primary', 
  style = {}, 
  className = '', 
  title = 'Logo SmartTransport',
  ...props 
}) => {
  const src = LogoVariants[variant] || LogoVariants.primary;
  
  const handleError = (e) => {
    console.error(`LogoIcon failed to load: ${src}`);
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = `[${variant.toUpperCase()}]`;
  };
  
  return (
    <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
      <img
        src={src}
        alt={title}
        width={size}
        height={size}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          ...style
        }}
        className={`logo-icon ${className}`}
        title={title}
        onError={handleError}
        {...props}
      />
    </span>
  );
};

export default LogoIcon;

