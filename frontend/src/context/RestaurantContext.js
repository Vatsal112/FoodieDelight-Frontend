import { createContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { restaurantService } from "../services/Api";

export const RestaurantContext = createContext({
  restaurantsData: [],
  isLoading: false,
  isError: "",
});

export const RestaurantProvider = ({ children }) => {
  const [restaurantsData, setRestaurantsData] = useState([]);
  const {
    data: restaurants,
    isLoading,
    isError,
  } = useQuery("restaurants", restaurantService.getAll, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (restaurants && restaurants.data && restaurants.data.data) {
      setRestaurantsData(restaurants.data.data);
    }
  }, [restaurants]);

  return (
    <RestaurantContext.Provider value={{ restaurantsData, isLoading, isError }}>
      {children}
    </RestaurantContext.Provider>
  );
};
