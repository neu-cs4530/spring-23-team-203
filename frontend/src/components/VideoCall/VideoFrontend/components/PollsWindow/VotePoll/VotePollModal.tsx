import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState, Fragment } from 'react';
import useTownController from '../../../../../../hooks/useTownController';

interface VotePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollID: string;
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
});

export function VotePollModal({ isOpen, onClose, pollID }: VotePollModalProps) {
  const classes = useStyles();
  const coveyTownController = useTownController();
  // need question, options, allowMultiSelect... from props after calling this from poll cards sidebar
  const maxVoteNumber = 3; // TODO get maxVoteNumber from pollSettings

  const [question, setQuestion] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [options, setOptions] = useState<{ id: number; value: string }[]>([
    { id: 0, value: '' },
    { id: 1, value: '' },
  ]);

  const [voteNumber, setVoteNumber] = useState(0);

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  // get results from the API and store them in React state
  useEffect(() => {
    const getPollContent = async () => {
      try {
        const poll = await coveyTownController.getPollResults(pollID);

        // set the question, creator name, and options to vote for
        setQuestion(poll.question);
        setCreator(poll.creator.name);
        let id = -1;
        setOptions(
          poll.options.map(function (val) {
            id += 1;
            return { id: id, value: val };
          }),
        );
      } catch (e) {
        setError(true);
        toast({
          title: 'Failure',
          description: 'Unable to get poll information',
          status: 'error',
        });
      }

      setLoading(false);
    };
    getPollContent();
  }, [coveyTownController, pollID, isOpen, toast]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  const votePoll = async (userVotes: { id: number; value: string }) => {
    if (voteNumber !== maxVoteNumber) {
      try {
        const userVotesStr: string = userVotes.value;
        const voteResponse = await coveyTownController.voteInPoll(pollID, [userVotes.id]);
        setVoteNumber(voteNumber + 1);
        coveyTownController.unPause();
        closeModal();
        toast({
          title: 'Successful vote',
          description: `Congratulations! You voted for "${userVotesStr}" in poll "${question}"`,
          status: 'success',
        });
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to vote in poll',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    } else {
      toast({
        title: 'Unable to vote in poll',
        description: `You have voted ${voteNumber} times, and the max number of times is: ${maxVoteNumber}`,
        status: 'error',
      });
    }
  };

  const voteOptionButtons = () => {
    const optionButtons: JSX.Element[] = [];
    options.forEach(option => {
      optionButtons.push(
        <Fragment key={option.id}>
          <Button
            id='{option}_btn'
            value={option.value}
            variant='outline'
            height='48px'
            width='90%'
            border='4px'
            style={{ borderRadius: '1rem' }}
            colorScheme='blue'
            onClick={() => votePoll(option)}>
            {option.value}
          </Button>
        </Fragment>,
      );
    });
    return (
      <Stack direction='column' spacing={4} align='center'>
        {optionButtons}
      </Stack>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vote</ModalHeader>
        <ModalCloseButton />
        <form>
          <ModalBody pb={6}>
            <div>
              <div className={classes.question}>{question}</div>
              <div className={classes.pollCreator}>Asked by {creator}</div>
            </div>
            {voteOptionButtons()}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
