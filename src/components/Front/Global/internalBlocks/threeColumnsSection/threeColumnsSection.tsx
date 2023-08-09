import { FC, ReactNode } from 'react';

interface Props {
    title: string;
    children: ReactNode;
}

export const FrontThreeColumnsSection: FC<Props> = ({ title, children }) => {
    return (
        <section className="content-section large-padding-top large-padding-bottom">
            <div className="container">
                <h2 className="mb-big text-center">{title}</h2>
                <div className="items-listing three-cols custom-covered-listing">
                    <div className="inner-wrap">{children}</div>
                </div>
            </div>
        </section>
    );
};
