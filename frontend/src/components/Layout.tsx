// src/components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div className="container">
            <Outlet /> {/* This will render the child routes */}
        </div>
    );
};

export default Layout;