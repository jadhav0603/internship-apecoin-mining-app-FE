import React from 'react';
import TabScene from '../../components/layout/TabScene';

const ProfileScreen = () => {
  return (
    <TabScene
      eyebrow="PROFILE SETTINGS"
      title="Keep account controls in the same visual system."
      description="Profile is now rendered inside the tab navigator instead of a raw placeholder view, which keeps spacing, safe areas, and bottom navigation behavior consistent."
      metrics={[
        { label: 'Security Score', value: '92 / 100' },
        { label: 'Devices Online', value: '03' },
        { label: 'Backup Status', value: 'Synced' },
      ]}
      cardTitle="Account Readiness"
      cardBody="KYC status, security actions, and preference modules can now slot into a structured profile layout without fighting the header or tab bar placement."
    />
  );
};

export default ProfileScreen;
