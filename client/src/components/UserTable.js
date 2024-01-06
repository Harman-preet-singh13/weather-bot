import { useEffect, useState } from "react";
import axios from "axios";

export default function UserTable() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    async function fetchData() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/subscriptions"
        );
        const data = response.data;
  
        const subscriptionsData = data.subscriptions || [];
  
        setSubscriptions(subscriptionsData);
        console.log(data);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  
    useEffect(() => {
      fetchData();
      setIsLoading(false);
    }, []);
  
    const handleDelete = async (id) => {
      try {
        console.log(id);
        await axios.delete(`http://localhost:3000/api/subscriptions/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    const handleBlock = async (chatId) => {
      try {
        // Call your API endpoint to block the user
        await axios.post(
          `http://localhost:3000/api/subscriptions/block/${chatId}`
        );
        fetchData(); // Refresh the subscription list after blocking
      } catch (error) {
        console.error("Error blocking user:", error);
      }
    };
  
    return (
      <div className="container">
        <header className="">
          <h1 className="text-3xl font-semibold">Admin Panel</h1>
        </header>
  
        <div className="user-container">
          <h2 className="text-xl font-semibold my-2">User Information</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Chat ID</th>
                <th>User Name</th>
                <th>Subscribed City</th>
                <th>Block User</th>
                <th>Delete User</th>
              </tr>
            </thead>
  
            <tbody>
              {isLoading ? (
                <>Loading Data...</>
              ) : (
                <>
                  {subscriptions.length > 0 ? (
                    subscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td>{subscription.id}</td>
                        <td>{subscription.chatId}</td>
                        <td>{subscription.userName}</td>
                        <td>{subscription.city}</td>
                        <td>
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleBlock(subscription.id)}
                          >
                            {subscription.blocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                        <td>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(subscription.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No subscriptions available</td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
}
