const CourseDetail = ({
  label,
  style,
  detail,
}: {
  label: string;
  style?: string;
  detail: string | null;
}) => {
  return (
    <div className="my-5">
      <p className="text-[#333333] font-bold">{label}:</p>
      <p className={`text-slate-600 ${style}`}>{detail}</p>
    </div>
  );
};

export default CourseDetail;
