// src/routes.js
import React from 'react';
import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
import Auditoriums from './components/Auditoriums/Auditoriums';
import ReservationStatus from './components/ReservationStatus/ReservationStatus';

const Routes = () => (
  <ReactRouterRoutes>
    <Route path="/auditoriums" element={<Auditoriums />} />
    <Route path="/reservation/:id" element={<ReservationStatus />} />
  </ReactRouterRoutes>
);

export default Routes;
