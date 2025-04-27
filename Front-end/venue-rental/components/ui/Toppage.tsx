"use client";

export default function Toppage() {
  return (
    <div className="relative hidden md:block">

      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Book and Rent Event Venues Effortlessly
        </h1>
        <p className="text-md md:text-lg text-white max-w-2xl">
          Seamlessly connect with venue owners and bring your events to life
          with ease.
        </p>
      </div>
    </div>
  );
}
