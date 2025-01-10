const orderLabel = document.getElementById('orders-label');
const ordersList = document.getElementById('orders-list');
const navbar = document.getElementById("navbar");
const ip = "localhost";

let orders = [];

//Method to fetch order data from the orders backend
const fetchOrders = async() => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if( !clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    try {
        const response = await fetch(`http://${ip}:3333/api/orders/${clientInfo.username}`);
        if(!response.ok)
            throw new Error("Error fetching orders from database...");

        orders = await response.json() || [];
        
    } catch (error) {
        console.error(error);
    }

};

fetchOrders().then(() => generateOrders());

// Method to generate the page with the orders
const generateOrders = () => {
    if(orders.length != 0){
        return (ordersList.innerHTML = orders.map(x => {
            const { id, products, total_price, status, username } = x;
            const productString = products.map(y => {
                return `
                <div class="order-list-item">
                    <div class="product-amount">
                        ${y.amount}
                    </div>
                    <div class="title-id">
                        <h5>${y.title}</h5>
                        <h6>PID: ${y.product_id}</h6>
                    </div>
                </div>
                `;
            }).join("");
            return `
            <div class="order-item">
                <div class="status-id">
                    <h4>Status: ${status}</h4>
                    <div class="order-id">
                        ID:${id}
                    </div>
                </div>

                <div class="basket-pricing">
                    <i class="bi bi-basket2"></i>
                    <div class="pricing">
                        <h4>Total Cost</h4>
                        ${total_price} $
                    </div>
                </div>

                <div class="product-list">
                    ${productString}
                </div>
                
            </div>
            `;
        }).join("")
    );
    }else{
        ordersList.innerHTML = ``;
        orderLabel.innerHTML = `
        <h2>Order list is empty</h2>
        <a href="main.html">
            <button class="HomeButton">Back to Home</button>
        </a>
        `;
    }
}

const generateNavbar = () => {
    const clientInfo = JSON.parse(localStorage.getItem("Client-Info"));

    if(!clientInfo){
        window.location.replace(`http://${ip}:7777/index.html`);
        return;
    }
    return (navbar.innerHTML = `
        <a class="shop-title" href="main.html">
            <h2>Electronics-shop</h2>
        </a>

        <h2>My Orders</h2>

        <div class="userInfo">
            <p class="username" id="username">${clientInfo.username}</p>
            <i class="bi bi-person-circle">
                <div class="tooltip">${clientInfo.user_role}</div>
            </i>
        </div>

        <div class="buttons">
            <a href="./orders.html">
                <i class="bi bi-receipt">
                    <div class="tooltip">My Orders</div>
                </i>
            </a>
            <a href="./cart.html">
                <i class="bi bi-cart">
                    <div class="tooltip">My Cart</div>
                    <div class="cart-amount">0</div>
                </i>
            </a>

            <i onclick="logoutClient()" class="bi bi-box-arrow-right">
                <div class="tooltip">Logout</div>
            </i>
            
        </div>
    `);
};

generateNavbar();

// Method to update the number in the cart icon
const computeCartAmount = () => {
    const cartAmount = document.querySelector('.cart-amount');
    const basket = JSON.parse(localStorage.getItem("basket")) || [];
    cartAmount.innerHTML = basket.map(x => x.amount).reduce((x,y) => x + y, 0);
};

computeCartAmount();

// Method to logout client from keycloak
const logoutClient = async() => {
    console.log("Logout clicked...");
    try {
        const client = JSON.parse(window.localStorage.getItem("Client-Info"));
        const refresh_token = client.refresh_token;
        const urlencoded = new URLSearchParams();
        urlencoded.append("refresh_token", refresh_token);
        urlencoded.append("client_id", "frontend-app");
        
        const response = await fetch(`http://${ip}:8182/realms/eshop-app/protocol/openid-connect/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlencoded.toString(),
        });

        if(!response.ok)
            throw new Error("Error while logging out user...");

        window.localStorage.clear();

        window.location.href = `http://${ip}:7777/index.html`;
    } catch (error) {
        console.error(error);
    }
};

// Method to refresh the client's token
const refreshToken = async () => {
    try {
        const client = JSON.parse(window.localStorage.getItem("Client-Info"));
        if(!client)
            return;
        const refresh_token = client.refresh_token;
        const urlencoded = new URLSearchParams();
        urlencoded.append("client_id", "frontend-app")
        urlencoded.append("grant_type","refresh_token");
        urlencoded.append("refresh_token", refresh_token);

        const response = await fetch(`http://${ip}:8182/realms/eshop-app/protocol/openid-connect/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlencoded.toString()
        });

        if(!response.ok)
            throw new Error("Error while retrieving refresh token...");

        const data = await response.json();

        client.refresh_token = data.refresh_token;

        window.localStorage.setItem("Client-Info", JSON.stringify(client));

    } catch (error) {
        console.error(error);
    }
};

setInterval(refreshToken(), 2*60*1000);