import { FC } from 'react';

interface Props {
    imageSrc: string;
    imageName?: string;
    title: string;
    leadText: string;
    iconWidth?: number;
    iconHeight?: number;
}

export const FrontThreeColumnsSectionItem: FC<Props> = ({
    imageSrc,
    imageName,
    title,
    leadText,
    iconWidth = 78,
    iconHeight = 75,
}) => {
    return (
        <div className="item">
            <div className="icon mb text-center">
                <img src={imageSrc} alt={imageName} width={iconWidth} height={iconHeight} />
            </div>
            <h3 className="h5-style color-black text-center">{title}</h3>
            <div className="textbox big">
                <p>{leadText}</p>
            </div>
        </div>
    );
};
