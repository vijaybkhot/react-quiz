import { useQuizContext } from "../contexts/QuizContext";

function StartScreen() {
  const { numQuestion, dispatch } = useQuizContext();
  return (
    <div className="start">
      <h2>Welcome to The React Quiz!</h2>
      <h3>{numQuestion} Question to test your React mastrey</h3>
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "start" })}
      >
        Let's start
      </button>
    </div>
  );
}

export default StartScreen;
