// assets
import logo from 'assets/images/t2riv-logo.jpg';

// ==============================|| LOGO ICON ||============================== //

export default function LogoIcon() {
  return (
    <img 
      src={logo} 
      alt="T2RIV Logo" 
      style={{ 
        width: '100%', 
        height: 'auto',
        maxHeight: '60px',
        objectFit: 'contain'
      }} 
    />
  );
}
