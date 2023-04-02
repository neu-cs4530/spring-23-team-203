import React, { useState } from 'react';
import { PollInfo } from '../../../../../../types/CoveyTownSocket';
import PollCard from '../PollCard/PollCard';
import ResultsModal from '../Results/ResultsModal';

interface PollsListProps {
  polls: PollInfo[];
}

export default function PollsList({ polls }: PollsListProps) {
  const [selectedPollID, setSelectedPollID] = useState<string>('');
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);

  const clickViewResults = (pollID: string) => {
    setSelectedPollID(pollID);
    setIsResultsModalOpen(true);
  };

  const closeResultsModal = () => {
    setIsResultsModalOpen(false);
    setSelectedPollID('');
  };

  return (
    <div>
      {polls.map(poll => {
        // TODO: conditional rendering based on vote/creator status
        // const isCreator = p.id === poll.creatorId;

        return (
          <React.Fragment key={poll.pollId}>
            <PollCard body={poll} clickViewResults={clickViewResults} />
          </React.Fragment>
        );
      })}
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
