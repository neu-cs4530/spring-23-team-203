import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../../../hooks/useTownController';
import { Player, PlayerPartial } from '../../../../../../types/CoveyTownSocket';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollID: string;
}

interface ResultsModalOutlineProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ResultsDisplay {
  option: string;
  percentage: string;
  names: string[];
}

const useStyles = makeStyles({
  message: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  specialMessage: {
    fontSize: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
    margin: '3rem',
  },
  pollCreator: {
    marginBottom: '1rem',
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  bar: {
    color: 'blue',
    backgroundColor: 'blue',
  },
  optionText: {
    borderWidth: '2px',
    borderColor: 'black',
    borderRadius: '10px',
    paddingLeft: '1rem',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
  },
  totalVotes: {
    marginTop: '1rem',
  },
});

export function ResultsModalOutline({ children, isOpen, onClose }: ResultsModalOutlineProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>View Results</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function ResultsModal({ isOpen, onClose, pollID }: ResultsModalProps) {
  const coveyTownController = useTownController();
  const classes = useStyles();

  const [pollQuestion, setQuestion] = useState<string>('');
  const [pollCreator, setCreator] = useState<string>('');
  const [pollOptions, setOptions] = useState<string[]>([]);
  const [pollAnonymousResponses, setAnonymousResponses] = useState<number[]>([]);
  const [pollDisclosedResponses, setDisclosedResponses] = useState<string[][]>([]);

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [pollAnonymous, setAnonymous] = useState<boolean>(true);
  const [pollYourVote, setYourVote] = useState<number[]>([]);

  const [resultsDisplay, setResultsDisplay] = useState<ResultsDisplay[]>([]);
  const [total, setTotal] = useState<number>();

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  // const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  // 90% width

  useEffect(() => {
    const getResults = async () => {
      try {
        const results = await coveyTownController.getPollResults(pollID);
        const { creatorName, yourVote, question, options, responses, settings } = results;

        if (!settings) {
          setError(true);
          return;
        }

        const { anyonymize } = settings;

        if (
          anyonymize === undefined ||
          !creatorName ||
          !yourVote ||
          !question ||
          !options ||
          !responses ||
          !options.length ||
          !responses.length ||
          !yourVote.length ||
          options.length !== responses.length
        ) {
          setError(true);
          return;
        }

        setQuestion(question);
        setCreator(creatorName);
        setOptions(options);
        setAnonymous(anyonymize);
        setYourVote(yourVote);

        if (anyonymize) {
          setAnonymousResponses(responses as number[]);
        } else {
          setDisclosedResponses(
            (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) =>
              ppl.map((pp: PlayerPartial) => pp.name),
            ),
          );
          setAnonymousResponses(
            (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) => ppl.length),
          );
        }
      } catch (e) {
        setError(true);
      }

      setLoading(false);
    };

    getResults();
  }, [coveyTownController, pollID]);

  useEffect(() => {
    const newResults = [];

    const newTotal = pollAnonymousResponses.reduce((sofar: number, num: number) => sofar + num, 0);
    console.log(pollAnonymousResponses);
    setTotal(newTotal);

    for (let i = 0; i < pollOptions.length; i++) {
      const percentage = Math.round((pollAnonymousResponses[i] / newTotal) * 1000) / 10;
      newResults.push({
        option: pollOptions[i],
        percentage: `${percentage}%`,
        names: pollDisclosedResponses[i],
      });
    }

    setResultsDisplay(newResults);
  }, [pollOptions, pollAnonymousResponses, pollDisclosedResponses]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    onClose();
  }, [coveyTownController, onClose]);

  if (loading) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <p className={classes.specialMessage}>Loading poll results...</p>
      </ResultsModalOutline>
    );
  }

  if (error) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <p className={classes.specialMessage}>Sorry, there was an error fetching poll results.</p>
      </ResultsModalOutline>
    );
  }

  return (
    <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
      <div>
        <div className={classes.message}>{pollQuestion}</div>
        <div className={classes.pollCreator}>Asked by {pollCreator}</div>
        {resultsDisplay.map(result => (
          <div key={result.option} className={classes.optionContainer}>
            <div style={{ width: result.percentage }} className={classes.bar}></div>
            <div className={classes.optionText}>{result.option}</div>
            <div>{result.percentage}</div>
            <div>{result.names}</div>
          </div>
        ))}
        <div className={classes.totalVotes}>{`${total} votes`}</div>
      </div>
    </ResultsModalOutline>
  );
}
