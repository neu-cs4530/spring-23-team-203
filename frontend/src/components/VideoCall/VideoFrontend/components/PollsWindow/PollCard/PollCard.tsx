import React from 'react';
import { Button } from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import { Poll } from '../../../../../../types/CoveyTownSocket';

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
  },
  info: {
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 'bold',
    padding: '0 1em 1em 1em',
    color: '#6080AA',
  },
  question: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 18,
    padding: '1em 1em 0.1em 0.8em',
  },
  creatorInfo: {
    fontStyle: 'italic',
  },
  button: {
    textAlign: 'right',
    flexDirection: 'column',
    float: 'right',
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
        <div className={classes.info}>
          <div className={classes.creatorInfo}>Asked by {body.creatorId}</div>
          <div> {totalVotes(body.votes)} votes</div>
        </div>
        <Button colorScheme='blue' mr={3}>
          View Results
        </Button>
      </div>
    </div>
  );
}
