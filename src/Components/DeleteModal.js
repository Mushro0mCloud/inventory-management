import React from 'react';
import './Modal.css';

//this modal handles deletion of items. it needs three variables, item, closeModal, and onConfirm (backend bullshit).
function DeleteModal({ item, closeModal, onConfirm }) {
  return (
    <div className='modalBackground'>
      <div className='modalContainer'>
        <div className='titleCloseBtn'>
          <button onClick={closeModal}>X</button>
        </div>
        <div className='title'>
          <h1>Delete item?</h1>
          <p>Are you sure you want to delete <strong>{item.item_name}</strong>?</p>
        </div>
        <div className='footer'>
          <button onClick={onConfirm}>Yes</button>
          <button onClick={closeModal}>No</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;