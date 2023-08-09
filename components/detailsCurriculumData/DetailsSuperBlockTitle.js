import React from 'react';

export default function DetailsSuperBlockTitle(props) {
  const data = props.certs;
  return (
    <>
      <ul>
        {data.map(certName => {
          return <h1 key={certName}>{certName}</h1>;
        })}
      </ul>
    </>
  );
}
