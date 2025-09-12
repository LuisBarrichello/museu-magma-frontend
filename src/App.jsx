import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Route */}
                    
                    {/* Protected Routes */}
                    <Route
                        path="..."
                        element={
                            <RoleProtectedRoute allowedRoles={[]}>
                                {/* protected component here */}
                            </RoleProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
