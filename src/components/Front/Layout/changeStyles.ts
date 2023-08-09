const LINK_STYLESHEET_ID = 'custom-PrimeReact-BBS';

const changeStyles = () => {
    const htmlTag = document.getElementsByTagName('html')[0];
    const headTag = document.getElementsByTagName('head')[0];
    const bodyTag = document.getElementsByTagName('body')[0];
    const responsiveStyle = document.querySelector('[href="/assets/css/responsive.css"]');
    const customPrimeReactBBS = document.getElementById(LINK_STYLESHEET_ID);

    // remove global className for Front App
    if (htmlTag && htmlTag.classList.contains('dashboard-style')) {
        htmlTag.classList.remove('dashboard-style');
    }

    // adjusting connection styles
    if (headTag && !customPrimeReactBBS && responsiveStyle) {
        let link = document.createElement('link');
        link.id = LINK_STYLESHEET_ID;
        link.href = '/assets/css/PrimeReact-BBS-theme.css';
        link.rel = 'stylesheet';
        headTag.append(link);
        headTag.append(responsiveStyle);
    }
};

export default changeStyles;
