import { FC } from 'react';
import { Badge } from 'primereact/badge';
import { MenuItem, MenuItemOptions } from 'primereact/menuitem';
import { delimitString } from '../../../../../../../utils/helpers';

interface Props {
    item: MenuItem;
    options: MenuItemOptions;
    badgeColor: string;
}

const CustomMenuItemTemplate: FC<Props> = ({ item, options, badgeColor }) => {
    return (
        <a className={options.className} target={item.target} onClick={options.onClick} title={item.label}>
            <Badge style={{ backgroundColor: badgeColor }} className="mr-3" />
            <span className={options.labelClassName}>{delimitString(item.label ?? '', 10)}</span>
        </a>
    );
};

export default CustomMenuItemTemplate;
