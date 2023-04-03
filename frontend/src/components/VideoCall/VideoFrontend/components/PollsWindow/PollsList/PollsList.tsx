import React, { useState } from 'react';
import { PollInfo } from '../../../../../../types/CoveyTownSocket';
import PollCard from '../PollCard/PollCard';
import ResultsModal from '../Results/ResultsModal';
import { VotePollModal } from '../VotePoll/VotePollModal';

interface PollsListProps {
  polls: PollInfo[];
  fetchPollsInfo: () => void;
}

export default function PollsList({ polls, fetchPollsInfo }: PollsListProps) {
  const [selectedPollID, setSelectedPollID] = useState<string>('');
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const clickVoteOrViewResults = (pollID: string, userHasVoted: boolean) => {
    setSelectedPollID(pollID);
    if (userHasVoted) {
      setIsResultsModalOpen(true);
    } else {
      setIsVoteModalOpen(true);
    }
  };

  const closeResultsModal = () => {
    setIsResultsModalOpen(false);
    setSelectedPollID('');
  };

  const closeVoteModal = () => {
    setIsVoteModalOpen(false);
    setSelectedPollID('');
  };

  return (
    <div>
      {polls.map(poll => {
        return (
          <React.Fragment key={poll.pollId}>
            <PollCard body={poll} clickVoteOrViewResults={clickVoteOrViewResults} />
          </React.Fragment>
        );
      })}
      {isVoteModalOpen && (
        <VotePollModal
          isOpen={isVoteModalOpen}
          onClose={closeVoteModal}
          pollID={selectedPollID}
          fetchPollsInfo={fetchPollsInfo}
        />
      )}
      {isResultsModalOpen && (
        <ResultsModal
          isOpen={isResultsModalOpen}
          onClose={closeResultsModal}
          pollID={selectedPollID}
        />
      )}
    </div>
  );
}
