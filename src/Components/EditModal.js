import React from 'react';
import './Modal.css';

function EditModal({ item, closeModal }) {
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
                <td><input type="text" name="name" defaultValue={item.item_name} /></td>
                <td><input type="text" name="description" defaultValue={item.item_description} /></td>
                <td><input type="number" name="price" step="0.01" defaultValue={item.item_price} /></td>
                <td><input type="number" name="amount" defaultValue={item.item_amt} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='footer'>
          <button onClick={() => closeModal()}>Cancel</button>
          <button onClick={() => closeModal()}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;