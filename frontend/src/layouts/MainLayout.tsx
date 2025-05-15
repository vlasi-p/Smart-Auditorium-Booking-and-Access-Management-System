// src/layouts/MainLayout.tsx

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import '../App.css'; // If needed for main layout

  

const MainLayout = ({ children }: { children: React.ReactNode }) => (

     <div className="app-container">
        <Header />
            <main className="main-content">{children}</main>
        <Footer />
    </div>

);

export default MainLayout;