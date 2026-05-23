import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Profile from './pages/Profile';
import SnippetManager from './pages/SnippetManager';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
            {/* Herkese açık rotalar */}
            <Route path="/login" element={<Login />} />
            
            {/* Korumalı Rotalar */}
            <Route path="/*" element={
                <ProtectedRoute>
                    <Sidebar />
                    <div className="main-content">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/projects/:id" element={<ProjectDetail />} />
                            <Route path="/snippets" element={<SnippetManager />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </ProtectedRoute>
            } />
        </Routes>
        <ToastContainer position="top-center" theme="colored" />
      </div>
    </Router>
  );
}

export default App;
