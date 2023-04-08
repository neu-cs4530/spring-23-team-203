import React from 'react';

export default function TextWithHyperlink(props: { text: string; className?: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const match = props.text.match(urlRegex);
  if (match && match.length > 0) {
    return (
      <p className={props.className}>
        {props.text}
        <a href={match[0]} style={{ color: '#6080AA' }} target='_blank' rel='noopener noreferrer'>
          {'↗'}
        </a>
      </p>
    );
  }

  return <p>{props.text}</p>;
}
