//Simple form (email/password)
//On submit: POST /auth/register
//On success: redirect to /dashboard (since your backend auto-logs in on register)

import { useState } from "react";                    //track form fields & errors
import { useNavigate, Link } from "react-router-dom";     //redirect after registration
import api from "../api";                          //ensures cookies are included automatically

export default function Register () {
    const navigate = useNavigate();         //for redirecting after registration
    
    const [email, setEmail] = useState("");         //initialize state for email
    const [password, setPassword] = useState("");   //initialize state for password
    const [confirmPassword, setConfirmPassword ] = useState("");  //initialize state for confirm password
    const [error, setError] = useState("");         //initialize state for error message
    const [loading, setLoading] = useState(false);  //initialize state for loading status

    async function handleSubmit(e) {
        e.preventDefault();     //prevent page reload
        setError("");          //clear previous error

        //client-side validation for password match
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        //client-side validation for password length
        if (password.length < 8) {
            setError("Password must be at least 8 characters long!");
            return;
        }
        setLoading(true);     //set loading state to true

        try {
            //send registration request to backend
            await api.post("/auth/register", { email, password })
            
            //redirect to dashboard on successful registration
            navigate("/dashboard");
        } catch (err) {
            //get status code from error response
            const status = err?.response?.status;

            if (status === 409) {
                setError("Email is already in use!");
            } else if (status === 400) {
                setError("Invalid email or password!");
            } else {
                setError("Internal server error.");
            }
        } finally {
            //set loading state back to false after request completes
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="card">
                <h2 className="title">Register</h2>

                {error && <p className="alert">{error}</p>}

                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="email" className="label">Email: </label>
                    <input
                        id="email"
                        className="input"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="password" className="label">Password: </label>
                    <input
                        id="password"
                        className="input"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="confirmPassword" className="label">Confirm Password: </label>
                    <input
                        id="confirmPassword"
                        className="input"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button className="button" type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="muted">
                    Have an account? <Link className="link" to="/login">Login</Link>
                </p>
            </div>
        </div>
    )
}