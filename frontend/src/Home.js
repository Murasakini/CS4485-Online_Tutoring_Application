import React from "react";
import Header from "./components/Header";
import MenuList from "./components/MenuList";
import UpcomingApmt from "./components/UpcomingApmt"; // Import the UpcomingApmt component

const Home = () => {
  return (
    <div>
      <Header title="HOME" />
      <MenuList />
      <UpcomingApmt />
    </div>
  );
};

export default Home;
