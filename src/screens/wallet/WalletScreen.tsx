import React from 'react';
import TabScene from '../../components/layout/TabScene';

const WalletScreen = () => {
  return (
    <TabScene
      eyebrow="WALLET OVERVIEW"
      title="Track balances with cleaner spacing."
      description="The wallet tab now sits inside the same production-ready shell as home, with stable padding above the content and a real persistent tab bar below."
      metrics={[
        { label: 'Spot Balance', value: '$14,280' },
        { label: 'Cold Storage', value: '62%' },
        { label: 'Pending Swaps', value: '04' },
      ]}
      cardTitle="Allocation Snapshot"
      cardBody="BTC, ETH, and ApeCoin positions are grouped into a single summary card so the screen reads like a finished dashboard instead of a placeholder route."
    />
  );
};

export default WalletScreen;
