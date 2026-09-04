import { CmsClient } from '../../api/cmsClient';
import { usePageData } from '../hooks/usePageData';
import { PageScreen } from '../shared/PageScreen';

interface ReservationsScreenProps {
  client: CmsClient;
}

export function ReservationsScreen({
  client,
}: ReservationsScreenProps): JSX.Element {
  const { state, refresh } = usePageData(client, 'reservations');

  return (
    <PageScreen
      title="Reservaciones"
      state={state}
      onRefresh={refresh}
      testID="reservations-screen"
    />
  );
}
