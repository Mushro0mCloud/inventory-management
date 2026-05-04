import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './Components/Modal.js';
import DeleteModal from './Components/DeleteModal.js';
import CreationModal from './Components/CreationModal.js';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsDeleteModalOpen(false);
    setIsCreationModalOpen(false);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(false);
    setIsDeleteModalOpen(true);
    setIsCreationModalOpen(false);
  };

  const closeDeleteModal = () => {
    setSelectedItem(null);
    setIsDeleteModalOpen(false);
  };

  const openCreationModal = () => {
    setIsCreationModalOpen(true);
    setIsDeleteModalOpen(false);
    setIsModalOpen(false);
  }
  const closeCreationModal = () => {
    setIsCreationModalOpen(false);
  }

  const confirmDelete = () => {
    if (!selectedItem) return;
    setItems(prevItems => prevItems.filter(i => i.item_id !== selectedItem.item_id));
    closeDeleteModal();
  };

  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    fetch('/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  useEffect(() => {
    fetch('/items').then(res => res.json()).then(data => {
      setItems(data);
    }).catch(error => console.error('Error fetching items:', error));
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={openCreationModal}>Add New Item</button>
        {isCreationModalOpen && <CreationModal closeModal={closeCreationModal} />}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.item_id}>
                <td>{item.item_id}</td>
                <td>{item.item_name}</td>
                <td>{item.item_price}</td>
                <td>{item.item_amt}</td>
                <td><button onClick={() => openModal(item)}>View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {isModalOpen && selectedItem && (
          <Modal item={selectedItem} closeModal={closeModal} openDeleteModal={openDeleteModal} />
        )}
        {isDeleteModalOpen && selectedItem && (
          <DeleteModal item={selectedItem} closeModal={closeDeleteModal} onConfirm={confirmDelete} />
        )}
        <div>
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span> Page {currentPage} of {totalPages} </span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
        <p>The current time is {currentTime}</p>
      </header>
    </div>
  );
}

export default App;
