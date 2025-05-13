import React from 'react';
import './Footer.css'; // Import custom styles

const Footer = () => {
  return (
    <footer className="custom-footer">
      <p className="footer-text">
        © {new Date().getFullYear()} Kutaisi International University - Smart Booking System
      </p>
    </footer>
  );
};

export default Footer;
