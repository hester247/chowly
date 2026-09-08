import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api";

const imageMap = {
  FinFish:
    "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=80",

  "Grilled Chicken":
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80",

  "Chicken Wings":
    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80",

  "Beef Burger":
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",

  "Pasta Alfredo":
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",

  "Fried Rice & Chicken":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",

  "Amala & Ewedu":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",

  Carbonara:
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",

  "Beef Suya":
    "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=80",

  "Jollof Rice & Chicken":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",

  Redwine:
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",

  Cocktail:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",

  "Zobo Drink":
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",

  Chapman:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",

  "Fresh Orange Juice":
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80",

  "Strawberry Smoothie":
    "https://images.unsplash.com/photo-1553530666-ba11a90a0868?auto=format&fit=crop&w=900&q=80",

  "Bottled Water":
    "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80",
};


function App() {
  const [role, setRole] = useState("customer");

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loadingMenu, setLoadingMenu] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const [payment, setPayment] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState("demo_card");

  const [orders, setOrders] = useState([]);

  const [staff, setStaff] = useState({
    waiters: [],
    chefs: [],
    bartenders: [],
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedChef, setSelectedChef] = useState("");
  const [selectedBartender, setSelectedBartender] =
    useState("");

  const [assigning, setAssigning] = useState(false);
  const [serving, setServing] = useState(false);

  const [showCart, setShowCart] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [complaint, setComplaint] = useState("");
  const [rating, setRating] = useState("2");
  const [ratingComment, setRatingComment] =
    useState("");

  const customerId = 1;
  const restaurantId = 1;
  const waiterId = 1;


  // ==========================================
  // LOAD MENU
  // ==========================================

  useEffect(() => {
    loadMenu();
  }, []);


  // ==========================================
  // LOAD WAITER DATA
  // ==========================================

  useEffect(() => {
    if (role === "waiter") {
      loadOrders();
      loadStaff();
    }

    if (role === "customer") {
      restoreCustomerOrder();
    }
  }, [role]);


  // ==========================================
  // REFRESH ORDER
  // ==========================================

  useEffect(() => {
    if (!currentOrder?.id) return;

    loadOrderDetails(currentOrder.id);

    const interval = setInterval(() => {
      loadOrderDetails(currentOrder.id);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentOrder?.id]);


  // ==========================================
  // LOAD MENU
  // ==========================================

  const loadMenu = async () => {
    try {
      setLoadingMenu(true);
      setError("");

      const response = await fetch(
        `${API_URL}/menu?restaurant_id=${restaurantId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load menu"
        );
      }

      setMenu(data.data || []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load the menu. Please make sure the server is running."
      );
    } finally {
      setLoadingMenu(false);
    }
  };


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  const loadOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/orders?restaurant_id=${restaurantId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load orders"
        );
      }

      setOrders(data.data || []);

      // Clear any old error once the refresh succeeds.
      setError("");
    } catch (err) {
      console.error(
        "Unable to load orders:",
        err
      );

      setError(
        err.message ||
          "Unable to load orders. Please make sure the server is running."
      );
    }
  };


  // ==========================================
  // LOAD STAFF
  // ==========================================

  const loadStaff = async () => {
    try {
      const response = await fetch(
        `${API_URL}/staff?restaurant_id=${restaurantId}`
      );

      const data = await response.json();

      if (data.success) {
        setStaff(
          data.data || {
            waiters: [],
            chefs: [],
            bartenders: [],
          }
        );
      }
    } catch (err) {
      console.error(
        "Unable to load staff:",
        err
      );
    }
  };


  // ==========================================
  // RESTORE CUSTOMER ORDER
  // ==========================================

  const restoreCustomerOrder = async () => {
    try {
      const savedOrderId = localStorage.getItem("chowlyCurrentOrderId");

      if (savedOrderId) {
        await loadOrderDetails(savedOrderId);
        return;
      }

      // If the page was refreshed before the order ID was saved,
      // recover the customer's most recent order from the database.
      const response = await fetch(
        `${API_URL}/orders?restaurant_id=${restaurantId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return;
      }

      const customerOrders = (data.data || [])
        .filter(
          (order) =>
            Number(order.customer_id) ===
            Number(customerId)
        )
        .sort((a, b) => Number(b.id) - Number(a.id));

      if (customerOrders.length > 0) {
        const latestOrder = customerOrders[0];
        localStorage.setItem(
          "chowlyCurrentOrderId",
          String(latestOrder.id)
        );
        await loadOrderDetails(latestOrder.id);
      }
    } catch (err) {
      console.error(
        "Unable to restore customer order:",
        err
      );
    }
  };


  // ==========================================
  // LOAD CUSTOMER ORDER
  // ==========================================

  const loadOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/${orderId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load order"
        );
      }

      const completeOrder = {
        ...data.data.order,
        items: data.data.items || [],
        status_history:
          data.data.status_history || [],
      };

      setOrderDetails(completeOrder);

      setCurrentOrder((previous) => ({
        ...(previous || {}),
        ...completeOrder,
      }));

      // If payment already exists, load it
      if (
        completeOrder.order_status === "paid"
      ) {
        loadPayment(orderId);
      }
    } catch (err) {
      console.error(
        "Unable to load order:",
        err
      );
    }
  };


  // ==========================================
  // LOAD PAYMENT
  // ==========================================

  const loadPayment = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/payments/order/${orderId}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPayment(data.data);
      }
    } catch (err) {
      console.error(
        "Unable to load payment:",
        err
      );
    }
  };


  // ==========================================
  // FILTER MENU
  // ==========================================

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory =
        category === "All" ||
        item.item_type?.toLowerCase() ===
          category.toLowerCase();

      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [menu, category, search]);


  // ==========================================
  // CART CALCULATIONS
  // ==========================================

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );


  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        item.quantity,
    0
  );


  const estimatedWaitTime = cart.length
    ? Math.max(
        ...cart.map(
          (item) =>
            Number(
              item.preparation_time
            ) || 0
        )
      )
    : 0;


  const formatMoney = (amount) =>
    `₦${Number(
      amount || 0
    ).toLocaleString()}`;


  const getItemImage = (name) =>
    imageMap[name] ||
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80";


  // ==========================================
  // CART FUNCTIONS
  // ==========================================

  const addToCart = (item) => {
    setMessage("");
    setError("");

    setCart((previousCart) => {
      const existing =
        previousCart.find(
          (cartItem) =>
            cartItem.id === item.id
        );

      if (existing) {
        return previousCart.map(
          (cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
        );
      }

      return [
        ...previousCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };


  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };


  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };


  const removeFromCart = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    );
  };


  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async () => {
    if (cart.length === 0) {
      setError(
        "Your cart is empty."
      );
      return;
    }

    try {
      setOrderLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customer_id:
              customerId,

            restaurant_id:
              restaurantId,

            waiter_id:
              waiterId,

            items: cart.map(
              (item) => ({
                menu_item_id:
                  item.id,
                quantity:
                  item.quantity,
              })
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to place order"
        );
      }

      const newOrder = {
        id:
          data.data.order_id,

        customer_id:
          data.data.customer_id,

        restaurant_id:
          data.data.restaurant_id,

        order_status:
          data.data.order_status,

        waiting_time:
          data.data.waiting_time,

        total_amount:
          data.data.total_amount,
      };

      setCurrentOrder(
        newOrder
      );

      localStorage.setItem(
        "chowlyCurrentOrderId",
        String(newOrder.id)
      );

      setOrderDetails(
        newOrder
      );

      setPayment(null);

      setCart([]);

      setShowCart(false);

      setMessage(
        `Order #${newOrder.id} has been placed successfully.`
      );

      await loadOrderDetails(
        newOrder.id
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to place order."
      );
    } finally {
      setOrderLoading(false);
    }
  };


  // ==========================================
  // SELECT WAITER ORDER
  // ==========================================

  const selectOrder = async (
    order
  ) => {
    setSelectedOrder(order);

    setSelectedChef(
      order.chef_id || ""
    );

    setSelectedBartender(
      order.bartender_id || ""
    );

    await loadOrderDetailsForWaiter(
      order.id
    );
  };


  const loadOrderDetailsForWaiter =
    async (orderId) => {
      try {
        const response =
          await fetch(
            `${API_URL}/orders/${orderId}`
          );

        const data =
          await response.json();

        if (data.success) {
          const completeOrder = {
            ...data.data.order,
            items:
              data.data.items || [],
            status_history:
              data.data
                .status_history || [],
          };

          setSelectedOrder(
            completeOrder
          );

          setSelectedChef(
            completeOrder.chef_id ||
              ""
          );

          setSelectedBartender(
            completeOrder.bartender_id ||
              ""
          );
        }
      } catch (err) {
        console.error(err);
      }
    };


  // ==========================================
  // ASSIGN STAFF
  // ==========================================

  const assignStaff = async () => {
    if (!selectedOrder)
      return;

    try {
      setAssigning(true);
      setMessage("");
      setError("");

      const response =
        await fetch(
          `${API_URL}/staff/orders/${selectedOrder.id}/assign`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              waiter_id:
                waiterId,

              chef_id:
                selectedChef
                  ? Number(
                      selectedChef
                    )
                  : null,

              bartender_id:
                selectedBartender
                  ? Number(
                      selectedBartender
                    )
                  : null,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to assign staff"
        );
      }

      setMessage(
        "Kitchen staff assigned successfully."
      );

      await loadOrders();

      await loadOrderDetailsForWaiter(
        selectedOrder.id
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to assign staff."
      );
    } finally {
      setAssigning(false);
    }
  };


  // ==========================================
  // MARK SERVED
  // ==========================================

  const markServed = async () => {
    if (!selectedOrder)
      return;

    try {
      setServing(true);
      setMessage("");
      setError("");

      const response =
        await fetch(
          `${API_URL}/staff/orders/${selectedOrder.id}/served`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to mark order as served"
        );
      }

      setMessage(
        `Order #${selectedOrder.id} has been marked as served.`
      );

      await loadOrders();

      await loadOrderDetailsForWaiter(
        selectedOrder.id
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to mark order as served."
      );
    } finally {
      setServing(false);
    }
  };


  // ==========================================
  // ORDER TIME
  // ==========================================

  const getOrderCreatedTime = (
    order
  ) => {
    if (!order) return null;

    const orderDate =
      order.order_date;

    const orderTime =
      order.order_time;

    if (!orderDate) {
      return null;
    }

    let dateString =
      String(orderDate);

    const hasTime =
      dateString.includes("T") ||
      /\d{2}:\d{2}/.test(
        dateString
      );

    if (
      orderTime &&
      !hasTime
    ) {
      const datePart =
        dateString.slice(0, 10);

      dateString =
        `${datePart}T${orderTime}`;
    }

    const parsed =
      new Date(dateString);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return null;
    }

    return parsed;
  };


  // ==========================================
  // DELAY DETECTION
  // ==========================================

  const isOrderDelayed = () => {
    const order =
      currentOrder;

    if (!order) {
      return false;
    }

    if (
      !order.waiting_time ||
      Number(order.waiting_time) <= 0
    ) {
      return false;
    }

    if (
      order.order_status ===
        "served" ||
      order.order_status ===
        "paid"
    ) {
      return false;
    }

    const createdTime =
      getOrderCreatedTime(
        order
      );

    if (!createdTime) {
      return false;
    }

    const elapsedMinutes =
      (
        Date.now() -
        createdTime.getTime()
      ) /
      (1000 * 60);

    return (
      elapsedMinutes >
      Number(order.waiting_time)
    );
  };


  // ==========================================
  // PAYMENT
  // ==========================================

  const openPayment = () => {
    if (
      !currentOrder?.id
    ) {
      return;
    }

    if (
      currentOrder.order_status !==
      "served"
    ) {
      setError(
        "Payment becomes available after your order has been served."
      );

      return;
    }

    setError("");
    setMessage("");
    setShowPayment(true);
  };


  const completePayment =
    async () => {
      if (
        !currentOrder?.id
      ) {
        return;
      }

      try {
        setPaymentLoading(true);
        setError("");
        setMessage("");

        const response =
          await fetch(
            `${API_URL}/payments`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                order_id:
                  currentOrder.id,

                payment_method:
                  paymentMethod,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to complete payment"
          );
        }

        setPayment(
          data.data.payment
        );

        setCurrentOrder(
          (previous) => ({
            ...(previous || {}),
            order_status:
              "paid",
          })
        );

        setOrderDetails(
          (previous) => ({
            ...(previous || {}),
            order_status:
              "paid",
          })
        );

        setShowPayment(
          false
        );

        setMessage(
          "Pretend payment completed successfully."
        );

        await loadOrderDetails(
          currentOrder.id
        );

      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to complete payment."
        );
      } finally {
        setPaymentLoading(
          false
        );
      }
    };


  // ==========================================
  // COMPLAINT
  // ==========================================

  const submitComplaint =
    async () => {
      if (!currentOrder?.id)
        return;

      if (!complaint.trim()) {
        setError(
          "Please describe your complaint."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/feedback/complaints`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                order_id:
                  currentOrder.id,

                complaint_description:
                  complaint,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to submit complaint"
          );
        }

        setComplaint("");

        setMessage(
          "Your complaint has been submitted."
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to submit complaint."
        );
      }
    };


  // ==========================================
  // RATING
  // ==========================================

  const submitRating =
    async () => {
      if (!currentOrder?.id)
        return;

      try {
        const response =
          await fetch(
            `${API_URL}/feedback/ratings`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                order_id:
                  currentOrder.id,

                score:
                  Number(rating),

                rating_comment:
                  ratingComment,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to submit rating"
          );
        }

        setRatingComment("");

        setMessage(
          "Thank you. Your rating has been submitted."
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to submit rating."
        );
      }
    };


  // ==========================================
  // STATUS
  // ==========================================

  const statusLabel = (
    status
  ) => {
    const labels = {
      pending:
        "Order Received",

      preparing:
        "Preparing",

      served:
        "Served",

      paid:
        "Paid",
    };

    return (
      labels[status] ||
      "Order Received"
    );
  };


  const statusClass = (
    status
  ) => {
    if (status === "paid")
      return "status-paid";

    if (status === "served")
      return "status-served";

    if (status === "preparing")
      return "status-preparing";

    return "status-pending";
  };


  const activeOrder =
    orderDetails ||
    currentOrder;

  const currentStatus =
    activeOrder?.order_status ||
    "pending";


  // ==========================================
  // WAITER VIEW
  // ==========================================

  if (role === "waiter") {
    return (
      <div className="chowly-app">

        <header className="waiter-navbar">

          <div className="brand">

            <div className="brand-symbol">
              C
            </div>

            <div>
              <div className="brand-name">
                CHOWLY
              </div>

              <div className="brand-tagline">
                Restaurant Operations
              </div>
            </div>

          </div>

          <button
            className="switch-view-button"
            onClick={() =>
              setRole("customer")
            }
          >
            Customer View
          </button>

        </header>


        <main className="waiter-container">

          <section className="waiter-welcome">

            <div>

              <span className="section-kicker">
                BAMBOO LOUNGE
              </span>

              <h1>
                Restaurant Operations
              </h1>

              <p>
                Keep every order moving
                from kitchen to table.
              </p>

            </div>

            <button
              className="refresh-orders"
              onClick={loadOrders}
            >
              ↻ Refresh Orders
            </button>

          </section>


          {message && (
            <div className="notification success">
              ✓ {message}
            </div>
          )}


          {error && (
            <div className="notification error">
              {error}
            </div>
          )}


          <section className="stats-row">

            <div className="stat-card">
              <span>
                Total Orders
              </span>

              <strong>
                {orders.length}
              </strong>

              <small>
                Today
              </small>
            </div>


            <div className="stat-card">
              <span>
                Preparing
              </span>

              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.order_status ===
                      "preparing"
                  ).length
                }
              </strong>

              <small>
                In the kitchen
              </small>
            </div>


            <div className="stat-card">
              <span>
                Served
              </span>

              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.order_status ===
                        "served" ||
                      order.order_status ===
                        "paid"
                  ).length
                }
              </strong>

              <small>
                Completed service
              </small>
            </div>

          </section>


          <section className="waiter-workspace">

            <div className="orders-column">

              <div className="workspace-title">

                <div>

                  <span className="section-kicker">
                    LIVE ORDERS
                  </span>

                  <h2>
                    Active Orders
                  </h2>

                </div>

                <span className="live-dot">
                  ● Live
                </span>

              </div>


              {orders.length === 0 ? (

                <div className="empty-orders">

                  <div className="empty-orders-icon">
                    🍽
                  </div>

                  <h3>
                    No orders yet
                  </h3>

                  <p>
                    Customer orders will
                    appear here automatically.
                  </p>

                </div>

              ) : (

                <div className="orders-stack">

                  {orders.map(
                    (order) => (

                      <button
                        className={`operations-order ${
                          selectedOrder?.id ===
                          order.id
                            ? "order-selected"
                            : ""
                        }`}
                        key={order.id}
                        onClick={() =>
                          selectOrder(order)
                        }
                      >

                        <div className="operations-order-top">

                          <div>

                            <span className="order-reference">
                              ORDER #{order.id}
                            </span>

                            <h3>
                              {
                                order.customer_first_name
                              }{" "}
                              {
                                order.customer_last_name
                              }
                            </h3>

                          </div>


                          <span
                            className={`status-pill ${statusClass(
                              order.order_status
                            )}`}
                          >
                            {statusLabel(
                              order.order_status
                            )}
                          </span>

                        </div>


                        <div className="operations-order-bottom">

                          <span>
                            ⏱{" "}
                            {order.waiting_time ||
                              0}{" "}
                            min
                          </span>

                          <strong>
                            {formatMoney(
                              order.total_amount
                            )}
                          </strong>

                        </div>

                      </button>

                    )
                  )}

                </div>

              )}

            </div>


            <aside className="management-panel">

              {!selectedOrder ? (

                <div className="management-empty">

                  <div className="management-empty-icon">
                    ←
                  </div>

                  <h2>
                    Select an order
                  </h2>

                  <p>
                    Select an order to view
                    its details and manage
                    preparation.
                  </p>

                </div>

              ) : (

                <>

                  <div className="management-top">

                    <div>

                      <span className="section-kicker">
                        ORDER #{selectedOrder.id}
                      </span>

                      <h2>
                        {
                          selectedOrder.customer_first_name
                        }{" "}
                        {
                          selectedOrder.customer_last_name
                        }
                      </h2>

                    </div>


                    <span
                      className={`status-pill ${statusClass(
                        selectedOrder.order_status
                      )}`}
                    >
                      {statusLabel(
                        selectedOrder.order_status
                      )}
                    </span>

                  </div>


                  <div className="management-block">

                    <h3>
                      Customer Order
                    </h3>


                    {selectedOrder.items?.map(
                      (item) => (

                        <div
                          className="management-food"
                          key={item.id}
                        >

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              ×{" "}
                              {item.quantity}
                            </span>

                          </div>

                          <strong>
                            {formatMoney(
                              item.subtotal
                            )}
                          </strong>

                        </div>

                      )
                    )}

                  </div>


                  <div className="management-total">

                    <span>
                      Order Total
                    </span>

                    <strong>
                      {formatMoney(
                        selectedOrder.total_amount
                      )}
                    </strong>

                  </div>


                  <div className="management-block">

                    <h3>
                      Kitchen Assignment
                    </h3>


                    <label>

                      Chef

                      <select
                        value={
                          selectedChef
                        }
                        onChange={(
                          event
                        ) =>
                          setSelectedChef(
                            event.target
                              .value
                          )
                        }
                      >

                        <option value="">
                          Select a chef
                        </option>

                        {staff.chefs?.map(
                          (chef) => (

                            <option
                              key={
                                chef.id
                              }
                              value={
                                chef.id
                              }
                            >
                              {
                                chef.first_name
                              }{" "}
                              {
                                chef.last_name
                              }
                            </option>

                          )
                        )}

                      </select>

                    </label>


                    <label>

                      Bartender

                      <select
                        value={
                          selectedBartender
                        }
                        onChange={(
                          event
                        ) =>
                          setSelectedBartender(
                            event.target
                              .value
                          )
                        }
                      >

                        <option value="">
                          Select a bartender
                        </option>

                        {staff.bartenders?.map(
                          (
                            bartender
                          ) => (

                            <option
                              key={
                                bartender.id
                              }
                              value={
                                bartender.id
                              }
                            >
                              {
                                bartender.first_name
                              }{" "}
                              {
                                bartender.last_name
                              }
                            </option>

                          )
                        )}

                      </select>

                    </label>


                    <button
                      className="green-action"
                      onClick={
                        assignStaff
                      }
                      disabled={
                        assigning
                      }
                    >
                      {assigning
                        ? "Assigning..."
                        : "Assign Kitchen Staff"}
                    </button>

                  </div>


                  <button
                    className="serve-action"
                    onClick={
                      markServed
                    }
                    disabled={
                      serving ||
                      selectedOrder.order_status ===
                        "served" ||
                      selectedOrder.order_status ===
                        "paid"
                    }
                  >
                    {serving
                      ? "Updating..."
                      : selectedOrder.order_status ===
                          "served" ||
                        selectedOrder.order_status ===
                          "paid"
                      ? "✓ Order Served"
                      : "✓ Mark Order as Served"}
                  </button>

                </>

              )}

            </aside>

          </section>

        </main>

      </div>
    );
  }


  // ==========================================
  // CUSTOMER VIEW
  // ==========================================

  return (
    <div className="chowly-app">

      <header className="customer-navbar">

        <div className="brand">

          <div className="brand-symbol">
            C
          </div>

          <div>

            <div className="brand-name">
              CHOWLY
            </div>

            <div className="brand-tagline">
              Eat. Order. Enjoy.
            </div>

          </div>

        </div>


        <nav className="desktop-nav">

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Home
          </button>


          <button
            onClick={() =>
              document
                .getElementById("menu")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Menu
          </button>


          {currentOrder && (
            <button
              onClick={() =>
                document
                  .getElementById(
                    "my-order"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              My Order
            </button>
          )}

        </nav>


        <div className="navbar-actions">

          {cartCount > 0 && (
            <button
              className="nav-cart"
              onClick={() =>
                setShowCart(true)
              }
            >
              🛒
              <span>
                {cartCount}
              </span>
            </button>
          )}


          <button
            className="waiter-switch"
            onClick={() =>
              setRole("waiter")
            }
          >
            Waiter
          </button>

        </div>

      </header>


      <main>

        {/* ======================================
            HERO
        ====================================== */}

        <section className="unique-hero">

          <div className="hero-inner">

            <div className="hero-copy">

              <div className="hero-badge">
                <span>●</span>
                BAMBOO LOUNGE
              </div>


              <h1>
                Good food.
                <br />
                <em>
                  Without the wait.
                </em>
              </h1>


              <p>
                Your table. Your order.
                Your experience. Discover
                great food, know your wait
                time, and enjoy every moment.
              </p>


              <div className="hero-search">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="What are you craving today?"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    ×
                  </button>
                )}

              </div>


              <button
                className="hero-menu-button"
                onClick={() =>
                  document
                    .getElementById(
                      "menu"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              >
                Explore Menu
                <span>→</span>
              </button>

            </div>


            <div className="hero-visual">

              <div className="hero-image-card">

                <img
                  src={getItemImage(
                    filteredMenu[0]
                      ?.name ||
                      "Bottled Water"
                  )}
                  alt="Featured food"
                />

                <div className="hero-image-overlay">

                  <span>
                    CHEF'S PICK
                  </span>

                  <strong>
                    {filteredMenu[0]
                      ?.name ||
                      "Bottled Water"}
                  </strong>

                </div>

              </div>


              <div className="floating-info-card">

                <span className="floating-icon">
                  ⏱
                </span>

                <div>

                  <small>
                    Average preparation
                  </small>

                  <strong>
                    20–30 mins
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            FEATURES
        ====================================== */}

        <section className="quick-features">

          <div>

            <span>01</span>

            <div>

              <strong>
                Choose your food
              </strong>

              <p>
                Explore our fresh menu.
              </p>

            </div>

          </div>


          <div>

            <span>02</span>

            <div>

              <strong>
                Know your wait
              </strong>

              <p>
                See preparation time
                before ordering.
              </p>

            </div>

          </div>


          <div>

            <span>03</span>

            <div>

              <strong>
                Enjoy your meal
              </strong>

              <p>
                Track your order until
                it's served.
              </p>

            </div>

          </div>

        </section>


        {/* ======================================
            MENU
        ====================================== */}

        <section
          className="menu-section"
          id="menu"
        >

          {message && (
            <div className="notification success">
              ✓ {message}
            </div>
          )}


          {error && (
            <div className="notification error">
              {error}
            </div>
          )}


          <div className="menu-section-heading">

            <div>

              <span className="section-kicker">
                TODAY'S MENU
              </span>

              <h2>
                Something delicious awaits.
              </h2>

              <p>
                Freshly prepared favourites
                from Bamboo Lounge.
              </p>

            </div>


            <span className="menu-count">
              {filteredMenu.length} items
            </span>

          </div>


          <div className="category-tabs">

            <button
              className={
                category === "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory("All")
              }
            >
              All
            </button>


            <button
              className={
                category === "Food"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory("Food")
              }
            >
              🍛 Food
            </button>


            <button
              className={
                category === "Drink"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory("Drink")
              }
            >
              🥤 Drinks
            </button>

          </div>


          {loadingMenu ? (

            <div className="loading-screen">

              <div className="loading-spinner"></div>

              <p>
                Preparing the menu...
              </p>

            </div>

          ) : filteredMenu.length ===
            0 ? (

            <div className="no-results">

              <div>🔎</div>

              <h3>
                No dishes found
              </h3>

              <p>
                Try another search or
                category.
              </p>

            </div>

          ) : (

            <div className="unique-menu-grid">

              {filteredMenu.map(
                (item, index) => (

                  <article
                    className={`unique-food-card ${
                      index === 0
                        ? "featured-food"
                        : ""
                    }`}
                    key={item.id}
                  >

                    <div className="unique-food-image">

                      <img
                        src={getItemImage(
                          item.name
                        )}
                        alt={item.name}
                      />

                      <div className="image-badge">
                        {item.item_type}
                      </div>


                      <button
                        className="food-add"
                        onClick={() =>
                          addToCart(
                            item
                          )
                        }
                      >
                        +
                      </button>

                    </div>


                    <div className="unique-food-details">

                      <div className="food-title-line">

                        <h3>
                          {item.name}
                        </h3>

                        <span className="food-price">
                          {formatMoney(
                            item.price
                          )}
                        </span>

                      </div>


                      <p>
                        {item.description ||
                          "Freshly prepared with quality ingredients."}
                      </p>


                      <div className="food-time">

                        <span>◷</span>

                        Ready in{" "}

                        <strong>
                          {item.preparation_time ||
                            0}{" "}
                          mins
                        </strong>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>


        {/* ======================================
            ORDER TRACKING
        ====================================== */}

        {activeOrder && (

          <section
            className="order-tracking-section"
            id="my-order"
          >

            <div className="tracking-heading">

              <div>

                <span className="section-kicker">
                  YOUR CHOWLY JOURNEY
                </span>

                <h2>
                  Order #{activeOrder.id}
                </h2>

                <p>
                  We're keeping an eye
                  on your order.
                </p>

              </div>


              <span
                className={`status-pill large ${statusClass(
                  currentStatus
                )}`}
              >
                {statusLabel(
                  currentStatus
                )}
              </span>

            </div>


            <div className="tracking-card">

              <div className="tracking-main">

                <div className="tracking-line"></div>


                <div
                  className={`tracking-step ${
                    [
                      "pending",
                      "preparing",
                      "served",
                      "paid",
                    ].includes(
                      currentStatus
                    )
                      ? "done"
                      : ""
                  }`}
                >

                  <div className="tracking-circle">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Order Received
                    </strong>

                    <span>
                      Your order is
                      confirmed.
                    </span>

                  </div>

                </div>


                <div
                  className={`tracking-step ${
                    [
                      "preparing",
                      "served",
                      "paid",
                    ].includes(
                      currentStatus
                    )
                      ? "done"
                      : ""
                  }`}
                >

                  <div className="tracking-circle">
                    🔥
                  </div>

                  <div>

                    <strong>
                      In the Kitchen
                    </strong>

                    <span>
                      Our team is
                      preparing your meal.
                    </span>

                  </div>

                </div>


                <div
                  className={`tracking-step ${
                    [
                      "served",
                      "paid",
                    ].includes(
                      currentStatus
                    )
                      ? "done"
                      : ""
                  }`}
                >

                  <div className="tracking-circle">
                    🍽
                  </div>

                  <div>

                    <strong>
                      Served
                    </strong>

                    <span>
                      Your order has
                      reached your table.
                    </span>

                  </div>

                </div>


                <div
                  className={`tracking-step ${
                    currentStatus ===
                    "paid"
                      ? "done"
                      : ""
                  }`}
                >

                  <div className="tracking-circle">
                    ₦
                  </div>

                  <div>

                    <strong>
                      Payment
                    </strong>

                    <span>
                      Complete payment
                      before leaving.
                    </span>

                  </div>

                </div>

              </div>


              <div className="tracking-summary">

                <div>

                  <span>
                    Estimated wait
                  </span>

                  <strong>
                    {activeOrder.waiting_time ||
                      0}{" "}
                    min
                  </strong>

                </div>


                <div>

                  <span>
                    Order total
                  </span>

                  <strong>
                    {formatMoney(
                      activeOrder.total_amount
                    )}
                  </strong>

                </div>

              </div>


              {/* ==================================
                  DELAY WARNING
              ================================== */}

              {isOrderDelayed() && (

                <div className="delay-card">

                  <div className="delay-symbol">
                    !
                  </div>

                  <div>

                    <strong>
                      Your order is taking
                      longer than expected.
                    </strong>

                    <p>
                      We're sorry about the
                      delay. Please tell us
                      about your experience.
                    </p>

                    <button
                      onClick={() =>
                        setShowFeedback(
                          true
                        )
                      }
                    >
                      Tell us what happened →
                    </button>

                  </div>

                </div>

              )}


              {/* ==================================
                  PAYMENT BUTTON
              ================================== */}

              {currentStatus ===
                "served" && (

                <div className="payment-callout">

                  <div>

                    <span className="section-kicker">
                      READY TO LEAVE?
                    </span>

                    <h3>
                      Complete your payment
                    </h3>

                    <p>
                      Your meal has been
                      served. Please complete
                      payment before leaving
                      the restaurant.
                    </p>

                  </div>


                  <button
                    className="checkout-button"
                    onClick={
                      openPayment
                    }
                  >
                    Pay{" "}
                    {formatMoney(
                      activeOrder.total_amount
                    )}{" "}
                    →
                  </button>

                </div>

              )}


              {/* ==================================
                  PAID CONFIRMATION
              ================================== */}

              {currentStatus ===
                "paid" && (

                <div className="payment-success-card">

                  <div className="payment-success-icon">
                    ✓
                  </div>

                  <div>

                    <span className="section-kicker">
                      PAYMENT COMPLETE
                    </span>

                    <h3>
                      You're all settled.
                    </h3>

                    <p>
                      Thank you for dining
                      with Chowly. Your
                      payment was recorded
                      successfully.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </section>

        )}


        {/* ======================================
            BRAND MESSAGE
        ====================================== */}

        <section className="brand-message">

          <div className="brand-message-mark">
            C
          </div>

          <span className="section-kicker">
            THE CHOWLY PROMISE
          </span>

          <h2>
            Great food deserves
            <br />
            a great experience.
          </h2>

          <p>
            From the moment you place your
            order to the moment your meal
            reaches your table, Chowly keeps
            you informed.
          </p>

        </section>

      </main>


      {/* ========================================
          SMART CART
      ======================================== */}

      {cartCount > 0 && (

        <button
          className="smart-cart"
          onClick={() =>
            setShowCart(true)
          }
        >

          <div className="smart-cart-icon">
            🛒
          </div>

          <div>

            <span>
              Your order
            </span>

            <strong>
              {cartCount}{" "}
              {cartCount === 1
                ? "item"
                : "items"}{" "}
              •{" "}
              {formatMoney(
                cartTotal
              )}
            </strong>

          </div>

          <span className="smart-cart-arrow">
            →
          </span>

        </button>

      )}


      {/* ========================================
          CART DRAWER
      ======================================== */}

      {showCart && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setShowCart(false)
          }
        >

          <div
            className="order-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <span className="section-kicker">
                  BAMBOO LOUNGE
                </span>

                <h2>
                  Your order
                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setShowCart(false)
                }
              >
                ×
              </button>

            </div>


            <div className="drawer-items">

              {cart.map((item) => (

                <div
                  className="drawer-item"
                  key={item.id}
                >

                  <img
                    src={getItemImage(
                      item.name
                    )}
                    alt={item.name}
                  />


                  <div className="drawer-item-content">

                    <h3>
                      {item.name}
                    </h3>

                    <strong>
                      {formatMoney(
                        Number(
                          item.price
                        ) *
                          item.quantity
                      )}
                    </strong>


                    <div className="drawer-quantity">

                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>


                  <button
                    className="drawer-remove"
                    onClick={() =>
                      removeFromCart(
                        item.id
                      )
                    }
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>


            <div className="drawer-footer">

              <div className="drawer-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatMoney(
                    cartTotal
                  )}
                </strong>

              </div>


              <div className="drawer-wait">

                <span>
                  ⏱ Estimated preparation
                </span>

                <strong>
                  {estimatedWaitTime}{" "}
                  minutes
                </strong>

              </div>


              <button
                className="checkout-button"
                onClick={
                  placeOrder
                }
                disabled={
                  orderLoading
                }
              >
                {orderLoading
                  ? "Placing your order..."
                  : "Place My Order →"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================
          PAYMENT MODAL
      ======================================== */}

      {showPayment && (

        <div
          className="modal-backdrop centered"
          onClick={() =>
            setShowPayment(false)
          }
        >

          <div
            className="feedback-modal payment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <span className="section-kicker">
                  ORDER #{currentOrder?.id}
                </span>

                <h2>
                  Complete payment
                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setShowPayment(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            {/* DEMO NOTICE */}

            <div className="demo-payment-notice">

              <div className="demo-payment-icon">
                DEMO
              </div>

              <div>

                <strong>
                  Pretend Payment
                </strong>

                <p>
                  This is a demonstration
                  payment for the Chowly
                  assignment. No real money
                  will be charged.
                </p>

              </div>

            </div>


            <div className="payment-amount">

              <span>
                Amount to pay
              </span>

              <strong>
                {formatMoney(
                  currentOrder?.total_amount
                )}
              </strong>

            </div>


            <div className="feedback-form">

              <label>

                Choose payment method

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target
                        .value
                    )
                  }
                >

                  <option value="demo_card">
                    Demo Card
                  </option>

                  <option value="demo_transfer">
                    Demo Bank Transfer
                  </option>

                  <option value="demo_cash">
                    Demo Cash
                  </option>

                </select>

              </label>


              <button
                className="checkout-button"
                onClick={
                  completePayment
                }
                disabled={
                  paymentLoading
                }
              >
                {paymentLoading
                  ? "Processing demo payment..."
                  : `Pay ${formatMoney(
                      currentOrder?.total_amount
                    )} (Demo) →`}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================
          FEEDBACK MODAL
      ======================================== */}

      {showFeedback && (

        <div
          className="modal-backdrop centered"
          onClick={() =>
            setShowFeedback(
              false
            )
          }
        >

          <div
            className="feedback-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <span className="section-kicker">
                  ORDER #{currentOrder?.id}
                </span>

                <h2>
                  We hear you.
                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setShowFeedback(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <p className="feedback-description">
              We're sorry your order has
              taken longer than expected.
              Your feedback helps us improve
              the Chowly experience.
            </p>


            <div className="feedback-form">

              <label>

                What went wrong?

                <textarea
                  value={
                    complaint
                  }
                  onChange={(event) =>
                    setComplaint(
                      event.target
                        .value
                    )
                  }
                  placeholder="Tell us about the delay..."
                  rows="4"
                />

              </label>


              <button
                className="outline-action"
                onClick={
                  submitComplaint
                }
              >
                Submit Complaint
              </button>


              <div className="form-divider">
                <span>
                  Your rating
                </span>
              </div>


              <label>

                How would you rate
                your experience?

                <select
                  value={
                    rating
                  }
                  onChange={(event) =>
                    setRating(
                      event.target
                        .value
                    )
                  }
                >

                  <option value="1">
                    1 — Very poor
                  </option>

                  <option value="2">
                    2 — Poor
                  </option>

                  <option value="3">
                    3 — Average
                  </option>

                  <option value="4">
                    4 — Good
                  </option>

                  <option value="5">
                    5 — Excellent
                  </option>

                </select>

              </label>


              <label>

                Additional comment

                <textarea
                  value={
                    ratingComment
                  }
                  onChange={(
                    event
                  ) =>
                    setRatingComment(
                      event.target
                        .value
                    )
                  }
                  placeholder="Anything else you'd like us to know?"
                  rows="3"
                />

              </label>


              <button
                className="checkout-button"
                onClick={
                  submitRating
                }
              >
                Submit Rating →
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;