import React, { useState } from 'react';
import { Login } from './components/Login';
import { MainApp } from './components/MainApp';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("meteoRT_auth") === "true");

    return (
        <>
            {isAuthenticated 
                ? <MainApp /> 
                : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            }
        </>
    );
};

export default App;
