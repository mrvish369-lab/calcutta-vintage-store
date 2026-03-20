import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StoreFront from './pages/StoreFront';
import Reader from './pages/Reader';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MobileNav from './components/MobileNav';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<StoreFront />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <MobileNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
