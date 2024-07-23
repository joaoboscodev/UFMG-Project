// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import News from './pages/News';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/news" element={<News />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
