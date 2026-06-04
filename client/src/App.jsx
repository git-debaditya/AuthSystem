import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import "./App.css";

function App() {
  return (
    <Router basename="/AuthSystem/">
      {/* <Navbar /> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path= "/" element ={<Navigate to="/login" replace />} />   {/* Redirect root to login */}
        <Route path= "*" element = {<Navigate to="/login" replace />}/>   {/* Redirect all other routes to login */}
      </Routes>
    </Router>
  );
}

export default App;