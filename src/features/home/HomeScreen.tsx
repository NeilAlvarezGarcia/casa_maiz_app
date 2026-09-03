import { CmsClient } from '../../api/cmsClient';
import { usePageData } from '../hooks/usePageData';
import { PageScreen } from '../shared/PageScreen';
import { StaleNotice } from '../shared/StaleBanner';
import { HomePromotions, FlaggedHomeModules } from './HomeModules';

interface HomeScreenProps {
  client: CmsClient;
}

export function HomeScreen({ client }: HomeScreenProps): JSX.Element {
  const { state, refresh } = usePageData(client, 'home');

  const banner = (
    <>
      <StaleNotice state={state} />
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
