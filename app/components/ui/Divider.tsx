export const Divider = () => (
  <div className="relative py-24 overflow-hidden ">
    {/* Center plus */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Vertical line */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-8 bg-indigo-200 -translate-y-1/2" />
      {/* Horizontal line */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-[2px] bg-indigo-200" />
    </div>

    {/* Side lines */}
    <div className="relative top-1/2 -translate-y-1/2 w-full flex justify-between px-12">
      <div className="w-full">
        <div className=" absolute w-8 h-[2px] bg-indigo-200" />
        <div className="absolute h-12 w-[2px] bg-indigo-200 -translate-y-1/2 " />
      </div>

      <div className="relative w-full">
        <div className="absolute w-8 h-[2px] bg-indigo-200 right-0" />
        <div className="absolute h-12 w-[2px] bg-indigo-200 -translate-y-1/2 right-0" />
      </div>
    </div>
  </div>
);
