import React, {createContext, useEffect, useState} from "react";
import all_product from '../Components/Assets/Frontend_Assets/all_product'


export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
    }
    return cart;
}
export const ShopContextProvider = (props) => {

    const [all_product,setAll_Product] = useState([])
    const [cartItems, setCartItems] = useState(getDefaultCart())

    

    // const getCart = async () => {
    //     const token = localStorage.getItem("token");
        
    //     fetch("http://localhost:4000/getcart", {
    //       method: "GET",
    //       headers: {
    //         "Authorization": `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     })
    //       .then((res) => res.json())
    //       .then((data) => console.log(data))
    //       .catch((err) => console.error("Error fetching cart:", err));
    // };
    
    
    useEffect(() => {
        const fetchProductsAndCart = async () => {
            try {
                const response = await fetch("http://localhost:4000/allproducts");
                const data = await response.json();
                setAll_Product(data);
    
                if (localStorage.getItem("auth-token")) {
                    fetch("http://localhost:4000/getcart", {
                        method: "POST",
                        headers: {
                            Accept:"application/form-data",
                            'auth-token': `${localStorage.getItem("auth-token")}`,
                            "Content-Type": "application/json",
                        },
                        body:"",
                    })
                    .then((res) => res.json())
                    .then((data) => setCartItems(data))
                    .catch((err) => console.error("Error fetching cart:", err));
                  
                } else {
                    console.error("No auth token found! User might not be logged in.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchProductsAndCart();
    }, []);
    

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    
        if (localStorage.getItem("auth-token")) {    
            fetch("http://localhost:4000/addtocart", {
               method: "POST",
               headers: {
                   Accept:'application/form-data',
                   'auth-token': `${localStorage.getItem("auth-token")}`,
                   "Content-Type": "application/json",
                   
               },
               body: JSON.stringify({ "itemId": itemId }),
            })
            .then((res)=>res.json())
            .then((data)=>console.log(data))
        }
    };
    

    const removeFromCart = (itemId)=> {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart',{
                method:'POST',
                headers:{
                    Accept:'application/json',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((res)=>res.json())
            .then((data)=>console.log(data))
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = all_product?.find((product) => product.id === Number(item)); // Ensure correct type
                if (itemInfo) { // Check if item exists
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };
    const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
            if (cartItems[item]>0) {
                totalItem += cartItems[item];
            }
        }
        return totalItem;
    }

    const contextValue = { 
        getTotalCartItems, 
        getTotalCartAmount, 
        all_product, 
        cartItems, 
        addToCart, 
        removeFromCart, 
        //getCart  ✅ Now `getCart` is accessible everywhere
    };

    return(
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}
