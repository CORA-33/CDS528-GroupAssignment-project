import './App.css';
import { useState } from 'react';
import Web3 from 'web3';
import newContract from './blockchain/newContract';

function App() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [itemIds, setItemIds] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemHistory, setItemHistory] = useState([]);

  const connectHandler = async () => {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);
    setWeb3(web3);
    setAddress(account[0]);
    const contract = newContract(web3);
    setContract(contract); 5 = r
    await loadItems(contract);
    await loadItemIds(contract);
  };

  const loadItems = async (contract) => {
    const itemCount = await contract.methods.itemCount().call();
    const itemsArray = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await contract.methods.getItem(i).call();
      itemsArray.push(item);
    }
    setItems(itemsArray);
  };

  const loadItemIds = async (contract) => {
    try {
      const ids = await contract.methods.getAllItemIds().call();
      console.log("Item IDs list:", ids);
      setItemIds(ids);
    } catch (error) {
      console.error("Failed to load item IDs:", error);
    }
  };

  const loadItemHistory = async (id) => {
    try {
      const history = await contract.methods.getItemHistory(id).call();
      setItemHistory(history);
    } catch (error) {
      console.error("Failed to load item history:", error);
    }
  };

  const listItem = async () => {
    try {
      if (contract && address && itemName && itemPrice) {
        await contract.methods.listItem(itemName, Web3.utils.toWei(itemPrice, 'ether')).send({ from: address });
        setItemName("");
        setItemPrice("");
        await loadItems(contract);
        await loadItemIds(contract);
      }
    } catch (error) {
      console.error("Failed to list item:", error);
    }
  };

  const buyItem = async (id) => {
    try {
      if (contract && address) {
        const item = await contract.methods.getItem(id).call();
        await contract.methods.buyItem(id).send({ from: address, value: item.price });
        await loadItems(contract);
        await loadItemIds(contract);
      }
    } catch (error) {
      console.error("Failed to buy item:", error);
    }
  };

  return (
    <div className="App">
      <div className="card">
        <h1>Second-hand Trading Platform</h1>
        <button onClick={connectHandler}>Connect Wallet</button>
        <h3>Address: {address}</h3>

        <section>
          <h3>List Item</h3>
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Item Price (Ether)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />
          <button onClick={listItem}>List Item</button>
        </section>

        <section>
          <h3>Item List</h3>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                Item ID: {item.id} - {item.name} - {Web3.utils.fromWei(item.price, 'ether')} ETH
                <button onClick={() => buyItem(item.id)}>Buy</button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Item IDs List</h3>
          <ul>
            {itemIds.length > 0 ? (
              itemIds.map((id) => (
                <li key={id}>Item ID: {id}</li>
              ))
            ) : (
              <li>No Item IDs</li>
            )}
          </ul>
        </section>

        <section>
          <h3>Item History</h3>
          <ul>
            {itemHistory.length > 0 ? (
              itemHistory.map((owner, index) => (
                <li key={index}>Owner: {owner}</li>
              ))
            ) : (
              <li>No history</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;