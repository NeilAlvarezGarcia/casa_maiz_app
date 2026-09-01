import React from 'react';
import {CmsClient} from '../../api/cmsClient';
import {usePageData} from '../hooks/usePageData';
import {PageScreen} from '../shared/PageScreen';
import {StaleBanner} from '../shared/StaleBanner';

interface MenuScreenProps {
  client: CmsClient;
}

export function MenuScreen({client}: MenuScreenProps): React.JSX.Element {
  const {state, refresh} = usePageData(client, 'menu');
  const banner =
    state.status === 'success' && state.stale ? (
      <StaleBanner reason={state.staleReason} />
    ) : null;

  return (
    <PageScreen
      title="Menú"
      state={state}
      onRefresh={refresh}
      banner={banner}
      testID="menu-screen"
    />
  );
}
