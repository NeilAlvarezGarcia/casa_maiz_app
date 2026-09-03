import { CmsClient } from '../../api/cmsClient';
import { usePageData } from '../hooks/usePageData';
import { PageScreen } from '../shared/PageScreen';
import { StaleNotice } from '../shared/StaleBanner';

interface ReservationsScreenProps {
  client: CmsClient;
}

export function ReservationsScreen({
  client,
}: ReservationsScreenProps): JSX.Element {
  const { state, refresh } = usePageData(client, 'reservations');
  const banner = <StaleNotice state={state} />;

  return (
    <PageScreen
      title="Reservaciones"
      state={state}
      onRefresh={refresh}
      banner={banner}
      testID="reservations-screen"
    />
  );
}
