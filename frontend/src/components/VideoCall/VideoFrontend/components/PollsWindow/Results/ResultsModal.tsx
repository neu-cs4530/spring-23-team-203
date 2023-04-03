import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerPartial } from '../../../../../../types/CoveyTownSocket';
import ResultsModalBody from './ResultsModalBody';
import useTownController from '../../../../../../hooks/useTownController';
import { ResultsDisplay } from '../../../../../../types/CoveyTownSocket';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollID: string;
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

export default function ResultsModal({ isOpen, onClose, pollID }: ResultsModalProps) {
  const coveyTownController = useTownController();

  const [question, setQuestion] = useState<string>('');
  const [creatorName, setCreatorName] = useState<string>('');

  const [resultsDisplay, setResultsDisplay] = useState<ResultsDisplay[]>([]);
  const [yourVote, setYourVote] = useState<number[]>([]);
  const [anonymous, setAnonymous] = useState<boolean>(true);

  const [total, setTotal] = useState<number>(0);

  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const getResultsDisplay = useCallback(
    ({ anonymize, options, responses }: GetResultsDisplayInputs): GetResultsDisplayOutputs => {
      let names: string[][] = [];
      let votes: number[] = [];

      // get the number of votes, and the names of those who voted for each option
      if (anonymize) {
        names = (responses as number[]).map(() => []);
        votes = responses as number[];
      } else {
        names = (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) =>
          ppl.map((pp: PlayerPartial) => pp.name),
        );
        votes = (responses as PlayerPartial[][]).map((ppl: PlayerPartial[]) => ppl.length);
      }

      // calculate the total number of votes
      const newTotal = votes.reduce((sofar: number, num: number) => sofar + num, 0);

      // for each option, create an object with the option text, the percentage, and the names
      const newResults = [];
      for (let i = 0; i < options.length; i++) {
        const percentage = Math.round((votes[i] / newTotal) * 1000) / 10;
        const formattedNames = names[i]
          .reduce((sofar, curr) => `${sofar}, ${curr}`, '')
          .substring(2);

        newResults.push({
          option: options[i],
          percentage: `${percentage}%`,
          names: formattedNames,
        });
      }

      return { results: newResults, total: newTotal };
    },
    [],
  );

  const getResults = useCallback(async () => {
    try {
      const results = await coveyTownController.getPollResults(pollID);
      const {
        creator: pollCreator,
        userVotes: pollYourVote,
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
        !pollCreator ||
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
      setCreatorName(pollCreator.name);
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
  }, [coveyTownController, pollID, getResultsDisplay]);

  // get results from the API and store them in React state
  useEffect(() => {
    getResults();

    const interval = setInterval(() => {
      getResults();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [getResults]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>View Results</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ResultsModalBody
            loading={loading}
            error={error}
            question={question}
            creator={creatorName}
            yourVote={yourVote}
            anonymous={anonymous}
            total={total}
            resultsDisplay={resultsDisplay}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
