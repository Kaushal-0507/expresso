import React from "react";
import UserTable from "./userTable";
import PostTable from "./postTable";

const ReportPage = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Report</h1>
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Users</h2>
        <UserTable />
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Posts</h2>
        <PostTable />
      </div>
    </div>
  );
};

export default ReportPage;
