// Standard navbar configurations for consistency across all pages

export const NAVBAR_CONFIG = {
  // Standard navigation buttons available on most pages
  STANDARD: {
    showViewProducts: true,
    showNewTransaction: true,
    showAddProduct: true, // Will only show for admin users
    showRecentTransactions: false,
  },
  
  // Pages that don't need Recent Transactions button
  WITHOUT_RECENT: {
    showViewProducts: true,
    showNewTransaction: true,
    showAddProduct: true,
    showRecentTransactions: false,
  },
  
  // Pages with Recent Transactions button
  WITH_RECENT: {
    showViewProducts: true,
    showNewTransaction: true,
    showAddProduct: true,
    showRecentTransactions: true,
  }
} as const;

// Helper function to get navbar config for a specific page
export const getNavbarConfig = (page: 'standard' | 'without-recent' | 'with-recent' = 'standard') => {
  switch (page) {
    case 'without-recent':
      return NAVBAR_CONFIG.WITHOUT_RECENT;
    case 'with-recent':
      return NAVBAR_CONFIG.WITH_RECENT;
    default:
      return NAVBAR_CONFIG.STANDARD;
  }
};
