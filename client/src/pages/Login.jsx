//Simple form (email/password)
//On submit: POST /auth/login
//On success: redirect to /dashboard

import { useState } from "react";                    //track form fields & errors
import { useNavigate } from "react-router-dom";     //redirect after login
import api from "../api";                          //ensures cookies are included automatically

export default function Login() {
    const navigate = useNavigate();                 //for redirecting after login
    const [email, setEmail] = useState("");         //initialize state for email
    const [password, setPassword] = useState("");   //initialize state for password
    const [error, setError] = useState("");         //initialize state for error message
    const [loading, setLoading] = useState(false);  //initialize state for loading status

    async function handleSubmit(e) {
        e.preventDefault();     //prevent page reload
        setError("");          //clear previous error
        setLoading(true);     //set loading state to true

        try {
            await api.post("/auth/login", {email, password });  //send login request to backend
            navigate("/dashboard");  //redirect to dashboard on successful login
        } catch (err) {
            const status = err?.response?.status;  //get status code from error response
            
            if (status === 400) {
                //set error message for validation errors
                setError("Please fill in all fields!");
            }
            else if (status === 401) {
                //set error message for invalid credentials
                setError("Invalid email or password!");
            }
            else if (status === 429) {
                //set error message for rate limiting
                setError("Too many attemps! Please try later.");
            }
            else {
                //set generic error message for other errors
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
                <h2>Login</h2>

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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button className="button" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="muted">
                    Don't have an account? {/*<link className="link" to="/register">Register</link> */}
                </p>
            </div>
        </div>
    );
}