import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

const HomeScreen = () => {
  const user = useSelector((state) => state.authentication.user);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(typeof user);
    if (typeof user === "undefined" || typeof user.user_id === "undefined") {
      navigate("/login");
    } else {
      navigate("/bid");
    }
  }, []);

  return null; // No UI needed as it's just a redirect
};

export default HomeScreen;
