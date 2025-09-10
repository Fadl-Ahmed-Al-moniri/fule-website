export function getUserToken() {
    const token = localStorage.getItem("user_token");

    if (token) {
        return token; 
    } else {
        alert("An error occurred, please log in again.");
        window.location.href = 'pages/login.html'; 
    }
}
