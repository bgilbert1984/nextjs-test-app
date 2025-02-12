// components/modal-video.tsx
"use client";
import React, { useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const ModalVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const openModal = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const closeModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <>
      <button onClick={openModal}>Open Video</button>
      <Transition appear show={true} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <video ref={videoRef} controls width="100%">
                    <source src="/path/to/your/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ModalVideo;