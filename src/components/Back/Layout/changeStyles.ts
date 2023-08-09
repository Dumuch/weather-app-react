const changeStyle = () => {
    const htmlTag = document.getElementsByTagName('html')[0];
    const linkTags = document.getElementsByTagName('link');
    // adding global className for Dashboard Admin
    if (htmlTag && !htmlTag.classList.contains('dashboard-style')) {
        htmlTag.classList.add('dashboard-style');
    }
    document.querySelectorAll('[data-front]').forEach((el) => el.remove());
    Array.from(linkTags).forEach((element) => {
        if (element.dataset.front) {
            element.remove();
        }
    });
};

export default changeStyle;
