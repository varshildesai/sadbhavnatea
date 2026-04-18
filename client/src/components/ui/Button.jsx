import { Link } from 'react-router-dom';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  to, 
  onClick, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary text-gray-900 hover:bg-primary-dark hover:text-white focus:ring-primary",
    secondary: "bg-secondary text-gray-900 hover:bg-secondary-dark hover:text-white focus:ring-secondary",
    outline: "border-2 border-primary text-primary-dark hover:bg-primary hover:text-gray-900 focus:ring-primary",
    ghost: "text-gray-600 hover:bg-surface-light border border-transparent shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return <Link to={to} className={classes} {...props}>{children}</Link>;
  }

  return (
    <button onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}
