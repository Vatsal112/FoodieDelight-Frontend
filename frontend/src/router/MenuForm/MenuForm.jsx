import React, { useContext, useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { RestaurantContext } from "../../context/RestaurantContext";
import { useMutation, useQueryClient } from "react-query";
import { menuService } from "../../services/Api";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./MenuForm.css";
import { getBase64 } from "../../utils/common";

export const MenuForm = ({ data, closeEditModal }) => {
  const { restaurantsData } = useContext(RestaurantContext);
  const [isLoading, setIsLoading] = useState(false);
  const schema = yup.object().shape({
    restaurantId: yup.string().required("Please Select Restaurant"),
    name: yup.string().required("Dish Name is required"),
    description: yup.string().required("Description is required"),
    price: yup
      .string()
      .matches(/^\d+$/, "price must be a number")
      .required("price is required"),
    preparationTime: yup
      .string()
      .matches(/^\d+$/, "preparation time must be a number")
      .required("preparation time is required"),
    calories: yup
      .string()
      .matches(/^\d+$/, "calories time must be a number")
      .required("calories time is required"),
    ingredients: yup.string().required("ingredients is required"),
    category: yup.string().required("category is required"),
    availability: yup.string().required("availability is required"),
    menuImage: yup
      .mixed()
      .required("Menu image is required")
      .test("fileSize", "The file is too large", (value) => {
        return value && value.size <= 5000000; // 5MB size limit
      })
      .test("fileFormat", "Unsupported format", (value) => {
        return (
          value && ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
        );
      }),
  });

  const queryClient = useQueryClient();

  const createMenuItemMutation = useMutation(menuService.addMenuItem, {
    onSuccess: (data) => {
      if (data.data.data._id && data.data.status === 200) {
        toast.success("Successfully added new menu item!", {
          duration: 2000,
        });
        setIsLoading(false);
        queryClient.invalidateQueries("menu");
      }
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error("Error while creating new menu item", { duration: 2000 });
      console.log(error);
    },
  });

  const editMenuItemMutation = useMutation(menuService.updateMenuItem, {
    onSuccess: (data) => {
      setIsLoading(false);
      if (data.data.data._id && data.data.status === 200) {
        toast.success("Successfully updated restaurant!", {
          duration: 2000,
        });
        queryClient.invalidateQueries("menus");
        closeEditModal();
      }
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.response.data.message, { duration: 2000 });
      console.log(error);
    },
  });

  const addOrEditMenuItem = (values, resetForm) => {
    const reqBody = {
      restaurantId: values.restaurantId,
      name: values.name,
      description: values.description,
      price: parseFloat(values.price),
      category: values.category,
      image: values.menuImageBase64,
      availability: values.availability === "yes" ? true : false,
      preparationTime: values.preparationTime,
      nutritionalInfo: {
        calories: values.calories,
        ingredients: values.ingredients.split(","),
      },
    };
    if (data !== undefined) {
      try {
        setIsLoading(true);
        editMenuItemMutation.mutate({ id: data._id, data: reqBody });
      } catch (error) {
        setIsLoading(false);
        toast.error("Error while updating restaurant");
      }
    } else {
      try {
        createMenuItemMutation.mutate({ ...reqBody });
        resetForm();
      } catch (error) {
        toast.error("Error while creating new menu item");
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="menuFormContainer">
      <Container>
        <section>
          <h1 className="text-secondary text-center mt-4 mb-4">
            {data !== undefined ? "Edit Menu Item" : "Add Menu Item"}
          </h1>
          <Formik
            validationSchema={schema}
            onSubmit={(values, { resetForm }) => {
              setIsLoading(true);
              addOrEditMenuItem(values, resetForm);
            }}
            initialValues={{
              restaurantId: data?.restaurantId || "",
              name: data?.name || "",
              description: data?.description || "",
              price: parseFloat(data?.price) || "",
              preparationTime: data?.preparationTime || "",
              calories: data?.nutritionalInfo?.calories || "",
              ingredients: data?.nutritionalInfo?.ingredients?.join(",") || "",
              category: data?.category || "",
              availability: data?.availability === true ? "yes" : "no" || "",
              menuImage: null,
            }}
          >
            {({
              handleSubmit,
              handleChange,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Row className="g-3" md={2} xs={1}>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Select Restaurant</Form.Label>
                    <Form.Select
                      name="restaurantId"
                      value={values.restaurantId}
                      onChange={handleChange}
                      isInvalid={touched.restaurantId && errors.restaurantId}
                    >
                      <option value="">Please select</option>
                      {restaurantsData.map((data) => (
                        <option value={data?._id} key={data?.id}>
                          {data?.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.restaurantId}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Dish Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      isInvalid={touched.name && errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      isInvalid={touched.description && errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={values.price}
                      onChange={handleChange}
                      isInvalid={touched.price && errors.price}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      isInvalid={touched.category && errors.category}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Is Available?</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        label="Yes"
                        name="availability"
                        value="yes"
                        onChange={handleChange}
                        checked={values.availability.includes("yes")}
                        isInvalid={touched.availability && errors.availability}
                      />
                      <Form.Check
                        type="radio"
                        label="No"
                        name="availability"
                        value="no"
                        checked={values.availability.includes("no")}
                        onChange={handleChange}
                      />
                    </div>
                    {touched.availability && errors.availability && (
                      <div className="text-danger">{errors.availability}</div>
                    )}
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Preparation Time (in mins)</Form.Label>
                    <Form.Control
                      type="number"
                      name="preparationTime"
                      value={values.preparationTime}
                      onChange={handleChange}
                      isInvalid={
                        touched.preparationTime && errors.preparationTime
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.preparationTime}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>Calories </Form.Label>
                    <Form.Control
                      type="number"
                      name="calories"
                      value={values.calories}
                      onChange={handleChange}
                      isInvalid={touched.calories && errors.calories}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.calories}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik01">
                    <Form.Label>
                      Ingredients (
                      <small>Please add comma seperated values</small>)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="ingredients"
                      placeholder="Avocado, Tahini"
                      value={values.ingredients}
                      onChange={handleChange}
                      isInvalid={touched.ingredients && errors.ingredients}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.ingredients}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} controlId="validationFormik10">
                    <Form.Label>Menu Image</Form.Label>
                    <Form.Control
                      type="file"
                      name="menuImage"
                      onChange={async (event) => {
                        const file = event.currentTarget.files[0];
                        setFieldValue("menuImage", file);

                        const base64 = await getBase64(file);
                        setFieldValue("menuImageBase64", base64);
                      }}
                      isInvalid={touched.menuImage && !!errors.menuImage}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.menuImage}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Button type="submit" className="mt-5  mx-auto">
                  {data !== undefined ? "Edit Menu" : "Add Menu"}
                </Button>
              </Form>
            )}
          </Formik>
        </section>
      </Container>
    </div>
  );
};

export default MenuForm;
