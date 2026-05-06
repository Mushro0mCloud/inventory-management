import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './Components/Modal.js';
import DeleteModal from './Components/DeleteModal.js';
import CreationModal from './Components/CreationModal.js';
import EditModal from './Components/EditModal.js';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const apiBase = process.env.REACT_APP_API_URL || '';
  const [items, setItems] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsDeleteModalOpen(false);
    setIsCreationModalOpen(false);
    setIsEditModalOpen(false);
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
    setIsEditModalOpen(false);
  };

  const closeDeleteModal = () => {
    setSelectedItem(null);
    setIsDeleteModalOpen(false);
  };

  const openCreationModal = () => {
    setIsCreationModalOpen(true);
    setIsDeleteModalOpen(false);
    setIsModalOpen(false);
    setIsEditModalOpen(false);
  }
  const closeCreationModal = () => {
    setIsCreationModalOpen(false);
  }
  
  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
    setIsCreationModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsModalOpen(false);
  }

  const closeEditModal = () => {
    setSelectedItem(null);
    setIsEditModalOpen(false);
  }

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`${apiBase}/items/${selectedItem.item_id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete item');
      }
      setItems(prevItems => prevItems.filter(i => i.item_id !== selectedItem.item_id));
      setFetchError(null);
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      setFetchError('Unable to delete item.');
    }
  };

  const confirmCreation = async (newItem) => {
    try {
      const response = await fetch(`${apiBase}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item');
      }

      setItems(prevItems => [...prevItems, data]);
      setFetchError(null);
      closeCreationModal();
    } catch (error) {
      console.error('Error creating item:', error);
      setFetchError('Unable to add new item.');
    }
  }

  const confirmEdit = async (updatedItem) => {
    try {      
      const response = await fetch(`${apiBase}/items/${updatedItem.item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }
      
      setItems(prevItems => prevItems.map(i => i.item_id === updatedItem.item_id ? data : i));
      setFetchError(null);
      closeEditModal();
    } catch (error) {
      console.error('Error updating item:', error);
      setFetchError('Unable to update item.');
    }
  }

  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    fetch(`${apiBase}/time`).then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, [apiBase]);

  useEffect(() => {
    fetch(`${apiBase}/items`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setFetchError(null);
        } else {
          console.error('Unexpected items payload:', data);
          setItems([]);
          setFetchError('Could not load item list from server.');
        }
      })
      .catch(error => {
        console.error('Error fetching items:', error);
        setItems([]);
        setFetchError('Error fetching items from API.');
      });
  }, []);

  const itemArray = Array.isArray(items) ? items : [];
  const totalPages = Math.max(1, Math.ceil(itemArray.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = itemArray.slice(startIndex, endIndex);

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
        {fetchError && <p style={{ color: 'salmon' }}>{fetchError}</p>}
        {isCreationModalOpen && <CreationModal closeModal={closeCreationModal} onConfirm={confirmCreation} />}
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
          <Modal item={selectedItem} closeModal={closeModal} openDeleteModal={openDeleteModal} openEditModal={openEditModal} />
        )}
        {isDeleteModalOpen && selectedItem && (
          <DeleteModal item={selectedItem} closeModal={closeDeleteModal} onConfirm={confirmDelete} />
        )}
        {isEditModalOpen && selectedItem && (
          <EditModal
            item={selectedItem}
            closeModal={closeEditModal}
            onSave={confirmEdit}
          />
        )}
        <div>
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span> Page {currentPage} of {totalPages} </span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
          <input type="number" min="1" max={totalPages} value={currentPage} onChange={e => {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
              setCurrentPage(page);
            }
          }} />
        </div>
        <p>The current time is {currentTime}</p>
      </header>
    </div>
  );
}

export default App;
