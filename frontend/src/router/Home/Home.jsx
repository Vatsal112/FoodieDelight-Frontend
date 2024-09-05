import React from "react";
import RestaurantList from "../../components/RestaurantList/RestaurantList";
import { Container } from "react-bootstrap";
import "./Home.css";

export const Home = () => {
  return (
    <div className="homeContainer">
      <Container>
        <RestaurantList />
      </Container>
    </div>
  );
};

export default Home;
