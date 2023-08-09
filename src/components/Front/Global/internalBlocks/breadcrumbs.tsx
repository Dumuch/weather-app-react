import React, { FunctionComponent } from 'react';
import Link from 'next/link';

export interface BreadCrumb {
    title: string;
    link: string;
}
interface Props {
    list: BreadCrumb[];
}
export const FrontBreadcrumbs: FunctionComponent<Props> = ({ list }) => {
    const length = list.length;
    return (
        <>
            <section className="breadcrumbs-section">
                <div className="container">
                    <ol>
                        {list.map((item, index) => {
                            if (index === length - 1) {
                                return <li key={index}>{item.title}</li>;
                            } else {
                                return (
                                    <li key={index}>
                                        <Link href={item.link} passHref>
                                            <a href={item.link}>{item.title}</a>
                                        </Link>
                                    </li>
                                );
                            }
                        })}
                    </ol>
                </div>
            </section>
        </>
    );
};
