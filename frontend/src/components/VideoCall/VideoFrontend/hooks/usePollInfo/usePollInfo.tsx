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

  useEffect(() => {
    const getPollInfo = async () => {
      const results = await coveyTownController.getPollResults(pollID);
      if (!results) {
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
        return;
      }
      if (!pollOptions.length || !pollResponses.length || !pollYourVote.length) {
        return;
      }

      const { name: pollCreatorName } = pollCreator;
      const { anonymize: pollAnonymize, multiSelect: pollMultiSelect } = pollSettings;
      if (!pollCreatorName || pollAnonymize === undefined || pollMultiSelect === undefined) {
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
    };
    getPollInfo();
  }, [coveyTownController, pollID]);

  return pollInfo;
}
