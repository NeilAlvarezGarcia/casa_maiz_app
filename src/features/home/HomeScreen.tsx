import React from 'react';
import {CmsClient} from '../../api/cmsClient';
import {usePageData} from '../hooks/usePageData';
import {PageScreen} from '../shared/PageScreen';
import {StaleBanner} from '../shared/StaleBanner';
import {HomePromotions, FlaggedHomeModules} from './HomeModules';

interface HomeScreenProps {
  client: CmsClient;
}

export function HomeScreen({client}: HomeScreenProps): React.JSX.Element {
  const {state, refresh} = usePageData(client, 'home');

  const banner = (
    <>
      {state.status === 'success' && state.stale ? (
        <StaleBanner reason={state.staleReason} />
      ) : null}
      <HomePromotions />
      <FlaggedHomeModules />
    </>
  );

  return (
    <PageScreen
      title="Inicio"
      state={state}
      onRefresh={refresh}
      banner={banner}
      testID="home-screen"
    />
  );
}
