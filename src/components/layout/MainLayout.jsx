import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const MainLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    <Outlet />{' '}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
