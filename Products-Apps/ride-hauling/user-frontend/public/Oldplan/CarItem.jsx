import React from 'react';
const CarRenderer = () => {
  const items = [{}, {}];
  const showItems = () => {
    return items.map((item, i) => {
      return (
        <div key={i} className="col-sm-6 col-lg-3 col-md-4 mobiles">
          <a class="boxclose" id="btn-${i}-boxclose"></a>
          <div className="product-list-box thumb ">
            <a href="#" className="image-popup" title="Screenshot-1">
              <img
                src="public/assets/images/products/big/2.png"
                className="thumb-img"
                alt="work-thumbnail"
              />
            </a>

            <div className="product-action"></div>
            <div className="cars-info">
              <h4 className="mt-0 text-center">
                <a href="" className="text-dark">
                  Range Rover
                </a>{' '}
              </h4>
            </div>

            <button
              style={{ margin: '0px auto' }}
              id="btn-5"
              className="btn btn-primary waves-effect waves-light cd-add-to-cart js-cd-add-to-cart car-select "
              data-id="btn-5"
              data-type="car-select"
              data-price="1000"
              data-type="car"
              data-carmodel="Range Rover"
              data-image="public/assets/images/products/big/2.png"
              data-id="1"
            >
              Select
            </button>

            <button className="btn btn-primary waves-effect waves-light w-md reset-cars">
              Cancle
            </button>
          </div>
          <div className="overlay-plan-cars" id="btn-5-plan">
            <a href="#" className="icon" title="User Profile">
              <i className="fa fa-check"></i>
            </a>
          </div>
        </div>
      );
    });
  };

  return <div>{showItems()}</div>;
};

export default CarRenderer;
