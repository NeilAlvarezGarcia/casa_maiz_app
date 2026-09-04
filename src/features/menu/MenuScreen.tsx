import { CmsClient } from '../../api/cmsClient';
import { usePageData } from '../hooks/usePageData';
import { PageScreen } from '../shared/PageScreen';

interface MenuScreenProps {
  client: CmsClient;
}

export function MenuScreen({ client }: MenuScreenProps): JSX.Element {
  const { state, refresh } = usePageData(client, 'menu');

  return (
    <PageScreen
      title="Menú"
      state={state}
      onRefresh={refresh}
      testID="menu-screen"
    />
  );
}
