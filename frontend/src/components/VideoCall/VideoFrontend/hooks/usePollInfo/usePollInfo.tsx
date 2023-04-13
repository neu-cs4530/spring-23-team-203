import { useEffect, useState } from 'react';
import useTownController from '../../../../../hooks/useTownController';
import { PlayerPartial } from '../../../../../types/CoveyTownSocket';

interface PollInfo {
  pollQuestion: string;
  pollCreatorName: string;
  pollYourVote: number[];
  pollOptions: string[];
  pollResponses: PlayerPartial[][] | number[];
  pollMultiSelect: boolean;
  pollAnonymize: boolean;
}

export default function usePollInfo(pollID: string) {
  const coveyTownController = useTownController();
  const [pollInfo, setPollInfo] = useState<PollInfo>();
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const getPollInfo = async () => {
      try {
        const results = await coveyTownController.getPollResults(pollID);

        if (!results) {
          setLoaded(true);
          return;
        }

        const {
          creator: pollCreator,
          userVotes: pollYourVote,
          question: pollQuestion,
          options: pollOptions,
          responses: pollResponses,
          settings: pollSettings,
        } = results;
        if (
          !pollCreator ||
          !pollYourVote ||
          !pollQuestion ||
          !pollOptions ||
          !pollResponses ||
          !pollSettings
        ) {
          setLoaded(true);
          return;
        }
        if (!pollOptions.length || !pollResponses.length) {
          setLoaded(true);
          return;
        }

        const { name: pollCreatorName } = pollCreator;
        const { anonymize: pollAnonymize, multiSelect: pollMultiSelect } = pollSettings;
        if (!pollCreatorName || pollAnonymize === undefined || pollMultiSelect === undefined) {
          setLoaded(true);
          return;
        }

        const newPollInfo = {
          pollQuestion,
          pollCreatorName,
          pollYourVote,
          pollOptions,
          pollResponses,
          pollAnonymize,
          pollMultiSelect,
        };
        setPollInfo(newPollInfo);
        setLoaded(true);
      } catch (e) {
        setLoaded(true);
        return;
      }
    };

    getPollInfo();

    const interval = setInterval(() => {
      getPollInfo();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [coveyTownController, pollID]);

  return { pollInfo, loaded };
}
