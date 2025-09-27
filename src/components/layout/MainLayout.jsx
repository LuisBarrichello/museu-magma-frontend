import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
            <div className="main-content">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="page-content">
                    <Outlet />{' '}
                </main>
            </div>

            {isSidebarOpen && (
                <div className="overlay" onClick={toggleSidebar}></div>
            )}
        </div>
    );
};

export default MainLayout;
