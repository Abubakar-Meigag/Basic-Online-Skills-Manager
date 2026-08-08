import { useCallback, useEffect, useState } from "react";
import CYFStaffTable from "../../components/CYFStaffTable/CYFStaffTable";

const CYFStaffDashboard = () => {
  const [courses, setCourses] = useState({});

  const getCourses = useCallback(async () => {
    try {
      const res = await fetch(
        "https://bosm-backend.trainees.hosting.cyf.academy/course-pipeline",
      );
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  return (
    <div className="request-pipeline">
      <div className="flex justify-between mt-10 mb-20 mx-12">
        <h2 className="text-3xl font-bold text-[#333333]">Request Pipeline</h2>
      </div>
    </div>
  );
};

export default CYFStaffDashboard;
