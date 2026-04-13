import React from 'react';
import TabScene from '../../components/layout/TabScene';

const RewardScreen = () => {
  return (
    <TabScene
      eyebrow="REWARD HUB"
      title="Keep reward history readable and focused."
      description="This tab now has the same safe-area and bottom-tab behavior as the rest of the app, so the content no longer feels detached from the navigation shell."
      metrics={[
        { label: 'Available Rewards', value: '128 APC' },
        { label: 'Claim Window', value: 'Today' },
        { label: 'APR Boost', value: '+4.6%' },
      ]}
      cardTitle="Claim Timing"
      cardBody="Reward actions are framed inside a dedicated card with balanced margins, which gives the screen a clearer hierarchy and leaves room for future list content."
    />
  );
};

export default RewardScreen;
