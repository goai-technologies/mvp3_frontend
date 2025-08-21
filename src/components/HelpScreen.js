import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';

const HelpScreen = () => {
  const { showNotification } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    message: ''
  });

  const faqs = [
    {
      id: 1,
      question: 'How long does an audit take?',
      answer: 'Most audits complete within 3-5 minutes, depending on the size and complexity of your website.'
    },
    {
      id: 2,
      question: 'What changes are made to my website?',
      answer: 'We create an optimized version internally for comparison. No changes are made to your live website without your explicit approval.'
    },
    {
      id: 3,
      question: 'Can I audit password-protected sites?',
      answer: 'Currently, we only support publicly accessible websites. Private sites require special configuration.'
    }
  ];

  const toggleFaq = (faqId) => {
    setActiveFaq(activeFaq === faqId ? null : faqId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSupportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showNotification('Support request submitted successfully!', 'success');
    setSupportForm({
      subject: '',
      category: '',
      message: ''
    });
  };

  return (
    <div className="screen">
      <div className="container">
                  <div className="help-header">
            <h1>Help & Support</h1>
            <p>Get assistance and learn more about our automated website improvement platform</p>
          </div>
        
        <div className="help-content">
          <div className="help-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`}
                >
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3>{faq.question}</h3>
                    <FontAwesomeIcon 
                      icon="chevron-down" 
                      style={{ 
                        transform: activeFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                  {activeFaq === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="help-section">
            <h2>Contact Support</h2>
            <div className="contact-options">
              <div className="contact-card">
                <FontAwesomeIcon icon="envelope" />
                <h3>Email Support</h3>
                <p>Get help via email</p>
                <p><strong>support@example.com</strong></p>
                <p>Response within 24 hours</p>
              </div>
              <div className="contact-card">
                <FontAwesomeIcon icon="comments" />
                <h3>Live Chat</h3>
                <p>Chat with our team</p>
                <button className="btn-primary">Start Chat</button>
                <p>Available 9 AM - 6 PM EST</p>
              </div>
              <div className="contact-card">
                <FontAwesomeIcon icon="book" />
                <h3>Documentation</h3>
                <p>Browse our guides</p>
                <button className="btn-secondary">View Docs</button>
                <p>Comprehensive tutorials</p>
              </div>
            </div>
          </div>
          
          <div className="help-section">
            <h2>Submit a Support Request</h2>
            <form className="support-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={supportForm.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={supportForm.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={supportForm.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-primary">
                Send Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;
