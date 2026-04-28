import React from 'react';
import SideNavigation from '../components/SideNavigation';
import TransactionWizard from '../components/TransactionWizard';

const TransactionWizardPage: React.FC = () => {
  return (
    <SideNavigation configType="with-recent">
      <div className="max-w-6xl mx-auto py-6">
        <TransactionWizard />
      </div>
    </SideNavigation>
  );
};

export default TransactionWizardPage;
