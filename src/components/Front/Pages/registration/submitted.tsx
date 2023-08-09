import React, { FunctionComponent } from 'react';

const RegistrationSectionSubmitted: FunctionComponent = () => {
    return (
        <section className="content-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1 indent-left indent-right">
                        <h1 className="h2-style">Sign up</h1>
                        <div className="alert alert-success" role="alert">
                            <p>A confirmation message has been sent to your registered email address.</p>
                            <p>
                                Please follow the instructions in the email to activate your account. Once you have
                                activated your account, you will be able to sign in to the website.
                            </p>
                            <p>If you did not receive the confirmation email, please check your junk mailbox.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default RegistrationSectionSubmitted;
