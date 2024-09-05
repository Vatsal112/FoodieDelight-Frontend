import "./App.css";
import Navigation from "./components/Navigation";

import { Routes, Route } from "react-router-dom";
import Home from "./router/Home";
import RestaurantCard from "./components/RestaurantCard/RestaurantCard";
import RestaurantForm from "./router/RestaurantForm";
import MenuForm from "./router/MenuForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigation />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantCard />} />
        <Route path="add-restaurant" element={<RestaurantForm />} />
        <Route path="add-menu" element={<MenuForm />} />
      </Route>
    </Routes>
  );
}

export default App;
