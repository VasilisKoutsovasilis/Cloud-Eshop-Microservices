const label = document.getElementById('label');
const shoppingCart = document.getElementById('shopping-cart');
const navbar = document.getElementById("navbar");
const ip = "localhost";

let basket = JSON.parse(localStorage.getItem("basket")) || [];
let shopItemsData = [];

//Method to fetch Item data from the products backend
const fetchData = async() =>{
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){ // check if the client has access to this page
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    try {
        const response = await fetch(`http://${ip}:4444/api/products`);
        if(!response.ok)
            throw new Error("Error while fetching products from database...");

        shopItemsData = await response.json() || [];
        console.log(shopItemsData);

        generateCartItems();
        calculateTotalBill();
        computeCartAmount();
    } catch (error) {
        console.error(error);
    }
};

fetchData();

// Method to generate the page with the products from the cart
const generateCartItems = () => {
    if(basket.length !== 0){
        return (shoppingCart.innerHTML = basket.map(x => {
            const { id, amount } = x;
            const search = shopItemsData.find(y => y.id === id) || [];
            return `
            <div class="cart-item">
            <img width="100" src="${search.img}" />
            <div class="details">
                <div class="name-price-trash">
                    <h4 class="name-price">
                        <p>${search.title}</p>
                        <p class="cart-item-price">${search.price} $</p>
                    </h4>
                    <i onclick="removeItem(${id})"class="bi bi-trash"></i>
                </div>
                <div class="amount-buttons">
                    <i onclick="decrement(${id})" class="bi bi-dash-circle"></i>
                    <div id=${id} class="amount">
                        ${amount}
                    </div>
                    <i onclick="increment(${id})" class="bi bi-plus-circle"></i>
                    <button onclick="buyMaxQuantity(${id})" class="max-buy-button">Max</button>
                </div>
                
                <h3>${amount * parseInt(search.price)} $</h3>
            </div>
        </div>
            `;
        }).join(""));
    }else{
        shoppingCart.innerHTML = ``;
        label.innerHTML = `
        <h2>The Cart is Empty</h2>
        <a href="main.html">
            <button class="HomeButton">Back to Home</button>
        </a>
        `;
    }
};

// Method to increase the amount of a desired product
const increment = (id) => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    const search = basket.find(item => item.id === id);
    const maxAmount = shopItemsData.find(x => x.id === id).quantity;
    
    if(search === undefined && maxAmount !== 0){
        basket.push({
            id: id,
            amount: 1
        });
    }else
        search.amount++;

    updateAmount(id);

    generateCartItems();

    localStorage.setItem("basket", JSON.stringify(basket));
};

// Method to buy the max quantity of a product 
const buyMaxQuantity = (id) => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    const search = basket.find(item => item.id === id);
    const maxAmount = parseInt(shopItemsData.find(item => item.id === id).quantity);

    if(search === undefined && maxAmount > 0){
        basket.push({
            id: id,
            amount: maxAmount
        });
    }else
        search.amount = maxAmount;

    updateAmount(id);

    localStorage.setItem("basket", JSON.stringify(basket));

    generateCartItems();
}

// Method to decrease the amount of a desired product
const decrement = (id) => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from access...`);
        return;
    }
    const search = basket.find(item => item.id === id);

    if(search === undefined)
        return;

    if(search.amount > 0)
        search.amount--;

    updateAmount(id);

    basket = basket.filter(x => x.amount !== 0);

    generateCartItems();

    localStorage.setItem("basket", JSON.stringify(basket));
}

// method to update the number shown for a desired product
const updateAmount = (id) => {
    const search = basket.find(item => item.id === id);

    document.getElementById(id).innerHTML = search.amount;

    computeCartAmount();

    calculateTotalBill();
}

// Method to update the number in the cart icon
const computeCartAmount = () => {
    const cartAmount = document.querySelector('.cart-amount');

    cartAmount.innerHTML = basket.map(x => x.amount).reduce((x,y) => x + y, 0);
};

// Method to calculate the total charge for the desired products
const calculateTotalBill = () => {
    if(basket.length != 0){
        const totalBill = basket.map(x => {
            const search = shopItemsData.find(y => y.id === x.id);
            return x.amount * parseInt(search.price);
        }).reduce((x,y) => x + y, 0);
        label.innerHTML = `
        <h2>Subtotal: ${totalBill} $</h2>
        <button onclick="checkoutProducts()" class="checkout">Checkout</button>
        <button onclick="clearCart()" class="clear-cart">Clear Cart</button>
        `;
    }
};

// Method to clear the cart of all items (makes the local storage basket empty)
const clearCart = () => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from access...`);
        return;
    }
    basket = [];
    localStorage.setItem("basket", JSON.stringify(basket));
    computeCartAmount();
    generateCartItems();
}

// Method to remove a selected item from the basket
const removeItem = (id) => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from access...`);
        return;
    }
    basket = basket.filter(x => x.id !== id);
    localStorage.setItem("basket", JSON.stringify(basket));
    calculateTotalBill();
    generateCartItems();
    computeCartAmount();
}

// Method to send a new order to be registered to the orders database
const sendOrder = async(newOrder) => {
    try {
        const response = await fetch(`http://${ip}:3333/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newOrder),
        });

        if(!response.ok)
            throw new Error("Error sending data to the database...");

    } catch (error) {
        console.error(error);
    }
};

// Method that does the checkout(creates and sends an order and clears the cart)
const checkoutProducts = () => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "customer"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from access...`);
        return;
    }
    const productList = basket.map(x => {
        const search = shopItemsData.find(y => y.id === x.id);
        return {
            title: search.title,
            amount: x.amount,
            product_id: x.id
        };
    });
    const totalCost = basket.map(x => {
        const search = shopItemsData.find(y => y.id === x.id);
        return x.amount * search.price;
    }).reduce((x,y) => x+y,0);

    const newOrder = {
        products: productList,
        total_price: totalCost,
        status: "Pending",
        username: clientInfo.username
    };
    
    sendOrder(newOrder);
    clearCart();
    alert("Products Ordered Successfully!");
};

// Method to generate the navbar based on the client info from the access token
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

        <h2>My Cart</h2>
        
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

// Method to logout the user from keycloak
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

generateNavbar();

// Method to refresh the token
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