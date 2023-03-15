import React from 'react';
import { Button } from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import { Poll } from '../../../../../../types/CoveyTownSocket';
import CloseIcon from '../../../icons/CloseIcon';

const useStyles = makeStyles({
  messageContainer: {
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5em 0.8em 0.6em',
    margin: '0.3em 0 0',
    wordBreak: 'break-word',
    backgroundColor: '#E1E3EA',
    hyphens: 'auto',
    whiteSpace: 'pre-wrap',
  },
  isLocalParticipant: {
    backgroundColor: '#CCE4FF',
  },
  pollCard: {
    backgroundColor: '#F3F4FC',
    padding: '1%',
    margin: '1%',
    width: '300px',
    borderRadius: '20px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
  },
  info: {
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 'bold',
    padding: '0 1em 1em 1em',
    color: '#6080AA',
    gridRow: '2 / span 1',
    gridColumn: '1 / span 1',
  },
  question: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 18,
    padding: '1em 1em 0.1em 0.8em',
    gridRow: '1 / span 1',
    gridColumn: '1 / span 2',
  },
  creatorInfo: {
    fontStyle: 'italic',
  },
  button: {
    margin: '0.5rem',
    textAlign: 'right',
    flexDirection: 'column',
    float: 'right',
    gridRow: '2 / span 1',
    gridColumn: '2 / span 1',
  },
  closePollsWindow: {
    cursor: 'pointer',
    margin: '0.5rem',
    display: 'flex',
    background: 'transparent',
    border: '0',
    float: 'right',
    padding: '0.4em',
    gridRow: '1 / span 1',
    gridColumn: '2 / span 1',
  },
});

interface PollCardProps {
  body: Poll;
  isCreator: boolean;
}

// calculate the total number of votes of a poll given a list of votes
function totalVotes(votes: string[][]) {
  let count = 0;
  votes.forEach(voteOption => {
    voteOption.forEach(() => (count = count + 1));
  });
  return count;
}

export default function PollCard({ body, isCreator }: PollCardProps) {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.pollCard}>
        <div className={classes.question}>{body.question}</div>
        <button className={classes.closePollsWindow}>
          <CloseIcon />
        </button>
        <div className={classes.info}>
          <div className={classes.creatorInfo}>Asked by {body.creatorId}</div>
          <div> {totalVotes(body.votes)} votes</div>
        </div>
        <Button colorScheme='blue' mr={3} borderRadius={20} className={classes.button}>
          View Results
        </Button>
      </div>
    </div>
  );
}
