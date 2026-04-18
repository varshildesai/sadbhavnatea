import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUI } from './UIContext';
import { showAddToCartToast } from '../utils/toastHelpers';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { openCartDrawer } = useUI();
  const { user } = useAuth();
  
  const cartKey = `sadbhavna_cart_${user?._id || 'guest'}`;

  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // When user signs in/out, the cartKey changes. We update the cart state.
  useEffect(() => {
    const loadCart = async () => {
      let activeItems = [];
      if (user && user._id) {
        try {
          const res = await fetch('https://sadbhavna-api.onrender.com/api/cart', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}` }
          });
          const data = await res.json();
          if (res.ok) {
            const backendItems = data.items || [];
            const localSaved = localStorage.getItem('sadbhavna_cart_guest');
            const localItems = localSaved ? JSON.parse(localSaved) : [];
            
            if (backendItems.length === 0 && localItems.length > 0) {
               activeItems = localItems;
               // Clear guest cart after taking its items
               localStorage.setItem('sadbhavna_cart_guest', '[]');
            } else {
               activeItems = backendItems;
            }
          }
        } catch(e) {
          console.error('Failed to load cart from DB', e);
        }
      } else {
        const saved = localStorage.getItem(cartKey);
        if (saved) {
          try {
            activeItems = JSON.parse(saved);
          } catch(e) {}
        }
      }

      setCartItems(activeItems.map(item => ({
        ...item, 
        cartItemId: item.cartItemId || `${item._id || item.product}-${item.selectedVariant || 'base'}`
      })));
      setIsLoaded(true);
    };
    
    setIsLoaded(false);
    loadCart();
  }, [user?._id, cartKey]);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Save to local storage for quick cache
    localStorage.setItem(cartKey, JSON.stringify(cartItems));

    // Sync back to db if user logged in
    if (user && user._id) {
      fetch('https://sadbhavna-api.onrender.com/api/cart/sync', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}`
         },
         body: JSON.stringify({ items: cartItems })
      }).catch(console.error);
    }
  }, [cartItems, cartKey, user, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    let isNew = false;
    let isUpdated = false;
    const itemIdentifier = product.selectedVariant || 'base';
    // _id from Product schema will map to `product` field in Cart schema later if needed
    const productId = product._id || product.product; 
    const cartItemId = `${productId}-${itemIdentifier}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        isUpdated = true;
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      isNew = true;
      return [...prev, { ...product, product: productId, quantity, cartItemId }];
    });

    setTimeout(() => {
      if (isUpdated) toast.success(`Updated ${product.name} quantity in cart!`, { id: `cart-${product._id}` });
      else if (isNew) {
        showAddToCartToast(product);
        openCartDrawer();
      }
    }, 10);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
