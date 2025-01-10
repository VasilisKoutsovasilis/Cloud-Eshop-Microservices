const shop = document.getElementById('shop');
const navbar = document.getElementById("navbar");
const ip = "localhost";

let basket = JSON.parse(localStorage.getItem("basket")) || [];

let shopItemsData = [];

//Method to fetch Item data from the products backend
const fetchData = async() =>{
    try {
        const response = await fetch(`http://${ip}:4444/api/products`);
        if(!response.ok)
            throw new Error("Error while fetching products from database...");

        shopItemsData = await response.json() || [];
        generateShop();
    } catch (error) {
        console.error(error);
    }
};

// Method to generate the page with the products that are available to the client for purchase
const generateShop = () => {
    return (shop.innerHTML = shopItemsData.filter(x => parseInt(x.quantity) > 0)
        .map(x => {
        const { id, title, price, img, quantity } = x;
        const search = basket.find(y => y.id === id) || [];
        return `
        <div id="product-id-${id}" class="item">
            <img width="220" src="${img}">
            <div class="details">
                <h3>${title}</h3>
                <div class="price-amount">
                    <h2>${price} $</h2>
                    <div class="amount-buttons">
                        <i onclick="decrement(${id})" class="bi bi-dash-circle"></i>
                        <div id=${id} class="amount">
                            ${(search.amount === undefined) ? 0 : search.amount}
                        </div>
                        <i onclick="increment(${id})" class="bi bi-plus-circle"></i>
                    </div>
                    <button onclick="buyMaxQuantity(${id})" class="max-buy-button">Max</button>
                </div>
            </div>
        </div>
        `
    }).join(""));
};

fetchData();

// Method to add an amount of product to the cart
const increment = (id) => {
    const search = basket.find(item => item.id === id);
    const maxAmount = shopItemsData.find(x => x.id === id).quantity;
    
    if(search === undefined && maxAmount > 0){
        basket.push({
            id: id,
            amount: 1
        });
    }else
        search.amount++;

    updateAmount(id);

    localStorage.setItem("basket", JSON.stringify(basket));
};

const buyMaxQuantity = (id) => {
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
}

// Method to decrease an amount of product from the cart or remove a product from the cart
const decrement = (id) => {
    const search = basket.find(item => item.id === id);

    if(search === undefined)
        return;

    if(search.amount > 0)
        search.amount--;

    updateAmount(id);

    basket = basket.filter(x => x.amount !== 0);
    
    localStorage.setItem("basket", JSON.stringify(basket));
}

// Method to update the number shown for a desired product
const updateAmount = (id) => {
    const search = basket.find(item => item.id === id);

    document.getElementById(id).innerHTML = search.amount;

    computeCartAmount();
}

// Method to update the number in the cart icon
const computeCartAmount = () => {
    const cartAmount = document.querySelector('.cart-amount');

    cartAmount.innerHTML = basket.map(x => x.amount).reduce((x,y) => x + y, 0);
};

// Method to search for an item in the products database
const searchItems = async() => {
    try {
        const itemString = `${document.querySelector(".search-bar").value}`;
        if(itemString.length === 0)
            return fetchData();

        const formattedTitle = itemString.split(" ").join("%20");
        const response = await fetch(`http://${ip}:4444/api/products/tsearch/${formattedTitle}`);
        if(!response.ok)
            throw new Error("Error fetching data from database....");

        shopItemsData = await response.json() || [];
        generateShop();
    } catch (error) {
        console.error(error);
    }
}

// Method to generate the navbar based on info extracted from the access token
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

        <div class="search-div">
            <input class="search-bar" type="search" placeholder="Search">
            <button onclick=searchItems() class="search-button">
                <i class="bi bi-search">
                    <div class="tooltip">Search</div>
                </i>
            </button>
            
        </div>
        
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

// Method to logout the client from keycloak
const logoutClient = async() => {
    console.log("Logout clicked...");
    try {
        const client = JSON.parse(window.localStorage.getItem("Client-Info"));
        const refresh_token = client.refresh_token;
        const urlencoded = new URLSearchParams();
        urlencoded.append("refresh_token", refresh_token);
        urlencoded.append("client_id", "frontend-app")
        
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
computeCartAmount();

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

// Call refreshToken() every 2 minutes
setInterval(refreshToken(), 2*60*1000);





