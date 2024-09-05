import React, { useContext } from "react";
import { Card, Col, Row } from "react-bootstrap";

import Badge from "../Badge";
import "./RestaurantList.css";
import LoadingSpinner from "../LoadingSpinner";
import { useNavigate } from "react-router-dom";

import { RestaurantContext } from "../../context/RestaurantContext";

export const RestaurantList = () => {
  const { restaurantsData, isLoading, isError } = useContext(RestaurantContext);
  const navigate = useNavigate();
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading data</div>;

  if (!restaurantsData || restaurantsData.length === 0) {
    return <div>No restaurants available</div>;
  }

  const handleCardClick = (restaurant) => {
    navigate(`/restaurant/${restaurant._id}`);
  };

  return (
    <>
      <Row xs={1} md={3} className="g-4">
        {restaurantsData.map((restaurant, idx) => (
          <Col key={idx}>
            <Card
              className="cardStyle"
              onClick={() => handleCardClick(restaurant)}
            >
              <Card.Img
                variant="top"
                src={restaurant?.image}
                height={300}
                width={150}
              />
              <Card.Body>
                <Card.Title>{restaurant.name}</Card.Title>
                <Card.Text>{restaurant.description}</Card.Text>
                <div className="d-flex gap-2">
                  <Badge data={restaurant.categories} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};
export default RestaurantList;
