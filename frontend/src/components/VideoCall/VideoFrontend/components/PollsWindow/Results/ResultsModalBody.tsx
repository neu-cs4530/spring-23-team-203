import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import ResultsModalContent from './ResultsModalContent';
import { ResultsDisplay } from '../../../../../../types/CoveyTownSocket';

interface ResultsModalBodyProps {
  question: string;
  creator: string;
  resultsDisplay: ResultsDisplay[];
  yourVote: number[];
  anonymous: boolean;
  total: number;
  error: boolean;
  loading: boolean;
}

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
  totalVotes: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    fontSize: '1rem',
    fontWeight: 600,
  },
});

export default function ResultsModalBody({
  question,
  creator,
  resultsDisplay,
  yourVote,
  anonymous,
  total,
  error,
  loading,
}: ResultsModalBodyProps) {
  const classes = useStyles();

  // loading message
  if (loading) {
    return <p className={classes.specialMessage}>Loading poll results...</p>;
  }

  // error message
  if (error) {
    return (
      <p className={classes.specialMessage}>Sorry, there was an error fetching poll results.</p>
    );
  }

  return (
    <div>
      <div className={classes.question}>{question}</div>
      <div className={classes.pollCreator}>Asked by {creator}</div>
      <ResultsModalContent
        anonymous={anonymous}
        yourVote={yourVote}
        resultsDisplay={resultsDisplay}
      />
      <div className={classes.totalVotes}>{`${total} votes`}</div>
    </div>
  );
}
