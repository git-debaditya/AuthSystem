import axios from "axios";

// Create an Axios instance with default settings
//Every request through this instance automatically sends/receives the session cookie.
const api = axios.create({
    baseURL: "http://localhost:4000",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

//every request made via api.get(...), api.post(...)
// will include your session cookie automatically.