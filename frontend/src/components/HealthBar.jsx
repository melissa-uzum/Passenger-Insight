import React from 'react';

export default function HealthBar({ ok }) {
const style = {
padding: '8px 12px',
borderRadius: 8,
display: 'inline-block',
background: ok ? '#d1fae5' : '#fee2e2',
color: ok ? '#065f46' : '#991b1b'
};
return <span style={style}>{ok ? 'System OK' : 'System Error'}</span>;
}