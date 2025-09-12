import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

function App() {

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
