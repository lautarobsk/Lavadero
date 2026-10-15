import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DailyList from './components/DailyList';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import WashRecordDetail from './components/WashRecordDetail';
import WashRecordCreate from './components/WashRecordCreate';
import Contact from './components/contact';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-3 h-8 bg-francia-600 rounded-full inline-block"></span>
                <span className="w-1.5 h-6 bg-rojo-600 rounded-full inline-block"></span>
                <h1 className="text-3xl font-black text-francia-700 tracking-tight">
                  LA COSTANERA
                </h1>
              </div>
            </header>

            <Routes>
              <Route path="/" element={<DailyList />} />
              <Route path="/lavado/nuevo" element={<WashRecordCreate />} />
              <Route path="/lavado/:id" element={<WashRecordDetail />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

