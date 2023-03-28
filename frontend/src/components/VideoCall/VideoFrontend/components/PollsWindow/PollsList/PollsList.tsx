import React, { useState } from 'react';
import { Poll } from '../../../../../../types/CoveyTownSocket';
import PollCard from '../PollCard/PollCard';
import ResultsModal from '../Results/ResultsModal';
import { VotePollModal } from '../VotePoll/VotePollModal';

interface PollsListProps {
  polls: Poll[];
}

export default function PollsList({ polls }: PollsListProps) {
  const [selectedPollID, setSelectedPollID] = useState<string>('');
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const userHasVoted = (pollID: string) => {
    pollID;
    return false 
    // todo change
  }

  const clickVoteOrViewResults = (pollID: string) => {
    setSelectedPollID(pollID);
    if (userHasVoted(pollID)) {
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
        // TODO: conditional rendering based on vote/creator status
        // const isCreator = p.id === poll.creatorId;
        let buttonText : string = userHasVoted(poll.pollId) ? "View Results" : "Vote"

        return (
          <React.Fragment key={poll.pollId}>
            <PollCard body={poll} isCreator={true} clickVoteOrViewResults={clickVoteOrViewResults} buttonText={buttonText} />
          </React.Fragment>
        );
      })}
      {isVoteModalOpen && (
        <VotePollModal 
        isOpen={isVoteModalOpen} 
        onClose={closeVoteModal} 
        pollID={selectedPollID} 
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
