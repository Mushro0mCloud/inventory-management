import React from 'react';
import './Modal.css';

function Modal({ item, closeModal, openDeleteModal }) {
  return (
    <div className='modalBackground'>
      <div className='modalContainer'>
        <div className='titleCloseBtn'>
          <button onClick={closeModal}>X</button>
        </div>
        <div className='title'>
          <h1>Product Details</h1>
        </div>
        <div className='body'>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{item.item_id}</td>
                <td>{item.item_name}</td>
                <td>{item.item_description}</td>
                <td>{item.item_price}</td>
                <td>{item.item_amt}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='footer'>
          <button>Edit</button>
          <button onClick={() => openDeleteModal(item)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;