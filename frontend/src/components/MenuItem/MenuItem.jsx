import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { menuService } from "../../services/Api";
import { Card, Col, Row } from "react-bootstrap";
import Badge from "../Badge";
import { Badge as BootstrapBadge } from "react-bootstrap";
import "./MenuItem.css";
import DeleteModal from "../Modals/DeleteModal";
import toast from "react-hot-toast";
import EditModal from "../Modals/EditRestaurantModal";
import MenuForm from "../../router/MenuForm";

export const MenuItem = ({ restaurantId }) => {
  const { data: menus, isError } = useQuery(
    ["menus", restaurantId],
    () => menuService.getMenuByRestaurant(restaurantId),
    { refetchOnWindowFocus: false }
  );
  const deleteMenuItemMutation = useMutation(menuService.deleteMenuItem, {
    onSuccess: (data) => {
      if (data.data.status === 200) {
        toast.success("Menu Item Deleted!", { duration: 2000 });
        queryClient.invalidateQueries("menus");
        setDeleteModalShow(false);
      }
    },
    onError: (error) => {
      toast.error("Error while delete menu item", { duration: 2000 });
      console.log(error);
    },
  });

  const queryClient = useQueryClient();

  const [isDeleteModalShow, setDeleteModalShow] = useState(false);
  const [isEditModalShow, setEditModalShow] = useState(false);
  const [menuItem, setMenuItem] = useState();
  if (isError) return <div>Error loading data</div>;
  if (menus?.data?.message === "No data found" || menus?.length === 0) {
    return <h4 className="text-center">No menus available</h4>;
  }

  const handleOpenModal = (menuItem) => {
    setMenuItem(menuItem);
    setDeleteModalShow(true);
  };

  const handleOpenEditModal = (menuItem) => {
    setMenuItem(menuItem);
    setEditModalShow(true);
  };

  const handleDeleteMenuItem = () => {
    try {
      deleteMenuItemMutation.mutate(menuItem?._id);
    } catch (error) {
      toast.error("Error while delete restaurant");
    }
  };

  return (
    <>
      <Row xs={1} md={2} lg={3} className="g-4 mt-4 mb-4">
        {menus?.data?.data?.map((menu, idx) => (
          <Col key={idx}>
            <Card className="card">
              <Card.Img
                variant="top"
                src={menu?.image}
                width={300}
                height={300}
              />
              <Card.Body>
                <Card.Title className="text-danger text-bold fs-3">
                  {menu.name}
                </Card.Title>
                <Card.Text className="fst-italic">{menu.description}</Card.Text>
                <Card.Text>
                  <b>Category:</b>{" "}
                  <BootstrapBadge bg="primary">{menu.category}</BootstrapBadge>
                </Card.Text>
                <Card.Text>
                  <b>Preparation Time:</b>{" "}
                  <BootstrapBadge bg="success">
                    {menu.preparationTime} mins
                  </BootstrapBadge>
                </Card.Text>
                <Card.Text>
                  <b>Calories:</b>{" "}
                  <BootstrapBadge bg="secondary">
                    {menu.nutritionalInfo.calories}
                  </BootstrapBadge>
                </Card.Text>

                <div className="d-flex flex-wrap gap-2 mb-4">
                  <b>Ingredients:</b>{" "}
                  <Badge data={menu.nutritionalInfo.ingredients} />
                </div>
                <Card.Text className="text-bold fs-4">
                  <b>Price: ${menu.price}</b>
                </Card.Text>
                <Card.Footer className="text-center d-flex justify-content-center gap-3 p-3">
                  <div onClick={() => handleOpenEditModal(menu)}>
                    <i className="fa-regular fa-pen-to-square fs-3 cursorPointer"></i>
                  </div>
                  <div onClick={() => handleOpenModal(menu)}>
                    <i className="fa-solid fa-trash-can fs-3 cursorPointer"></i>
                  </div>
                </Card.Footer>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <DeleteModal
        show={isDeleteModalShow}
        handleClose={() => setDeleteModalShow(false)}
        title="Delete Menu Item"
        body="Are you sure you want to delete?"
        onDelete={handleDeleteMenuItem}
      />
      <EditModal
        show={isEditModalShow}
        handleClose={() => setEditModalShow(false)}
        title="Edit Restaurant"
        body={
          <MenuForm
            data={menuItem}
            closeEditModal={() => setEditModalShow(false)}
          />
        }
      />
    </>
  );
};

export default MenuItem;
