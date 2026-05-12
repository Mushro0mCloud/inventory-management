import React from 'react';
import './Modal.css';

//this is basically the regular modal but with input fields. it needs three variables, item, closeModal, and onSave (backend bullshit).
function EditModal({ item, closeModal, onSave }) {
  const [name, setName] = React.useState(item.item_name);
  const [description, setDescription] = React.useState(item.item_description);
  const [price, setPrice] = React.useState(item.item_price);
  const [amount, setAmount] = React.useState(item.item_amt);

  const handleSave = () => {
    onSave({
      item_id: item.item_id,
      item_name: name,
      item_description: description,
      item_price: price,
      item_amt: amount
    });
  };

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
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input value={name} onChange={e => setName(e.target.value)} /></td>
                <td><input value={description} onChange={e => setDescription(e.target.value)} /></td>
                <td><input value={price} onChange={e => setPrice(e.target.value)} /></td>
                <td><input value={amount} onChange={e => setAmount(e.target.value)} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='footer'>
          <button onClick={() => closeModal()}>Cancel</button>
          <button onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;