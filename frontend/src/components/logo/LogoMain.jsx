// assets
import logo from 'assets/images/t2riv-logo.jpg';

// ==============================|| LOGO MAIN ||============================== //

export default function LogoMain() {
  return (
    <>
      <img 
        src={logo} 
        alt="T2RIV - Deux rives solidaires" 
        style={{ 
          width: 'auto',
          height: '50px',  // Augmenté de 35px à 50px
          objectFit: 'contain',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }} 
      />
    </>
  );
}
