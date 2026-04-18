import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';

const InactiveReminder = () => {
    const { cartItems } = useCart();
    // Only mount if there are items in the cart
    const [lastActive, setLastActive] = useState(Date.now());

    useEffect(() => {
        if (cartItems.length === 0) return;

        const updateActivity = () => setLastActive(Date.now());
        
        // Listen to common interaction events
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('scroll', updateActivity);
        window.addEventListener('click', updateActivity);
        
        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('scroll', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, [cartItems.length]);

    useEffect(() => {
        if (cartItems.length === 0) return;

        const checkInactivity = setInterval(() => {
            const timeInactive = Date.now() - lastActive;
            // 5 minutes of inactivity (300,000 ms)
            if (timeInactive > 300000) {
                toast.custom((t) => (
                    <div className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                      } max-w-sm w-full bg-surface shadow-xl rounded-xl border-l-4 border-primary p-4 pointer-events-auto flex items-center`}>
                        <div className="text-2xl mr-3">☕</div>
                        <div>
                            <p className="font-semibold text-gray-900">Missing your tea break?</p>
                            <p className="text-sm text-gray-600 mt-1">Your cart is waiting 🛒</p>
                        </div>
                    </div>
                ), { duration: 5000, id: 'inactive-reminder' });
                
                // update last active so it doesn't spam
                setLastActive(Date.now());
            }
        }, 60000); // Check every minute

        return () => clearInterval(checkInactivity);
    }, [lastActive, cartItems.length]);

    return null; // This component doesn't render anything directly
};

export default InactiveReminder;
