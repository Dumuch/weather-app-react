import Link from 'next/link';
import LogoSvg from '../../../../public/assets/img/logo.svg';
import { FrontStaticImage } from '../Global/staticImage';
import { FrontRoutesList } from '../Pages/FrontRoutesList';
import { appConfig } from '../../../config/app';

const Footer = () => {
    return (
        <>
            <footer id="footer">
                <div className="footer-top">
                    <div className="container">
                        <div className="footer-brand">
                            <Link href="/">
                                <a>
                                    <FrontStaticImage
                                        src={LogoSvg}
                                        alt="logo"
                                        layout="responsive"
                                        width={322}
                                        height={46}
                                    />
                                </a>
                            </Link>
                        </div>
                        <div className="footer-nav">
                            <div className="site-nav">
                                <ul>
                                    <li>
                                        <Link href={FrontRoutesList.AboutUs}>
                                            <a>About Us</a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={FrontRoutesList.ComingSoon}>
                                            <a>press</a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={FrontRoutesList.HelpRequest}>
                                            <a>contact us</a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={FrontRoutesList.SafetyAndResponsibility}>
                                            <a>safety &amp; responsibility</a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={FrontRoutesList.HelpRequest}>
                                            <a>help center</a>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="social-share">
                                <ul>
                                    <li>
                                        <Link href={appConfig.facebookLink}>
                                            <a target={'_blank'}>
                                                <span className="fab fa-facebook-square"></span>
                                            </a>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={appConfig.instagramLink}>
                                            <a target={'_blank'}>
                                                <span className="fab fa-instagram"></span>
                                            </a>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <div className="terms">
                            <span>
                                <Link href={FrontRoutesList.TermsAndConditions}>
                                    <a>Terms &amp; Conditions</a>
                                </Link>
                            </span>
                            <span>
                                <Link href={FrontRoutesList.PrivacyPolicy}>
                                    <a>Privacy Policy</a>
                                </Link>
                            </span>
                        </div>
                        <div className="copyright">
                            <span>&copy;&nbsp;2022 BidBookStay.com</span>
                            <span>All rights reserved</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
