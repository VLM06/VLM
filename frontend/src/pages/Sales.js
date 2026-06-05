import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sales = ({ token }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    items: [{ productName: '', quantity: '', unitPrice: '' }],
    totalAmount: ''
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
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

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/sales', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Sale created successfully!');
      setFormData({
        customerName: '',
        customerEmail: '',
        items: [{ productName: '', quantity: '', unitPrice: '' }],
        totalAmount: ''
      });
      fetchSales();
    } catch (error) {
      alert('Error creating sale: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Loading sales...</div>;

  return (
    <div className="sales">
      <h2>💳 Sales Management</h2>

      <form className="add-form" onSubmit={handleAddSale}>
        <h3>Create New Sale</h3>
        <div className="form-row">
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Customer Name"
            required
          />
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="Customer Email"
          />
        </div>
        <div className="form-row">
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            placeholder="Total Amount"
            required
          />
        </div>
        <button type="submit">Create Sale</button>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>No sales found</td>
              </tr>
            ) : (
              sales.map(sale => (
                <tr key={sale._id}>
                  <td>{sale.orderNumber}</td>
                  <td>{sale.customerName}</td>
                  <td>${sale.totalAmount}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: sale.status === 'completed' ? '#27ae60' : '#f39c12',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {sale.status}
                    </span>
                  </td>
                  <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
