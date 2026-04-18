import { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isFirstVisitModalOpen, setIsFirstVisitModalOpen] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('sadbhavna_visited');
    if (!hasVisited) {
      // Delay showing the first visit modal slightly for better UX
      const timer = setTimeout(() => {
        setIsFirstVisitModalOpen(true);
        localStorage.setItem('sadbhavna_visited', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const closeFirstVisitModal = () => setIsFirstVisitModalOpen(false);

  return (
    <UIContext.Provider
      value={{
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        isFirstVisitModalOpen,
        closeFirstVisitModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
