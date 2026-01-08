// import React, { useEffect, useState } from "react";
// import ProductSection from "./ProductSection";
// import { Link } from "react-router-dom";

// const Products = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   // Fetch data
//   const loadData = async () => {
//     try {
//       const response = await fetch(`${BASE_URL}/products`);
//       const result = await response.json();
//       setData(result);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   console.log(data);

//   return (
//     <div style={{ marginTop: "50px" }}>
//       <div className="container mx-auto lg:px-8 px-2">
//         <div className="mb-4 flex lg:px-10 items-center justify-between gap-4 md:mb-8">
//           <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
//           All Products
//           </h2>
//          <Link
//             to={"/shop"}
//             className="flex items-center text-base font-medium text-gray-900 hover:underline"
//           >
//             See more products
//             <svg
//               className="ms-1 h-5 w-5"
//               aria-hidden="true"
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 stroke="currentColor"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M19 12H5m14 0-4 4m4-4-4-4"
//               />
//             </svg>
//           </Link> 
//         </div>
//         <ProductSection loading={loading} data={data[0]}/>
//       </div>
//     </div>
//   );
// };

// export default Products;









// import { useState } from "react";
// import ProductModal from "./ProductModal";

// function Products() {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       {/* product card */}
//       <button onClick={() => setOpen(true)}>
//         BUY NOW
//       </button>

//       {open && <ProductModal closeModal={() => setOpen(false)} />}
//     </>
//   );
// }

// export default Products;






import React, { useState } from 'react';
import ProductModal from './ProductModal';

const Product = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Smart Watch Series 8</h1>
      <p>Price: 2500 BDT</p>
      
      {/* Buy Now Button */}
      <button 
        onClick={handleOpenModal}
        style={{
          padding: '12px 25px',
          backgroundColor: '#ff5722',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Buy Now
      </button>

      {/* Rendering the Modal */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Product;

