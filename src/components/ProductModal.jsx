
import { useState } from "react";
import "./ProductModal.css";

export default function ProductModal({ closeModal }) {

  return (
    <>
  
      <div className="modal-overlay" onClick={closeModal}>
        <form
          className="delivery-form"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="input-grid">
            <div className="input-group">
              <label>আপনার নাম *</label>
              <input type="text" placeholder="আপনার নাম" required />
            </div>

            <div className="input-group">
              <label>সম্পূর্ণ ঠিকানা *</label>
              <input type="text" placeholder="সম্পূর্ণ ঠিকানা" required />
            </div>

            <div className="input-group">
              <label>ফোন নাম্বার *</label>
              <input type="text" placeholder="Phone" required />
            </div>

            <div className="input-group">
              <label>আপনার ইমেইল</label>
              <input type="email" placeholder="name@flowbite.com" />
            </div>
          </div>

          <div className="delivery-options">
            <label className="radio-option">
              <input type="radio" name="delivery" />
              ঢাকার ভিতরে (ডেলিভারি চার্জ: ৳৭০)
            </label>

            <label className="radio-option active-option">
              <input type="radio" name="delivery" defaultChecked />
              ঢাকার বাইরে (ডেলিভারি চার্জ: ৳১২০)
            </label>
          </div>

          <button type="submit" className="order-submit-btn">
            অর্ডার করুন 
          </button>
        </form>
      </div>

    </>

  );
}





















