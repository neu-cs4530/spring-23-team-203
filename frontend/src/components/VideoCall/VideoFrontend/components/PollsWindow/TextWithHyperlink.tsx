import React from 'react';

export default function TextWithHyperlink(props: {
  text: string;
  linkDisplay?: string;
  option?: boolean;
  className?: string;
}) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const match = props.text.match(urlRegex);
  if (match && match.length > 0) {
    const urlIndex = props.text.indexOf(match[0]);
    const beforeUrl = props.text.substring(0, urlIndex);
    const afterUrl = props.text.substring(urlIndex + match[0].length);

    return props.option ? (
      <p className={props.className}>
        {props.text}
        <a href={match[0]} style={{ color: '#6080AA' }} target='_blank' rel='noopener noreferrer'>
          {'↗'}
        </a>
      </p>
    ) : (
      <p>
        {beforeUrl}{' '}
        <a href={match[0]} style={{ color: '#6080AA' }} target='_blank' rel='noopener noreferrer'>
          {props.linkDisplay ? props.linkDisplay : match[0]}
        </a>{' '}
        {afterUrl}
      </p>
    );
  }

  return <p>{props.text}</p>;
}
