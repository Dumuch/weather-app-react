export enum RoutesList {
    Default = '/',

    SignIn = '/manager/login',
    SignUp = '/manager/sign-up',
    ForgotPwd = '/manager/forgot-pwd',
    ResetPwd = '/manager/reset-pwd',
    Settings = '/manager/settings',

    EmailConfirmation = '/manager/email-confirmation',

    Dashboard = '/manager',
    UserList = '/manager/users',
    // BA_BBS-10
    //Dictionaries = '/manager/dictionary',
    Properties = '/manager/properties',
    Payments = '/manager/payments',
    HelpTopics = '/manager/help-center/topics',
    HelpFAQs = '/manager/help-center/faqs',
}

export enum RoutesListFront {
    SignIn = '/login',
    SignUp = '/registration',
}
