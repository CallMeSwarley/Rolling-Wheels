import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Downloads from './pages/Downloads';
import CMS from './pages/CMS';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/cms" element={<CMS />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
