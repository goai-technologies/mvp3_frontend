import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';

const NotificationContainer = () => {
  const { state, removeNotification } = useApp();

  const getIcon = (type) => {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      info: 'info-circle',
      warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
  };

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <FontAwesomeIcon icon={getIcon(notification.type)} />
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
