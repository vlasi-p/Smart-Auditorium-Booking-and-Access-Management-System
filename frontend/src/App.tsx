import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Routes from './routes';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Background from './components/Background/Background';
import './App.css';

const AppWrapper = () => {
  const location = useLocation();
  const [showBackground, setShowBackground] = useState(true);

  useEffect(() => {
    // Hide background when navigating away from the root ("/")
    if (location.pathname !== '/') {
      setShowBackground(false);
    }
  }, [location.pathname]);

  return (
    <>
      {showBackground && <Background />}
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes />
        </main>
        <Footer />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
