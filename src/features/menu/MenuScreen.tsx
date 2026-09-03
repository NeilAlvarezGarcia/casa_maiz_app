import { CmsClient } from '../../api/cmsClient';
import { usePageData } from '../hooks/usePageData';
import { PageScreen } from '../shared/PageScreen';
import { StaleNotice } from '../shared/StaleBanner';

interface MenuScreenProps {
  client: CmsClient;
}

export function MenuScreen({ client }: MenuScreenProps): JSX.Element {
  const { state, refresh } = usePageData(client, 'menu');
  const banner = <StaleNotice state={state} />;

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
