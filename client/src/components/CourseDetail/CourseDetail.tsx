const CourseDetail = ({
  label,
  detail,
}: {
  label: string;
  detail: string | null;
}) => {
  return (
    <div>
      <p>{label}</p>
      <p>{detail}</p>
    </div>
  );
};

export default CourseDetail;
