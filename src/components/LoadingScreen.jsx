import React from 'react';

const LoadingScreen = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc'
        }}>
            <div className="loader">
                <style>{`
                    .loader {
                        width: 48px;
                        height: 48px;
                        border: 5px solid #0047ab;
                        border-bottom-color: transparent;
                        border-radius: 50%;
                        display: inline-block;
                        box-sizing: border-box;
                        animation: rotation 1s linear infinite;
                    }

                    @keyframes rotation {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    } 
                `}</style>
            </div>
        </div>
    );
};

export default LoadingScreen;
