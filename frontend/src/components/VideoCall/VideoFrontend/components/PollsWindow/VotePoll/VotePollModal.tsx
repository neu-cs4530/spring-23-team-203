import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
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
  import { useCallback, useEffect, useState } from 'react';
  import useTownController from '../../../../../../hooks/useTownController';
  
  interface VotePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollID: string;
  }

   
  export function VotePollModal({ isOpen, onClose, pollID }: VotePollModalProps) {
    const coveyTownController = useTownController();
    // need question, options, allowMultiSelect... from props after calling this from poll cards sidebar
    const maxVoteNumber = 3; // TODO get maxVoteNumber from pollSettings
    
    const [question, setQuestion] = useState<string>('');
    const [creator, setCreator] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);

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
          const {
            creator: pollCreator,
            question: pollQuestion,
            options: pollOptions,
            responses: pollResponses,
            settings: pollSettings,
          } = poll;

          if (!pollSettings) {
            setError(true);
            return;
          }


          if (
            !pollCreator ||
            !pollQuestion ||
            !pollOptions ||
            !pollOptions.length ||
            !pollResponses.length
          ) {
            setError(true);
            return;
          }

          // set the question, creator name, and options to vote for
          setQuestion(pollQuestion);
          setCreator(pollCreator.name);
          setOptions(pollOptions);

        } catch (e) {
          setError(true);
        }

        setLoading(false);
      };
      getPollContent();

    }, [coveyTownController, pollID, isOpen]);

  
    const closeModal = useCallback(() => {
      coveyTownController.unPause();
      onClose();
    }, [coveyTownController, onClose]);


    
    const voteOptionButtons = (options: string[]) => {
      let option_buttons : JSX.Element[] = [];
      let optionIdx = 0;
      options.forEach(option => {
        optionIdx += 1
          option_buttons.push(
              <Button 
                  id="{option}_btn" 
                  value={option} 
                  variant="outline"
                  height='48px'
                  width='90%'
                  border='4px'
                  // borderColor='blue'
                  colorScheme='blue'
                  onClick={() => votePoll(optionIdx)}> 
                    {option}
                </Button>)
      })
      return (<Stack direction='column' spacing={4} align='center'>
          {option_buttons}
        </Stack>)
    }
  
    const votePoll = useCallback(async (optionIdx: number) => {
      if (voteNumber !== maxVoteNumber) {
        try {
          const option: string = options[optionIdx]
          console.log('Voting in poll with ID ', pollID, ' and option ', option);
          // console.log('Creating poll with question: ', question);
          // console.log('Creating poll with poll settings: %j', { allowMultiSelect, anonymizeResults });
          // TODO - call vote in poll
          setVoteNumber(voteNumber+1);
          coveyTownController.unPause();
          closeModal();
          toast({
            title: 'Successful vote',
            description: `Congratulations! You voted for "${option}" in poll "${question}"`,
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
    }, [
      coveyTownController,
      closeModal,
      toast,
    ]);
  
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
          <form
            onSubmit={ev => {
              ev.preventDefault();
              // createPoll();
            }}>
            <ModalBody pb={6}>
              <FormControl>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}>
                  <FormLabel htmlFor='title'>{question}</FormLabel>
                  
                </div>
              </FormControl>
              <br />
              {voteOptionButtons(options)}
            </ModalBody>
            <ModalFooter>
              {/* <Button colorScheme='blue' mr={3} >
                Submit
              </Button> */}
              <Button onClick={closeModal}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  }
  
  