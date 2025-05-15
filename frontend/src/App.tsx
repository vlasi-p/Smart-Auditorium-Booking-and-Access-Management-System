// import React from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';
// import Routes from './routes';
// import Header from './components/Header/Header';
// import Footer from './components/Footer/Footer';
// import './App.css'; // Import the layout styles

// function App() {
//   return (
//     <div className="app-container">
//       <Router>
//         <Header />
//         <main className="main-content">
//           <Routes />
//         </main>
//         <Footer />
//       </Router>
//     </div>
//   );
// }

// export default App;


import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';

function App() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

export default App;
