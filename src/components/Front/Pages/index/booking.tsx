const Booking = () => {
    return (
        <section className="content-section large-padding-top large-padding-bottom">
            <div className="container">
                <h2 className="h4-style text-center">Booking With Us Is Simple</h2>
                <div className="booking-steps">
                    <div className="step">
                        <h3 className="h4-style title mb-half">
                            <span className="number">1</span>Find the perfect place
                        </h3>
                        <div className="textbox big">
                            <p>Search for amazing stays that have everything you need.</p>
                        </div>
                    </div>
                    <div className="arrow">
                        <img src="/assets/img/i-arrow-right-big.svg" alt="image" width={52} height={189} />
                    </div>
                    <div className="step">
                        <h3 className="h4-style title mb-half">
                            <span className="number">2</span>Bid or Book
                        </h3>
                        <div className="textbox big">
                            <p>
                                Once you find your ideal stay you can reserve it for the nightly price, or place a bid
                                to see if you can get your stay at a lower cost!
                            </p>
                        </div>
                    </div>
                    <div className="arrow">
                        <img src="/assets/img/i-arrow-right-big.svg" alt="image" width={52} height={189} />
                    </div>
                    <div className="step">
                        <h3 className="h4-style title mb-half">
                            <span className="number">3</span>Stay!
                        </h3>
                        <div className="textbox big">
                            <p>All you have left to do is enjoy your stay.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Booking;
