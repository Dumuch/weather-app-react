export const paths = {
    users: 'users',
    settings: 'settings',
    dictionary: 'dictionary',
    properties: 'properties',
    payments: 'payments',
    helpTopics: 'help-center/topics',
    helpQuestions: 'help-center/faq',
    helpRequest: 'help-center/help-request',
    stripe: 'stripe',
    states: 'states',
    reviews: 'reviews',
    reservations: 'reservations',
    dataDump: 'data-dump',
    messages: 'messages',
    files: 'files',
};

const apiRoutes = {
    users: {
        list: `/${paths.users}`,
        item: (id: string) => `/${paths.users}/${id}`,
        itemCognito: (cognitoId: string) => `/${paths.users}/cognito/${cognitoId}`,
        forgotPassword: (key: string) => `/${paths.users}/${key}/reset-pwd`,
    },

    settings: {
        list: `/${paths.settings}`,
        serviceFee: `/${paths.settings}/service-fee`,
    },

    dictionary: {
        list: `/${paths.dictionary}`,
    },

    properties: {
        list: `/${paths.properties}`,
        names: `/${paths.properties}/names`,
        item: (id: string) => `/${paths.properties}/${id}`,
        updateCalendar: (propertyId: string, id: string) => `/${paths.properties}/${propertyId}/update-calendar/${id}`,
        deleteCalendar: (propertyId: string, id: string) => `/${paths.properties}/${propertyId}/delete-calendar/${id}`,
        available: `/${paths.properties}/available`,
        selected: `/${paths.properties}/selected`,
    },

    payments: {
        list: `/${paths.payments}`,
        item: (id: string) => `/${paths.payments}/${id}`,
    },

    helpTopics: {
        list: `/${paths.helpTopics}`,
        item: (id: string) => `/${paths.helpTopics}/${id}`,
    },
    helpQuestions: {
        list: `/${paths.helpQuestions}`,
        listOpen: `/${paths.helpQuestions}/open`,
        item: (id: string) => `/${paths.helpQuestions}/${id}`,
    },
    helpRequest: {
        list: `/${paths.helpRequest}`,
    },
    stripe: {
        intent: `/${paths.stripe}/create-payment-intent`,
        card: `/${paths.stripe}/card`,
        account: `/${paths.stripe}`,
    },

    states: {
        list: `/${paths.states}`,
    },

    reviews: {
        available: `/${paths.reviews}/available`,
        selected: `/${paths.reviews}/selected`,
        byProperty: (propertyId: string) => `/${paths.reviews}/by-property/${propertyId}`,
        reviewGuest: `/${paths.reviews}/reviewGuest`,
        reviewProperty: `/${paths.reviews}/reviewProperty`,
    },
    reservations: {
        list: `/${paths.reservations}`,
        bids: `/${paths.reservations}/bids`,
        unreadBids: `/${paths.reservations}/bids/unread-bids`,
        activeBids: `/${paths.reservations}/bids/has-active`,
        item: (id: string) => `/${paths.reservations}/${id}`,
        bid: (id: string) => `/${paths.reservations}/bids/${id}`,
        decline: (id: string) => `/${paths.reservations}/${id}/decline`,
        declineBid: (id: string) => `/${paths.reservations}/bids/${id}/decline`,
        approveBid: (id: string) => `/${paths.reservations}/bids/${id}/approve`,
        claim: (id: string) => `/${paths.reservations}/${id}/claim`,
        refund: (id: string) => `/${paths.reservations}/${id}/request-refund`,
        approve: (id: string) => `/${paths.reservations}/${id}/approve`,
        cancel: (id: string) => `/${paths.reservations}/${id}/cancel`,
        cancelBid: (id: string) => `/${paths.reservations}/bids/${id}/cancel`,
        confirmedGuestStatus: `/${paths.reservations}/confirmed-guest-status`,
    },
    dataDump: {
        getDump: `/${paths.dataDump}`,
        createDump: `/${paths.dataDump}/create`,
    },
    messages: {
        listByReservation: (id: string) => `/${paths.messages}/${id}`,
        unreadMessages: `/${paths.messages}/unread`,
        list: `/${paths.messages}`,
        chat: `/${paths.messages}/chat`,
    },
    files: {
        item: (src: string, identity: string) => `/${paths.files}/${identity}?src=${src}`,
    },
};

export default apiRoutes;
