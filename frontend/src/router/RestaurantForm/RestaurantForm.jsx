import React, { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import { useMutation, useQueryClient } from "react-query";
import { restaurantService } from "../../services/Api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./RestaurantForm.css";
import { convertTo24HourFormat, getBase64 } from "../../utils/common";

export const RestaurantForm = ({ data, closeEditModal }) => {
  //Form Validations
  const schema = yup.object().shape({
    restaurantName: yup.string().required("Restaurant name is required"),
    description: yup.string().required("Description is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    contact: yup
      .string()
      .matches(/^\d+$/, "Contact must be a number")
      .required("Contact is required"),
    city: yup.string().required("City is required"),
    address: yup.string().required("Address is required"),
    state: yup.string().required("State is required"),
    zip: yup.string().required("Zip code is required"),
    categories: yup.array().min(1, "Select at least one category"),
    openFrom: yup.string().required("Please select opening time"),
    openTo: yup.string().required("Please select closing time"),
    restroImage: yup
      .mixed()
      .required("Restaurant image is required")
      .test("fileSize", "The file is too large", (value) => {
        return value && value.size <= 5000000; // 5MB size limit
      })
      .test("fileFormat", "Unsupported format", (value) => {
        return (
          value && ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
        );
      }),
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  //add a restaurant
  const createRestaurantMutation = useMutation(
    restaurantService.addRestaurant,
    {
      onSuccess: (data) => {
        setIsLoading(false);
        if (data.data.data._id && data.data.status === 200) {
          toast.success("Successfully added new restaurant!", {
            duration: 2000,
          });
          queryClient.invalidateQueries("restaurants");
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast.error("Error while creating new restaurant", { duration: 2000 });
        console.log(error);
      },
    }
  );

  //edit a  restaurant
  const editRestaurantMutation = useMutation(
    restaurantService.updateRestaurant,
    {
      onSuccess: (data) => {
        setIsLoading(false);
        if (data.data.data._id && data.data.status === 200) {
          toast.success("Successfully updated restaurant!", {
            duration: 2000,
          });
          queryClient.invalidateQueries("restaurants");
          closeEditModal();
          navigate(`/restaurant/${data?.data?.data?._id}`);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast.error(error.response.data.message, { duration: 2000 });
        console.log(error);
      },
    }
  );
  const addOrEditRestaurantHandler = (values, resetForm) => {
    const reqBody = {
      name: values.restaurantName,
      description: values.description,
      location: {
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zip,
      },
      contact: {
        email: values.email,
        phone: values.contact,
      },
      image: values.restroImageBase64,
      categories: values.categories,
      operatingHours: {
        openTime: values.openFrom,
        closeTime: values.openTo,
      },
    };
    if (data !== undefined) {
      //edit
      try {
        setIsLoading(true);
        editRestaurantMutation.mutate({ id: data._id, data: reqBody });
        resetForm();
      } catch (error) {
        setIsLoading(false);
        toast.error("Error while updating restaurant");
      }
    } else {
      //add
      try {
        setIsLoading(true);
        createRestaurantMutation.mutate({ ...reqBody });
      } catch (error) {
        setIsLoading(false);
        toast.error("Error while creating new restaurant");
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={data !== undefined ? "" : "restaurantMenuFormContainer"}>
      <Container>
        <section className="mb-4 mt-5">
          <h1 className="text-secondary text-center mt-4 mb-4">
            {data !== undefined ? "Edit Restaurant" : "Add Restaurant"}
          </h1>

          <Formik
            validationSchema={schema}
            onSubmit={(values, { resetForm }) => {
              addOrEditRestaurantHandler(values, resetForm);
            }}
            initialValues={{
              restaurantName: data?.name || "",
              description: data?.description || "",
              email: data?.contact?.email || "",
              contact: data?.contact?.phone || "",
              city: data?.location?.city || "",
              address: data?.location?.address || "",
              state: data?.location?.state || "",
              zip: data?.location?.zipCode || "",
              categories: data?.categories || [],
              openFrom: data?.operatingHours?.openTime || "",
              openTo: data?.operatingHours?.closeTime || "",
              restroImage: null,
            }}
            validate={(values) => {
              const errors = {};

              // Convert openFrom and openTo to 24-hour format
              const openFrom24 = convertTo24HourFormat(values.openFrom);
              const openTo24 = convertTo24HourFormat(values.openTo);

              if (!values.openFrom) {
                errors.openFrom = "Open From time is required";
              }

              if (!values.openTo) {
                errors.openTo = "Open To time is required";
              }

              if (values.openFrom && values.openTo) {
                if (openFrom24 >= openTo24) {
                  errors.openTo =
                    "Open To time should be greater than Open From time";
                }
                if (openFrom24 === openTo24) {
                  errors.openTo =
                    "Open From and Open To time cannot be the same";
                }
              }

              return errors;
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
                    <Form.Label>Restaurant Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="restaurantName"
                      value={values.restaurantName}
                      onChange={handleChange}
                      isInvalid={
                        touched.restaurantName && errors.restaurantName
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.restaurantName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik02">
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

                  <Form.Group as={Col} md="6" controlId="validationFormik03">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      isInvalid={touched.email && errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik04">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={values.contact}
                      onChange={handleChange}
                      isInvalid={touched.contact && errors.contact}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contact}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik05">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      isInvalid={touched.address && errors.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.address}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik06">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={values.city}
                      onChange={handleChange}
                      isInvalid={touched.city && errors.city}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.city}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik07">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={values.state}
                      onChange={handleChange}
                      isInvalid={touched.state && errors.state}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.state}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik08">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip"
                      value={values.zip}
                      onChange={handleChange}
                      isInvalid={touched.zip && errors.zip}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.zip}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik09">
                    <Form.Label>Categories</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      <Form.Check
                        type="checkbox"
                        label="Italian"
                        name="categories"
                        value="Italian"
                        checked={values.categories.includes("Italian")}
                        onChange={() => {
                          const currentValue = values.categories;
                          if (currentValue.includes("Italian")) {
                            setFieldValue(
                              "categories",
                              currentValue.filter((item) => item !== "Italian")
                            );
                          } else {
                            setFieldValue("categories", [
                              ...currentValue,
                              "Italian",
                            ]);
                          }
                        }}
                        isInvalid={touched.categories && errors.categories}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Pasta"
                        name="categories"
                        value="Pasta"
                        checked={values.categories?.includes("Pasta")}
                        onChange={() => {
                          const currentValue = values.categories;
                          if (currentValue.includes("Pasta")) {
                            setFieldValue(
                              "categories",
                              currentValue.filter((item) => item !== "Pasta")
                            );
                          } else {
                            setFieldValue("categories", [
                              ...currentValue,
                              "Pasta",
                            ]);
                          }
                        }}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Vegetarian"
                        name="categories"
                        value="Vegetarian"
                        checked={values.categories?.includes("Vegetarian")}
                        onChange={() => {
                          const currentValue = values.categories;
                          if (currentValue.includes("Vegetarian")) {
                            setFieldValue(
                              "categories",
                              currentValue.filter(
                                (item) => item !== "Vegetarian"
                              )
                            );
                          } else {
                            setFieldValue("categories", [
                              ...currentValue,
                              "Vegetarian",
                            ]);
                          }
                        }}
                      />
                    </div>
                    {touched.categories && errors.categories && (
                      <div className="text-danger">{errors.categories}</div>
                    )}
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik10">
                    <Form.Label>Restaurant Image</Form.Label>
                    <Form.Control
                      type="file"
                      name="restroImage"
                      onChange={async (event) => {
                        const file = event.currentTarget.files[0];
                        setFieldValue("restroImage", file);

                        const base64 = await getBase64(file);
                        setFieldValue("restroImageBase64", base64);
                      }}
                      isInvalid={touched.restroImage && !!errors.restroImage}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.restroImage}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik11">
                    <Form.Label>Open From</Form.Label>
                    <Form.Select
                      name="openFrom"
                      value={values.openFrom}
                      onChange={handleChange}
                      isInvalid={touched.openFrom && errors.openFrom}
                    >
                      <option value="">Please select</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.openFrom}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} controlId="validationFormik12">
                    <Form.Label>Open To</Form.Label>
                    <Form.Select
                      name="openTo"
                      value={values.openTo}
                      onChange={handleChange}
                      isInvalid={touched.openTo && errors.openTo}
                    >
                      <option value="">Please select</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.openTo}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <Button type="submit" className="mt-5  mx-auto">
                  {data !== undefined ? "Edit Restaurant" : "Add Restaurant"}
                </Button>
              </Form>
            )}
          </Formik>
        </section>
      </Container>
    </div>
  );
};

export default RestaurantForm;
