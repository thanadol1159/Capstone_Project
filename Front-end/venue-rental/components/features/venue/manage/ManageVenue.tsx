const ManageVenue: React.FC = () => {
  return (
    <div className="max-w-full mx-auto p-6 text-black">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <span className="text-black">Rental Management</span>
        <span className="text-black">&gt;</span>
        <span className="text-gray-900">Add Venue</span>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Venue Type :</span>
          <div className="flex gap-2">
            {/* <button
              className={`px-4 py-2 rounded-md ${
                venueType === "Large Venue"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300"
              }`}
              onClick={() => setVenueType("Large Venue")}
            >
              Large Venue
            </button> */}
            <button className="px-6 py-[2px] rounded-lg border-black border-[1px] bg-white">
              Large Venue
            </button>
            {/* <button
              className={`px-4 py-2 rounded-md ${
                venueType === "Room Space"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300"
              }`}
              onClick={() => setVenueType("Room Space")}
            >
              Room Space
            </button> */}
            <button className="px-6 rounded-lg border-black border-[1px] bg-white">
              Room Space
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Venue Name :</span>
          <input
            type="text"
            placeholder="ex. Home AAA"
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Image :</span>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md">
            Attach File
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Location :</span>
          <input
            type="text"
            placeholder="Paste URL"
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Category :</span>
          <div className="flex gap-2 items-center">
            <select className="p-2 border border-gray-300 rounded-md">
              <option value="">Select</option>
              <option value="party">Party</option>
              <option value="meeting">Meeting</option>
              <option value="conference">Conference</option>
              <option value="wedding">Wedding</option>
            </select>
            {/* {categories.map((category) => (
              <div
                key={category.name}
                className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-md"
              >
                {category.name}
                <button
                  onClick={() => handleRemoveCategory(category.name)}
                  className="ml-1 text-white"
                >
                  ✕
                </button>
              </div>
            ))} */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Capacity :</span>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Price :</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-32 p-2 border border-gray-300 rounded-md"
            />
            <span>Per</span>
            <select className="p-2 border border-gray-300 rounded-md">
              <option value="">Select</option>
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-32 font-medium">Area Size :</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <span>m²</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button className="px-6 py-2 border border-gray-300 rounded-md">
          Cancel
        </button>
        <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md">
          Submit
        </button>
      </div>
    </div>
  );
};

export default ManageVenue;
