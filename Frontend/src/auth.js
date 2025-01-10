const ip = "localhost";

// Method used to decode a JWT token
const decodeJWT = (jwtToken) => {
    const base64Url = jwtToken.split('.')[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace Base64 URL encoding characters
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')); // Decode Base64 and handle URI component encoding

    return JSON.parse(jsonPayload);
};

// Method used to get an access token from keycloak and extract it's info
const getClientInfo = async () => {
    const currentURL = new URLSearchParams(window.location.href);
    const code = currentURL.get("code");
    console.log(code);
    if(!code)
        return (window.location.href = `http://${ip}:8182/realms/eshop-app/protocol/openid-connect/auth/?response_type=code&client_id=frontend-app&redirect_uri=http://${ip}:7777`);

    try {
        const urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "authorization_code");
        urlencoded.append("code", code);
        urlencoded.append("client_id", "frontend-app");
        urlencoded.append("redirect_uri", `http://${ip}:7777`);

        const response = await fetch(`http://${ip}:8182/realms/eshop-app/protocol/openid-connect/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlencoded.toString()
        });

        if(!response.ok)
            throw new Error(`Error while getting token from server...`);

        const data = await response.json();

        const userData = decodeJWT(data.access_token);

        const clientInfo = {
            username: userData.preferred_username,
            email: userData.email,
            user_role: userData.userRole,
            refresh_token: data.refresh_token
        };

        // store client info in local storage
        window.localStorage.setItem("Client-Info", JSON.stringify(clientInfo));

        if(userData.userRole === "customer")
            window.location.href = `http://${ip}:7777/main.html`;
        else
            window.location.href = `http://${ip}:7777/products.html`;

    } catch (error) {
        console.error(error);
    }
};

getClientInfo();