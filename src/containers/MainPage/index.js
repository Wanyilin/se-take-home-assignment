import React, { useState, useEffect } from "react";

const ORDER_STATUS = {
	PENDING: 'PENDING',
	PROCESSING: 'PROCESSING',
	COMPLETE: 'COMPLETE'
};

const BOT_STATUS = {
	IDLE: 'IDLE',
	PROCESSING: 'PROCESSING'
};


const MainPage = () => {
  const [orders, setOrders] = useState([]);
  const [bots, setBots] = useState([]);
  const [orderCount, setOrderCount] = useState(1);


	useEffect(() => {
    const processOrdersInterval = setInterval(() => {
      processOrders();
    }, 1000); // Process orders every second
    return () => clearInterval(processOrdersInterval);
  }, [orders, bots]); // Re-run effect when orders or bots change
	
  const handleNewOrder = (type = '') => {
    const newOrder = {
      id: orderCount,
      type: type,
      status: ORDER_STATUS.PENDING,
			botId: null,
    };
    if (type === 'vip') {
      // Find the index of the first normal order
			const normalOrderIndex = orders.findIndex(order => order.type === 'normal');
			if (normalOrderIndex !== -1) {
				// Insert VIP order before the first normal order
				setOrders(prevOrders => [
					...prevOrders.slice(0, normalOrderIndex),
					newOrder,
					...prevOrders.slice(normalOrderIndex)
				]);
			} else {
				// If no normal order exists, add VIP order at the end
				setOrders(prevOrders => [...prevOrders, newOrder]);
			}
    } else {
      setOrders(prevOrders => [...prevOrders, newOrder]);
    }
    setOrderCount(prevCount => prevCount + 1);
  };

  const handleBotAdd = () => {
    const newBot = {
      id: bots.length + 1,
      status: BOT_STATUS.IDLE,
			orderId: null,
			timerId: null,
    };
    setBots(prevBots => [...prevBots, newBot]);
  };

  const handleBotRemove = () => {
    const lastBotIndex = bots.length - 1;
    const removedBot = bots[lastBotIndex];

    if (removedBot.status === BOT_STATUS.PROCESSING) {
      clearTimeout(removedBot.timerId);
      moveOrderToPending(removedBot.orderId);
    }

    const updatedBots = bots.slice(0, lastBotIndex);
    setBots(updatedBots);
  };

  const processOrders = () => {
    const pendingOrders = orders.filter(order => order.status === ORDER_STATUS.PENDING);
    const idleBots = bots.filter(bot => bot.status === BOT_STATUS.IDLE);

    // Assign pending orders to idle bots
    idleBots.forEach(bot => {
      const botPendingOrders = pendingOrders.filter(order => order.botId === null);
      if (botPendingOrders.length > 0) {
        const orderToProcess = botPendingOrders[0];
        processOrder(orderToProcess, bot);
      }
    });
  };


  const processOrder = (order, bot) => {
    const updatedOrders = orders.map(o =>
			o.id === order.id ? { ...o, status: ORDER_STATUS.PROCESSING, botId: bot.id } : o
		);
		setOrders(updatedOrders);
	
		const orderTimer = setTimeout(() => {
			moveOrderToComplete(order.id, bot.id);
		}, 10000); // Complete order after 10 seconds
	
		const updatedBot = { ...bot, status: BOT_STATUS.PROCESSING, orderId: order.id, timerId: orderTimer };
		setBots(prevBots => prevBots.map(b => (b.id === updatedBot.id ? updatedBot : b)));
  };

  const moveOrderToComplete = (orderId, botId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: ORDER_STATUS.COMPLETE, botId: null } : order
    );
    setOrders(updatedOrders);

    const updatedBots = bots.map(bot => {
      if (bot.id === botId) {
        return { ...bot, status: BOT_STATUS.IDLE, orderId: null, timerId: null };
      }
      return bot;
    });
    setBots(updatedBots);
  };
	const moveOrderToPending = (orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: ORDER_STATUS.PENDING, botId: null } : order
    );
    setOrders(updatedOrders);
  };

  return (
    <div>
      <main className="App-main">
        <div className="order-buttons">
          <button onClick={() => handleNewOrder('normal')}>
            New Normal Order
          </button>
          <button onClick={() => handleNewOrder('vip')}>
            New VIP Order
          </button>
          <button onClick={handleBotAdd}>+ Bot</button>
          <button disabled={bots.length < 1} onClick={handleBotRemove}>- Bot</button>
        </div>
				<div className="orders">
					<div className="order-status">
						<h2>PENDING</h2>
						<ul>
							{orders.filter(order => order.status === ORDER_STATUS.PENDING).map((order) => (
									<li key={order.id}>
										Order {order.id} - {order.type} - {order.status}
									</li>
								)
							)}
						</ul>
					</div>
					<div className="order-status">
						<h2>PROCESSING</h2>
						<ul>
							{orders.filter(order => order.status === ORDER_STATUS.PROCESSING).map((order) => (
								<li key={order.id}>
									Order {order.id} - {order.type} - {order.status}
								</li>
							))}
						</ul>
					</div>
					<div className="order-status">
						<h2>COMPLETE</h2>
						<ul>
							{orders.filter(order => order.status === ORDER_STATUS.COMPLETE).map((order) => (
								<li key={order.id}>
									Order {order.id} - {order.type} - {order.status}
								</li>
							))}
						</ul>
					</div>
				</div>
				<div>
					<h2>Bots</h2>
						<ul>
							{bots.map((bot) => (
									<li key={bot.id}>
										Bot {bot.id} - {bot.status} {bot.status === BOT_STATUS.PROCESSING ? `order: ${bot.orderId}` : ''}
									</li>
								)
							)}
						</ul>
				</div>
      </main>
    </div>
  );
}

export default MainPage;
