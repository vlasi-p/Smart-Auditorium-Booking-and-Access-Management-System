import React from 'react';
import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
import Login from './components/Login/Login';  // Path to your Login component
import Auditoriums from './components/Auditoriums/Auditoriums'; // Path to your Auditoriums component

const Routes = () => {
  return (
    <ReactRouterRoutes>
      
      <Route path="/auditoriums" element={<Auditoriums />} />  {/* Auditoriums page route */}
    </ReactRouterRoutes>
  );
};

export default Routes;
