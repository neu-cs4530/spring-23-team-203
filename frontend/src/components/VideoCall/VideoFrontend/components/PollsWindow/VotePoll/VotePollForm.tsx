interface VotePollModalFormProps {
    onSubmit: () => void;
  }
  export function VotePollModalForm(options: string[]) {
    let option_buttons = []
    options.forEach(option => {
        option_buttons.push(
            <input 
                type="button" 
                id="{option}_btn" 
                value={option} 
                onclick={() => {submitVote(option)}}
            />)
    }

    return (
      <form>
        {option_buttons}
      </form>
    );
  }
  