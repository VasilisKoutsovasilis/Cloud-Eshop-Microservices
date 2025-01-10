const productGrid = document.getElementById("product-grid");
const navbar = document.getElementById("navbar");
const ip = "localhost";

let shopItemsData = [];

//Method to fetch Item data from the products backend
const fetchProductData = async() => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "seller"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    try {
        const response = await fetch(`http://${ip}:4444/api/products/usersearch/${clientInfo.username}`);

        if(!response.ok)
            throw new Error("Error while fetching products from database...");

        shopItemsData = await response.json();
        generateProducts();
    } catch (error) {
        console.error(error);
    }
};

// Method to generate the page with the products that are available to the client for purchase
const generateProducts = () => {
    if(shopItemsData.length !== 0){
        return (productGrid.innerHTML = shopItemsData.map(x => {
            const { id, title, img, price, quantity, username } = x;
            return `
            <div class="product-item" id="product-id-${id}">
                <img src="${img}">

                <div class="product-details">
                    <div class="name-delete">
                        <h3>${title}</h3>
                        <i onclick="deleteProduct(${id})" class="bi bi-trash"></i>
                    </div>
                    
                    <div class="price-field">
                        <label for="price">Price:</label>
                        <input  class="price-update" type="textbox" name="Price" placeholder="${price} $" id="product-${id}-price">
                    </div>
                    <div class="quantity-field">
                        <label for="quantity">Quantity:</label>
                        <input  class="quantity-update" type="textbox" name="Quantity" placeholder="${quantity}" id="product-${id}-quantity">
                    </div>
                </div>
                <button onclick="updateProduct(${id})" class="update-btn">Update Product</button>
            </div>`;
        }).join(""));
    }else{
        productGrid.innerHTML = `
        <div>
            <h2>Products Database is Empty</h2>
        </div>
        `;
    }
};

fetchProductData();

// Method to update the price and quantity of a product
const updateProduct = async(id) => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "seller"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    try {
        const search = shopItemsData.find(x => x.id === id);
        const priceValue = document.querySelector(`#product-${id}-price`).value.trim() || search.price;
        const quantityValue = document.querySelector(`#product-${id}-quantity`).value.trim() || search.quantity;

        if(parseInt(priceValue) < 0 || parseInt(quantityValue) < 0)
            return alert("Please input only positive integer values for price and quantity...");
        
        const updateObject = {
            price: priceValue,
            quantity: quantityValue
        };

        const response = await fetch(`http://${ip}:4444/api/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateObject),
        });
        
        if(!response.ok)
            throw new Error(`Error while updating product with ID:${id}...`);

        alert("Update was successful!");

        fetchProductData();
    } catch (error) {
        console.error(error);
    }
    
};

// Method to delete a product from the database
const deleteProduct = async(id) => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "seller"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    try {
        console.log(id)
        const response = await fetch(`http://${ip}:4444/api/products/${id}`, {
            method: "DELETE"
        });

        if(!response.ok)
            throw new Error("Error while deleting product from database...");

        
        fetchProductData();
    } catch (error) {
        console.error(error);
    }
};

// Method to add a new product to the database
const addNewProduct = async() => {
    const clientInfo = JSON.parse(window.localStorage.getItem("Client-Info"));
    if(!clientInfo || clientInfo.user_role !== "seller"){
        alert(`User with role: ${clientInfo.user_role} is prohibited from accessing products...`);
        return;
    }
    try {
        const titleInp = document.getElementById("product-title-in").value.trim();
        const imgInp = document.getElementById("product-image-in").files[0];
        const priceInp = parseInt(document.getElementById("prod-price-in").value);
        const quantityInp = parseInt(document.getElementById("prod-quantity-in").value);
    
        if(!titleInp || !imgInp || priceInp === "" || quantityInp === "")
            return alert("Please Enter all fields to register a product!");
    
        if(Number.isNaN(priceInp) || Number.isNaN(quantityInp)){
            document.getElementById("prod-price-in").value = "";
            document.getElementById("prod-quantity-in").value = "";
            return alert("Please Enter Only Positive Integer values in Price and Quantity Fields!");
        }

        if(priceInp < 0 || quantityInp < 0){
            document.getElementById("prod-price-in").value = "";
            document.getElementById("prod-quantity-in").value = "";
            return alert("Please Enter Only Positive Integer values in Price and Quantity Fields!");
        }

        const formData = new FormData();
        formData.append("title", titleInp);
        formData.append("img", imgInp);
        formData.append("price", priceInp);
        formData.append("quantity", quantityInp);
        formData.append("username", clientInfo.username);

        const response = await fetch(`http://${ip}:4444/api/products`, {
            method: "POST",
            body: formData,
        });

        if(!response.ok)
            throw new Error("Error while registering product to database...");

        document.getElementById("product-title-in").value = "";
        document.getElementById("product-image-in").value = null;
        document.getElementById("prod-price-in").value = "";
        document.getElementById("prod-quantity-in").value = "";

        alert("New Product Registered Successfully!");

        fetchProductData();
    } catch (error) {
        console.error(error);
    }

};

// Method to refresh the user token
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

// Method to generate the navbar based on the client info from the access token
const generateNavbar = () => {
    const clientInfo = JSON.parse(localStorage.getItem("Client-Info"));

    if(!clientInfo){
        window.location.replace(`http://${ip}:7777/index.html`);
        return;
    }
    return (navbar.innerHTML = `
        <a class="shop-title" href="products.html">
            <h2>Electronics-shop</h2>
        </a>

        <h2>My Products</h2>
        
        <div class="userInfo">
            <p class="username" id="username">${clientInfo.username}</p>
            <i class="bi bi-person-circle">
                <div class="tooltip">${clientInfo.user_role}</div>
            </i>
        </div>

        <div class="product-buttons">
            <a href="./products.html">
                <i class="bi bi-box-seam">
                    <div class="tooltip">My Products</div>
                </i>
            </a>
    
            <i onclick="logoutClient()" class="bi bi-box-arrow-right">
                <div class="tooltip">Logout</div>
            </i>
        </div>
            
        </div>
    `);
};

generateNavbar();

// Method to logout the client from keycloak
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

// Every 2 minutes refresh the token
setInterval(refreshToken(), 2*60*1000);