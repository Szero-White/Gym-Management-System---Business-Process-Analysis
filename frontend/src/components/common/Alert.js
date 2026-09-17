import React, { useContext } from 'react';
import AlertContext from '../../contexts/alert/alertContext';
import { Alert as MuiAlert } from '@mui/material';

const Alert = () => {
  const alertContext = useContext(AlertContext);

  return (
    <div className="alert-wrapper">
      {alertContext.alerts.length > 0 &&
        alertContext.alerts.map(alert => (
          <MuiAlert
            key={alert.id}
            severity={alert.type}
            sx={{ width: '100%', marginBottom: 2 }}
          >
            {alert.msg}
          </MuiAlert>
        ))}
    </div>
  );
};

export default Alert;