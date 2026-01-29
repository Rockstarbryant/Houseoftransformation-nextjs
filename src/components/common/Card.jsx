// src/components/common/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  shadow = 'md',
  variant = 'light',
  border = false
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const variants = {
    light: 'bg-white dark:bg-slate-800',
    slate: 'bg-slate-50 dark:bg-slate-700',
    dark: 'bg-slate-900 text-white',
    gradient: 'bg-gradient-to-br from-slate-50 to-white'
  };

  const borderClass = border ? 'border border-slate-200' : '';
  const hoverClass = hover 
    ? 'hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer' 
    : '';

  return (
    <div className={`${variants[variant]} rounded-2xl ${shadows[shadow]} ${paddings[padding]} ${borderClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['light', 'slate', 'dark', 'gradient']),
  border: PropTypes.bool
};

export default Card;