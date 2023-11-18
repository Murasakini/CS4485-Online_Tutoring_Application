import React from "react";
import Header from "./components/Header";
import UpcomingApmt from "./components/UpcomingApmt"; // Import the UpcomingApmt component
import Body from "./components/Body";

const Home = () => {
  return (
    <React.Fragment>
      <Header title="HOME" />
      <Body content={
        <UpcomingApmt />
      } />
    </React.Fragment>
  );
};

export default Home;
