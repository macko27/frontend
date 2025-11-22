import axios from 'axios'

const ax = axios.create();
const api = axios.create();

var apiUrl = "https://localhost:5092/api";
export const hubUrl = "https://localhost:5092/notificationHub";
//export const hubUrl = "https://talent-hub-backend-anf9c3d6e9cdbgg2.polandcentral-01.azurewebsites.net/notificationHub";
//var apiUrl = "https://talent-hub-backend-anf9c3d6e9cdbgg2.polandcentral-01.azurewebsites.net/api";

api.defaults.baseURL = apiUrl;
api.defaults.headers.common["Content-Type"] = "application/json";

api.interceptors.request.use(
    (request) => {
        const currentAccessToken = localStorage.getItem('accessToken'); // Get the latest token
        if (currentAccessToken) {
            request.headers["Authorization"] = `Bearer ${currentAccessToken}`;
        }
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("Token refresh");
                const jwtToken = localStorage.getItem('accessToken'); // Use the latest access token
                const refreshToken = localStorage.getItem('refreshToken');

                const response = await ax.post(`${apiUrl}/Auth/RefreshToken`, {
                    jwtToken,
                    refreshToken,
                }, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        "Content-Type": 'application/json'
                    }
                });

                const { newJwtToken, newRefreshToken } = response.data;

                localStorage.setItem('accessToken', newJwtToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry the original request with the new access token
                originalRequest.headers["Authorization"] = `Bearer ${newJwtToken}`;
                return api(originalRequest);
            } 
            catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;