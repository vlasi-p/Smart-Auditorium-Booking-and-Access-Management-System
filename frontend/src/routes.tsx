// import React from 'react';
// import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
// import Login from './components/Login/Login';  // Path to your Login component
// import Auditoriums from './components/Auditoriums/Auditoriums'; // Path to your Auditoriums component
// import AdminPage from './pages/AdminPage';

// const Routes = () => {
//   return (
//     <ReactRouterRoutes>
      
//       <Route path="/auditoriums" element={<Auditoriums />} />  {/* Auditoriums page route */}
//       <Route path="/admin" element={<AdminPage />} />
//     </ReactRouterRoutes>
//   );
// };

// export default Routes;


// src/routes.tsx
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuditoriumsPage from './pages/AuditoriumsPage';
import AdminPage from './pages/AdminPage';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

const AppRoutes = () => (
  <Routes>
    {/* Regular user layout */}
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
          <AuditoriumsPage />
        </MainLayout>
      }
    />

    {/* Admin-specific layout */}
    <Route
      path="/admin"
      element={
        <AdminLayout>
          <AdminPage />
        </AdminLayout>
      }
    />
    
  </Routes>
);

export default AppRoutes;

