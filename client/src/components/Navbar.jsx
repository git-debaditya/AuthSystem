import {Link} from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="logo">AuthSystem</h1>
            <div className="links">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/dashboard">Dashboard</Link>
            </div>
        </nav>
    )
}