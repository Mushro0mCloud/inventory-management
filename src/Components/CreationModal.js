import React from 'react';
import './Modal.css';

function CreationModal({ closeModal }) {
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
            </div>
        </div>
    );
}

export default CreationModal;