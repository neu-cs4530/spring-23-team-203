import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
  names: string;
}

interface GetResultsDisplayInputs {
  anonymize: boolean;
  options: string[];
  responses: number[] | PlayerPartial[][];
}

interface GetResultsDisplayOutputs {
  results: ResultsDisplay[];
  total: number;
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
  optionListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  accordianButton: {
    // padding: '0',
  },
  optionContainer: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    marginBottom: '0.5rem',
    alignItems: 'stretch',
  },
  bar: {
    borderRadius: '0.5rem',
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
    justifySelf: 'start',
  },
  optionText: {
    gridRow: '1 / 1',
    gridColumn: '1 /  1',
    justifySelf: 'start',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    paddingLeft: '1rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'black',
    width: '80%',
  },
  percentage: {
    gridRow: '1 / 1',
    gridColumn: '1 / 1',
    justifySelf: 'end',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    paddingRight: '1rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'black',
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

  const [question, setQuestion] = useState<string>('');
  const [creator, setCreator] = useState<string>('');

  const [resultsDisplay, setResultsDisplay] = useState<ResultsDisplay[]>([]);
  const [yourVote, setYourVote] = useState<number[]>([]);
  const [anonymous, setAnonymous] = useState<boolean>(true);

  const [total, setTotal] = useState<number>();

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  // const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  // 90% width

  const getResultsDisplay = useCallback(
    ({ anonymize, options, responses }: GetResultsDisplayInputs): GetResultsDisplayOutputs => {
      let names: string[][] = [];
      let votes: number[] = [];

      if (anonymize) {
        // if this is an anonymous poll, create a list of empty lists for disclosed responses,
        names = (responses as number[]).map(() => []);
        votes = responses as number[];
      } else {
        names = (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) =>
          ppl.map((pp: PlayerPartial) => pp.name),
        );
        votes = (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) => ppl.length);
      }

      const newResults = [];
      const newTotal = votes.reduce((sofar: number, num: number) => sofar + num, 0);

      for (let i = 0; i < options.length; i++) {
        const percentage = Math.round((votes[i] / newTotal) * 1000) / 10;
        const formattedNames = names[i].reduce((sofar, curr) => `${sofar}, ${curr}`, '');
        newResults.push({
          option: options[i],
          percentage: `${percentage}%`,
          names: formattedNames.length ? formattedNames.substring(2) : formattedNames,
        });
      }

      return { results: newResults, total: newTotal };
    },
    [],
  );

  useEffect(() => {
    const getResults = async () => {
      try {
        const results = await coveyTownController.getPollResults(pollID);
        const {
          creatorName: pollCreatorName,
          yourVote: pollYourVote,
          question: pollQuestion,
          options: pollOptions,
          responses: pollResponses,
          settings: pollSettings,
        } = results;

        if (!pollSettings) {
          setError(true);
          return;
        }

        const { anonymize } = pollSettings;

        if (
          anonymize === undefined ||
          !pollCreatorName ||
          !pollYourVote ||
          !pollQuestion ||
          !pollOptions ||
          !pollResponses ||
          !pollOptions.length ||
          !pollResponses.length ||
          !pollYourVote.length ||
          pollOptions.length !== pollResponses.length
        ) {
          setError(true);
          return;
        }

        // set the question, creator name, and what you voted for
        setQuestion(pollQuestion);
        setCreator(pollCreatorName);
        setYourVote(pollYourVote);
        setAnonymous(anonymize);

        // format the display of results, including the total number of votes
        const { total: newTotal, results: newResults } = getResultsDisplay({
          anonymize: anonymize,
          options: pollOptions,
          responses: pollResponses,
        });
        setTotal(newTotal);
        setResultsDisplay(newResults);
      } catch (e) {
        setError(true);
      }

      setLoading(false);
    };

    getResults();
  }, [coveyTownController, pollID, getResultsDisplay]);

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

  const isYourVote = (index: number) => yourVote.some((vote: number) => vote === index);

  const singleOption = (result: ResultsDisplay, index: number) => {
    return (
      <div className={classes.optionContainer}>
        <div
          style={{
            width: result.percentage,
            backgroundColor: isYourVote(index)
              ? 'rgba(96, 128, 170, 0.80)'
              : 'rgba(96, 128, 170, 0.20)',
          }}
          className={classes.bar}></div>
        <div className={classes.optionText}>{result.option}</div>
        <div className={classes.percentage}>{result.percentage}</div>
      </div>
    );
  };

  if (!anonymous) {
    return (
      <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
        <div>
          <div className={classes.message}>{question}</div>
          <div className={classes.pollCreator}>Asked by {creator}</div>
          <Accordion allowMultiple>
            {resultsDisplay.map((result, index) => (
              <AccordionItem key={result.option}>
                <AccordionButton>
                  {singleOption(result, index)}
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <div>{result.names}</div>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <div className={classes.totalVotes}>{`${total} votes`}</div>
        </div>
      </ResultsModalOutline>
    );
  }

  return (
    <ResultsModalOutline isOpen={isOpen} onClose={closeModal}>
      <div>
        <div className={classes.message}>{question}</div>
        <div className={classes.pollCreator}>Asked by {creator}</div>
        <div className={classes.optionListContainer}>
          {resultsDisplay.map((result, index) => (
            <div key={result.option}>{singleOption(result, index)}</div>
          ))}
        </div>
        <div className={classes.totalVotes}>{`${total} votes`}</div>
      </div>
    </ResultsModalOutline>
  );
}
