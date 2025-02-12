import React from 'react';

const Hero: React.FC = () => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Illustration behind hero content */}
        <div className="absolute left-0 bottom-0 -ml-20 hidden lg:block pointer-events-none" aria-hidden="true">
          <svg className="max-w-full" width="564" height="552" viewBox="0 0 564 552" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="illustration-02" x1="-3.766" y1="300.204" x2="284.352" y2="577.921" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5D5DFF" stopOpacity=".01" />
                <stop offset="1" stopColor="#5D5DFF" stopOpacity=".32" />
              </linearGradient>
            </defs>
            <circle cx="300.5" cy="300.5" r="300.5" fill="url(#illustration-02)" fillOpacity=".32" />
          </svg>
        </div>
        {/* Hero content */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="text-center pb-12 md:pb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4">Your Title Here</h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-400 mb-8">Your subtitle or description here.</p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div>
                  <a className="btn text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0" href="#0">Get started</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;