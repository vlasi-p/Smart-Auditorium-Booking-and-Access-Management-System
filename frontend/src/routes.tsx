// routes.jsx
import React from 'react';
import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Auditoriums from './components/Auditoriums/Auditoriums';
import AdminPage from './pages/AdminPage';
import ReservationStatus from './components/ReservationStatus/ReservationStatus';
import AdminLayout from './layouts/AdminLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';

const Routes = () => {
  return (
    <ReactRouterRoutes>
      {/* Routes using MainLayout (includes Header/Footer) */}
      <Route
        path="/"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path="/auditoriums"
        element={
          <MainLayout>
            <Auditoriums />
          </MainLayout>
        }
      />
      <Route
        path="/reservation/:id"
        element={
          <MainLayout>
            <ReservationStatus />
          </MainLayout>
        }
      />

      {/* Route without Header/Footer */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminPage />
          </AdminLayout>
        }
      />
    </ReactRouterRoutes>
  );
};

export default Routes;
