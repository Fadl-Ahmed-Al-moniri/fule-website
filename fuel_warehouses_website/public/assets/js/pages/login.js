import { postRequest } from '../services/apiService.js';
import { showLoader, hideLoader }  from '../utils/loader.js';
import { API_ENDPOINTS }  from '../endpoint.js';


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = form.username.value;
    const password = form.password.value;


    try {
        showLoader();
        const response = await postRequest( API_ENDPOINTS.Auth.login, {
        username: username,
        password: password,
        });
        if (response.status ===200){
            alert("Logged in successfully");
            localStorage.setItem('user_token',  response.data.access);

            window.location.href = '../index.html';
        }
        else if (response.status ===401){
            alert("Please check the username and password.");
        }
    } catch (error) {
        alert('An error occurred' );

    }finally{
        hideLoader();
    }
    });
});
