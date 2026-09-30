import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DailyList from './components/DailyList';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import WashRecordDetail from './components/WashRecordDetail';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 font-sans">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-8 drop-shadow-sm">Lavadero</h1>
          <Routes>
            <Route path="/" element={<DailyList />} />
            <Route path="/lavado/:id" element={<WashRecordDetail />} />
            <Route path="/contacto" element={<div className="text-xl">Página de Contacto (En construcción)</div>} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

