import Address from "./address";
import Orders from "./orders";

const Dash = ({ user }) => {
  return (
    <>
      <Orders user={user} />
      <Address user={user} />
    </>
  );
};

export default Dash;
