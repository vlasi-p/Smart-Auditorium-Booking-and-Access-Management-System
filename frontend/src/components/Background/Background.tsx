// src/components/Background/Background.jsx
import React from 'react';
import coverImage from '../../assets/cover.jpg';
import './Background.css';

const Background = () => {
  return (
    <div
      className="background-image"
      style={{ backgroundImage: `url(${coverImage})` }}
      aria-hidden="true"
      role="presentation"
    />
  );
};

export default Background;
