import React from 'react';
import './Modal.css';

//this model creates new items out of nowhere. unfortunately, when new items do appear, they appear at the very very end of the database, so whoops. if there is a way to make them appear sorted by ID, i am entirely unaware.
function CreationModal({ closeModal, onConfirm}) {
    return (
        <div className='modalBackground'>
            <div className='modalContainer'>
                <div className='titleCloseBtn'>
                    <button onClick={closeModal}>X</button>
                </div>
                <div className='title'>
                    <h1>Create New Item</h1>
                </div>
                <div className='body'>
                    <form>
                        <label>Name:</label>
                        <input type="text" name="name" />
                        <label>Description:</label>
                        <input type="text" name="description" />
                        <label>Price:</label>
                        <input type="number" name="price" step="0.01" />
                        <label>Amount:</label>
                        <input type="number" name="amount" />
                    </form>
                </div>
                <div className='footer'>
                    <button onClick={closeModal}>Cancel</button>
                    <button type="button" onClick={() => {
                        const form = document.querySelector('form');
                        const itemName = form.name.value.trim();
                        const itemDescription = form.description.value.trim();
                        const itemPrice = form.price.value.trim();
                        const itemAmt = parseInt(form.amount.value, 10);

                        if (!itemName || !itemPrice || Number.isNaN(itemAmt)) {
                            alert('Please provide a valid name, price, and amount.');
                            return;
                        }

                        const newItem = {
                            item_name: itemName,
                            item_description: itemDescription,
                            item_price: itemPrice,
                            item_amt: itemAmt
                        };
                        onConfirm(newItem);
                    }}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default CreationModal;