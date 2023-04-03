import { Button, Stack } from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback } from 'react';

const useStyles = makeStyles({
  specialMessage: {
    fontSize: '1.25rem',
    fontWeight: 600,
    textAlign: 'center',
    margin: '3rem',
  },
  question: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  pollCreator: {
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },
  checkmark: {
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
});

interface Option {
  id: number;
  text: string;
  selected: boolean;
}

function Checkmark() {
  const classes = useStyles();
  return (
    <div className={classes.checkmark}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='18' height='18'>
        {/* Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - 
https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
        <path
          fill='#ffffff'
          d='M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 
      0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 
      111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z'
        />
      </svg>
    </div>
  );
}

export default function VotePollModalBody({
  loading,
  error,
  question,
  creator,
  options,
  setOptions,
  multiSelect,
}: {
  loading: boolean;
  error: boolean;
  question: string;
  creator: string;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  multiSelect: boolean;
}) {
  const classes = useStyles();

  const updateOptions = useCallback(
    (currId: number) => {
      setOptions((oldOptions: Option[]) => {
        return oldOptions.map((option: Option) => {
          const { id, text, selected } = option;
          let newSelected = multiSelect ? selected : false;
          if (id === currId) {
            newSelected = !selected;
          }

          return { text, id, selected: newSelected };
        });
      });
    },
    [setOptions, multiSelect],
  );
  console.log(loading);

  if (loading) {
    return <p className={classes.specialMessage}>Loading poll results...</p>;
  }

  if (error) {
    return (
      <p className={classes.specialMessage}>Sorry, there was an error fetching poll results.</p>
    );
  }

  return (
    <div>
      <div>
        <div className={classes.question}>{question}</div>
        <div className={classes.pollCreator}>Asked by {creator}</div>
      </div>
      <Stack direction='column' spacing={4} align='center'>
        {options.map(option => (
          <Button
            key={option.id}
            value={option.text}
            variant={option.selected ? 'solid' : 'outline'}
            height='48px'
            width='90%'
            border='4px'
            style={{ borderRadius: '1rem' }}
            colorScheme='blue'
            onClick={() => updateOptions(option.id)}>
            {option.text}
            {option.selected && <Checkmark />}
          </Button>
        ))}
      </Stack>
    </div>
  );
}