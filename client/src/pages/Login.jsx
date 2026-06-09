//Simple form (email/password)
//On submit: POST /auth/login
//On success: redirect to /dashboard

import { useEffect, useRef, useState } from "react";                    //track form fields & errors
import { useNavigate, Link } from "react-router-dom";     //redirect after login
import api from "../api";                          //ensures cookies are included automatically

export default function Login() {
    const navigate = useNavigate();                 //for redirecting after login
    const [email, setEmail] = useState("");         //initialize state for email
    const [password, setPassword] = useState("");   //initialize state for password
    const [error, setError] = useState("");         //initialize state for error message
    const [loading, setLoading] = useState(false);  //initialize state for loading status
    const [showPassword, setShowPassword] = useState(false); //state to toggle password visibility
    const passwordTimerRef = useRef(null);          //ref to track password visibility timer

    function handleShowPassword() {
        setShowPassword(true);  //show password when user clicks "Show Password"

        if (passwordTimerRef.current) {
            clearTimeout(passwordTimerRef.current);  //clear existing timer if user clicks again before timer expires
        }

        passwordTimerRef.current = setTimeout(() => {
            setShowPassword(false); //hide password after 5 seconds
        }, 5000);
    }
    useEffect(() => {
        return () => {
            if(passwordTimerRef.current) {
                clearTimeout(passwordTimerRef.current);
            }
        };
    }, []); //cleanup timer on component unmount


    async function handleSubmit(e) {
        e.preventDefault();     //prevent page reload
        setError("");          //clear previous error
        setLoading(true);     //set loading state to true

        try {
            //send login request to backend
            await api.post("/auth/login", {email, password });
            
            //redirect to dashboard on successful login
            navigate("/dashboard");
        } catch (err) {
            //get status code from error response
            const status = err?.response?.status;
            
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
                <h2 className="title">Login</h2>

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
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        className="show-password-button"
                        type="button"
                        onClick={handleShowPassword}
                        disabled={!password} //disable button if password field is empty
                    >
                        {showPassword ? "Hide Password" : "Show Password"}
                    </button>

                    <button className="button" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="muted">
                    Don't have an account? <Link className="link" to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}