// components/Spinner/Spinner.js
import styles from './Spinner.module.css';

const Spinner = ({ size = 'medium', color = 'white' }) => {
  const spinnerStyle = {
    '--spinner-color': color,
    '--spinner-size': size === 'small' ? '16px' : (size === 'large' ? '32px' : '24px'),
    'border-width': size === 'small' ? '2px' : (size === 'large' ? '4px' : '3px'),
  };

  return <div className={styles.spinner} style={spinnerStyle}></div>;
};

export default Spinner;