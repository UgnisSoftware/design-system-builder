import React from 'react'
import styles from './app.scss';

export default (props) =>
    <div className={styles.component}>
        <div className={styles.panel}>
            <div>State</div>
            <div>Style</div>
        </div>
        <div className={styles.tree}>Component</div>
        <div className={styles.display}>Display</div>
    </div>