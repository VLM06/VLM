import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = ({ token }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    quantity: '',
    unitPrice: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inventory', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product added successfully!');
      setFormData({
        productName: '',
        sku: '',
        quantity: '',
        unitPrice: '',
        category: '',
        description: ''
      });
      fetchInventory();
    } catch (error) {
      alert('Error adding product: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product deleted successfully!');
        fetchInventory();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  if (loading) return <div className="loading">Loading inventory...</div>;

  return (
    <div className="inventory">
      <h2>📦 Inventory Management</h2>

      <form className="add-form" onSubmit={handleAddProduct}>
        <h3>Add New Product</h3>
        <div className="form-row">
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Product Name"
            required
          />
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="SKU"
            required
          />
        </div>
        <div className="form-row">
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
          <input
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            placeholder="Unit Price"
            required
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
          />
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
          />
        </div>
        <button type="submit">Add Product</button>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>No products found</td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item._id}>
                  <td>{item.productName}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unitPrice}</td>
                  <td>{item.category}</td>
                  <td>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
