import React, { useRef } from 'react';
import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '../../../icons/CloseIcon';
import { PollInfo } from '../../../../../../generated/client/models/PollInfo';
import TextWithHyperlink from '../TextWithHyperlink';

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
    marginBottom: '5%',
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
    padding: '1em 4em 0.1em 0.8em',
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
  deleteButton: {
    margin: '0.5rem',
    justifySelf: 'end',
    flexDirection: 'column',
    float: 'right',
    gridRow: '1 / span 1',
    gridColumn: '2 / span 1',
  },
});

interface PollCardProps {
  body: PollInfo;
  clickVoteOrViewResults: (pollId: string, userHasVoted: boolean) => void;
  deletePoll: (pollId: string) => void;
}

export default function PollCard({ body, clickVoteOrViewResults, deletePoll }: PollCardProps) {
  const classes = useStyles();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const voteOrViewResults = () => {
    clickVoteOrViewResults(body.pollId, body.voted);
  };

  const buttonText: string = body.voted ? 'View Results' : 'Vote';
  const totalVotersText: string =
    body.totalVoters + (body.totalVoters === 1 ? ' Voter' : ' Voters');

  return (
    <div>
      <div className={classes.pollCard}>
        <div className={classes.question}>
          <TextWithHyperlink text={body.question} linkDisplay='this (external link)' />
        </div>
        <div className={classes.info}>
          <div className={classes.creatorInfo}>Asked by {body.creatorName}</div>
          <div> {totalVotersText}</div>
        </div>
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                Delete Poll
              </AlertDialogHeader>

              <AlertDialogBody>Are you sure you want to delete this poll?</AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme='red' onClick={() => deletePoll(body.pollId)} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        {body.isCreator ? (
          <Button onClick={onOpen} className={classes.deleteButton}>
            <CloseIcon />
          </Button>
        ) : null}
        <Button
          colorScheme={body.voted ? 'green' : 'facebook'}
          mr={3}
          variant='solid'
          borderRadius={20}
          className={classes.button}
          onClick={voteOrViewResults}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
