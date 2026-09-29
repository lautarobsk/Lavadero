import React from 'react';
import DailyList from './components/DailyList';

function App() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 py-10 px-4">
      <h1 className="text-5xl font-extrabold text-blue-500 mb-8 drop-shadow-md">Lavadero Frontend</h1>
      <DailyList />
    </div>
  );
}

export default App;

