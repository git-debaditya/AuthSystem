//Simple form (email/password)
//On submit: POST /auth/register
//On success: redirect to /dashboard (since your backend auto-logs in on register)

import { useState } from "react";                    //track form fields & errors
import { useNavigate, Link } from "react-router-dom";     //redirect after registration
import api from "../api";                          //ensures cookies are included automatically

export default function Register () {
    const navigate = useNavigate("");         //for redirecting after registration
    const [email, setEmail] = useState("");         //initialize state for email
    const [password, setPassword] = useState("");   //initialize state for password
    const [confirmPassword, setConfirmPassword ] = useState("");  //initialize state for confirm password
    const [error, setError] = useState("");         //initialize state for error message
    const [loading, setLoading] = useState(false);  //initialize state for loading status

    
}