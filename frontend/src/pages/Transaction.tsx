import React from 'react';
import SideNavigation from '../components/SideNavigation';
import Transaction from '../components/Transaction';

const TransactionPage: React.FC = () => {
  return (
    <SideNavigation configType="with-recent">
      <div className="max-w-6xl mx-auto py-6">
        <Transaction />
      </div>
    </SideNavigation>
  );
};

export default TransactionPage;
