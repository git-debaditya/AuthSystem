//On mount: call GET /auth/me
//If 200: show user info + Logout button
//If 401: redirect to /login
//Logout button calls POST /auth/logout then redirects to /login

function Dashboard() {
    return (
        <div>Dashboard</div>
    )
}
export default Dashboard;