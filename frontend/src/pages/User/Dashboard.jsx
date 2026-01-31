import React from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/auth";

const Dashboard = () => {
  const [auth] = useAuth();
  const gold = "#D4AF37";

  return (
    <Layout title={"Dashboard - Gopi Nath Collection"}>
      <div className="container-flui m-3 p-3">
        <div className="row">
          <div className="col-md-3">
          </div>
          <div className="col-md-9">
            <div className="card w-75 p-3 shadow border-0">
              <h3 style={{ color: gold, fontFamily: "serif" }}>User Details</h3>
              <hr />
              <div className="mb-2">
                <strong>Name: </strong> {auth?.user?.name}
              </div>
              <div className="mb-2">
                <strong>Email: </strong> {auth?.user?.email}
              </div>
              <div className="mb-2">
                <strong>Contact: </strong> {auth?.user?.phone}
              </div>
              <div className="mb-2">
                <strong>Address: </strong> {auth?.user?.address}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;