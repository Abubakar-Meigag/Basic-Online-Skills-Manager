const CourseCount = ({ type, count }: { type: string; count: number }) => {
  return (
    <div className="border border-[#F3F3F3] shadow-sm p-5">
      <p className="mb-2 w-30">{type}</p>
      <p className="text-4xl font-bold">{count}</p>
    </div>
  );
};

export default CourseCount;
