interface Props {
    sectionTitle: string;
    className?: string;
    children?: React.ReactNode;
}

export const DashboardSection: React.FC<Props> = ({ sectionTitle, className = '', children }) => {
    return (
        <div className={`col-8 ${className}`}>
            <h2>{sectionTitle}</h2>
            {children}
        </div>
    );
};
