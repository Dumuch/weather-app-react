import { FC } from 'react';
import { FrontStaticImage } from '../../Global/staticImage';

interface Props {
    icon: string;
    value: string | number;
    caption: string;
}

const StatisticsBlock: FC<Props> = ({ icon, value, caption }) => {
    return (
        <div className="item">
            <FrontStaticImage wrapperClassName="icon" src={icon} width={64} height={64} />
            <div className="content">
                <div className="stat-value">{value}</div>
                <div className="caption">{caption}</div>
            </div>
        </div>
    );
};

export default StatisticsBlock;
