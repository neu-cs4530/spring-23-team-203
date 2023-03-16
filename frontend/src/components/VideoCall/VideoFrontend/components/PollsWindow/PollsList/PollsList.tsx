import React from 'react';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { usePlayers } from '../../../../../../classes/TownController';
import { Poll } from '../../../../../../types/CoveyTownSocket';
import PollCard from '../PollCard/PollCard';

interface PollsListProps {
  polls: Poll[];
}

export default function PollsList({ polls }: PollsListProps) {
  const { room } = useVideoContext();

  const players = usePlayers();

  return (
    <div>
      {polls.map(poll => {
        // TODO: conditional rendering based on vote/creator status
        // const isCreator = p.id === poll.creatorId;

        return (
          <React.Fragment key={poll.pollId}>
            <PollCard body={poll} isCreator={true} />
          </React.Fragment>
        );
      })}
    </div>
  );
}
