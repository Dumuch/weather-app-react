import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStores } from '../../../../../store';
import SearchBlock from '../SearchBlock';

const DashboardSearchesSection = observer(() => {
    const { userStore } = useStores();
    useEffect(() => {
        userStore.getUserSearches();
    }, [userStore.user?.id]);

    return (
        <div className="main-panel">
            <div className="block-heading mb">
                <h2 className="h4-style title">Saved Searches</h2>
            </div>
            <div className="searches-listing mb-big">
                {userStore.userSearches.items.length > 0 ? (
                    userStore.userSearches.items.map((obSearch) => {
                        return <SearchBlock obSearch={obSearch} key={obSearch.id} />;
                    })
                ) : (
                    <div className="textbox">
                        <p>No items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DashboardSearchesSection;
