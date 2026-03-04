//On mount: call GET /auth/me
//If 200: show user info + Logout button
//If 401: redirect to /login
//Logout button calls POST /auth/logout then redirects to /login

import { useEffect, useState } from "react";         //run API call & store user data
import { useNavigate } from "react-router-dom";     //redirect on unauthorized or after logout
import api from "../api";                          //ensures cookies are included automatically

export default function Dashboard() {
    const navigate = useNavigate();                  //redirect on unauthorized or after logout
    const [user, setUser] = useState(null);         //store user data
    const [loading, setLoading] = useState(true);  //track loading state
    const [error, setError] = useState("");       //track error state

    useEffect(() => {
        //flag to track if component is unmounted
        let cancelled = false;
        
        async function fetchUser() {
            //clear previous error
            setError("");
            
            //set loading to true before API call    
            setLoading(true);
            
            try {
                const res = await api.get("/auth/me");  //call "Who Am I?" endpoint to get user info
                if (cancelled) return;
                //store user data in state
                setUser(res.data.user);

            } catch (err) {
                if (cancelled) return;

                //get status code from error response
                const status = err?.response?.status;
                if (status === 401) {
                    //redirect to login if unauthorized
                    navigate("/login");
                    return;
                }
                setError("Failed to fetch user data.");
            } finally {
                //set loading to false after request completes
                if(!cancelled) setLoading(false);
            }
        }
        //call the function to fetch user data on component mount
        fetchUser();
        
        //cleanup function to set cancelled flag if component unmounts
        return () => {
            cancelled = true;
        };
    },[navigate]);
    //dependency array with navigate to avoid warnings
    // won't cause re-renders since navigate is stable

    async function handleLogout() {
        setError("");
        setLoading(true);

        try {
            //call logout endpoint
            await api.post("/auth/logout");
            
            //clear user data from state
            setUser(null);

            //redirect to login page
            navigate("/login");
        } catch (err) {
            const status = err?.response?.status;
            if (status === 500) {
                //unable to logout due to server error
                setError("Server error. Please try again later!");
            } else {
                //generic error message
                setError("Failed to logout. Please try again.");
            }
        } finally {
            //set loading to false after request completes
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <p className="error">{error}</p>
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="page">
                <p>No user data available.</p>
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        );
    }

    return(
        <div className="page">
            <div className="card">
                <h2 className="title">Dashboard</h2>
                <p className="muted">Welcome, {user.email}!</p>

                <div className="info">
                    <p>User ID: {user.id}</p>
                    <p>Role: {user.role}</p>
                    <p>Created At: {user.created_at}</p>
                </div>
                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}