import { IPanel } from '../../../../pages/manager/settings';
import { DashBoardPanel } from '../../dashboard/Panel';

type Props = Pick<IPanel, 'settings'>;

const SettingsPanel: React.FC<Props> = ({ settings }) => {
    return <DashBoardPanel>{settings.map((Setting) => Setting.component)}</DashBoardPanel>;
};

export default SettingsPanel;
