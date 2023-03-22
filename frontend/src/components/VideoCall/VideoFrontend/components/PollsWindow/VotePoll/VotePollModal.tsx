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
  }

  
  export function VotePollModal({ isOpen, onClose }: VotePollModalProps) {
    const coveyTownController = useTownController();
    // need question, options, allowMultiSelect... from props after calling this from poll cards sidebar
    const pollID = "Dummy Poll ID";
    const question = "Dummy question"
    const selectedOption = "Selected option"
    const options = ["First", "Second", "Third"]
    const maxVoteNumber = 3;

    const [voteNumber, setVoteNumber] = useState(0);

    const toast = useToast();
  
    useEffect(() => {
      if (isOpen) {
        coveyTownController.pause();
      } else {
        coveyTownController.unPause();
      }
    }, [coveyTownController, isOpen]);
  
    const closeModal = useCallback(() => {
      coveyTownController.unPause();
      onClose();
    }, [coveyTownController, onClose]);

    
    const voteOptionButtons = (options: string[]) => {
      let option_buttons : JSX.Element[] = [];
      options.forEach(option => {
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
                  onClick={() => votePoll(option)}> 
                    {option}
                </Button>)
      })
      return (<Stack direction='column' spacing={4} align='center'>
          {option_buttons}
        </Stack>)
    }
  
    const votePoll = useCallback(async (option: string) => {
      if (selectedOption && voteNumber !== maxVoteNumber) {
        try {
          console.log('Voting in poll with ID ', pollID, ' and option ', option);
          // console.log('Creating poll with question: ', question);
          // console.log('Creating poll with poll settings: %j', { allowMultiSelect, anonymizeResults });
          // TODO - call vote in poll
          setVoteNumber(voteNumber+1);
          coveyTownController.unPause();
          closeModal();
          toast({
            title: 'Unable to vote in poll',
            description: `Congratulations! You voted for ${option} in poll ${question}`,
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
          description: `You have voted ${voteNumber} times, which is the max number of times: ${maxVoteNumber}`,
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
  
  