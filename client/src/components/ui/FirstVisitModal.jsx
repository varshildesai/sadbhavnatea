import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

const FirstVisitModal = () => {
  const { isFirstVisitModalOpen, closeFirstVisitModal } = useUI();
  const navigate = useNavigate();
  // Ensure we only render when mounted to prevent hydration errors if SSR was used, though this is Vite.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isFirstVisitModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeFirstVisitModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-white/50 relative"
            >
              <button
                onClick={closeFirstVisitModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 z-10 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-primary p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
                
                <h3 className="text-3xl font-bold text-white mb-2 relative z-10">
                  🎉 Welcome to <br/> Sadbhavna Tea!
                </h3>
                <p className="text-primary-light font-medium text-lg relative z-10">
                  Get 10% OFF on your first order
                </p>
                
                <div className="mt-6 bg-white/20 backdrop-blur-md rounded-xl p-4 inline-block border border-white/30 relative z-10">
                  <p className="text-xs text-white/80 uppercase tracking-widest mb-1">Use Code</p>
                  <p className="font-mono text-2xl font-bold text-white tracking-widest">TEA10</p>
                </div>
              </div>

              <div className="p-6 bg-surface text-center">
                <p className="text-gray-600 mb-6 font-medium">Ready to start your premium tea journey?</p>
                <button
                  onClick={() => {
                    closeFirstVisitModal();
                    navigate('/products');
                  }}
                  className="w-full py-3 px-6 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                >
                  Shop Now
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FirstVisitModal;
