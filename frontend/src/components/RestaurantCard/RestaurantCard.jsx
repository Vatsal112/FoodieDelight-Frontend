import React, { useContext, useState } from "react";
import { RestaurantContext } from "../../context/RestaurantContext";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { Container } from "react-bootstrap";
import "./RestaurantCard.css";
import Badge from "../Badge";
import MenuItem from "../MenuItem/MenuItem";
import DeleteModal from "../Modals/DeleteModal";
import { useMutation, useQueryClient } from "react-query";
import { restaurantService } from "../../services/Api";
import toast from "react-hot-toast";
import EditModal from "../Modals/EditRestaurantModal";
import RestaurantForm from "../../router/RestaurantForm";

export const RestaurantCard = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteRestaurantMutation = useMutation(
    restaurantService.deleteRestaurant,
    {
      onSuccess: (data) => {
        if (data.data.status === 200) {
          setShowModal(false);
          toast.success("Restaurant Deleted!", { duration: 2000 });
          navigate("/");
          queryClient.invalidateQueries("restaurants");
        }
      },
      onError: (error) => {
        toast.error("Error while delete restaurant", { duration: 2000 });
        console.log(error);
      },
    }
  );

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteRestaurant = () => {
    try {
      deleteRestaurantMutation.mutate(restaurant._id);
    } catch (error) {
      toast.error("Error while delete restaurant");
    }
  };
  const { restaurantsData, isLoading, isError } = useContext(RestaurantContext);
  const restaurant = restaurantsData.find((r) => r._id === id);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading data</div>;
  if (!restaurant) return <div>Restaurant not found</div>;
  return (
    <div className="restroWrapper">
      <Container>
        <div className="mt-3 d-flex flex-wrap gap-3 justify-content-end">
          <div
            className="rounded-3 bg-warning p-3"
            onClick={() => setShowEditModal(true)}
          >
            <i className="fa-regular fa-pen-to-square fs-3 cursorPointer"></i>
          </div>
          <div className="rounded-3 bg-warning p-3" onClick={handleOpenModal}>
            <i className="fa-solid fa-trash-can fs-3 cursorPointer"></i>
          </div>
        </div>
        <section className="retroContainer">
          <div className="restroImage">
            {/*eslint-disable-next-line jsx-a11y/img-redundant-alt*/}
            <img
              src={restaurant?.image}
              alt="restaurant Image"
              className="rounded-3"
            />
          </div>
          <div className="restroDetails bg-body-tertiary rounded-3">
            <h1 className="text-center text-danger text-bold">
              {restaurant.name}
            </h1>
            <p>{restaurant.description}</p>
            <b>
              Operation Hours:{" "}
              <span>
                {restaurant.operatingHours.openTime} -{" "}
                {restaurant.operatingHours.closeTime}
              </span>
            </b>
            <p>
              <b>Address: </b>
              <span>{`${restaurant.location.address} ${restaurant.location.city}, ${restaurant.location.state}, ${restaurant.location.zipCode}`}</span>
            </p>
            <p>
              <b>Contact: </b>
              <span>{restaurant.contact.phone}</span>
            </p>
            <p>
              <b>Email: </b>
              <span>{restaurant.contact.email}</span>
            </p>
            <div className="d-flex gap-2">
              <Badge data={restaurant.categories} />
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-center">Menu Items</h2>
          <MenuItem restaurantId={id} />
        </section>
        <DeleteModal
          show={showModal}
          handleClose={handleCloseModal}
          title="Delete restaurant"
          body="Are you sure you want to delete?"
          onDelete={handleDeleteRestaurant}
        />
        <EditModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          title="Edit Restaurant"
          body={
            <RestaurantForm
              data={restaurant}
              closeEditModal={() => setShowEditModal(false)}
            />
          }
        />
      </Container>
    </div>
  );
};

export default RestaurantCard;
