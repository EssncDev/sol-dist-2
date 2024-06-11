// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home.js';
import NotFound from './components/NotFound/NotFound.js';
import WalletContextProvider from './components/WalletContextProvider.js';

const App = () => {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </WalletContextProvider>
    
  );
};

export default App;


