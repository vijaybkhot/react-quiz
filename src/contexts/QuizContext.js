import { createContext, useContext, useEffect, useReducer } from "react";

const QuizContextContext = createContext();

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  // 'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0, // to store the current question index
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: 300,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finished":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return {
        ...state,
        index: 0,
        status: "ready",
        answer: null,
        points: 0,
        secondsRemaining: null,
      };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Unknown action");
  }
}

function QuizContextProvider({ children }) {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, curr) => prev + curr.points,
    0
  );

  useEffect(function () {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <QuizContextContext.Provider
      value={{
        questions,
        status,
        index,
        answer,
        points,
        highscore,
        numQuestions,
        secondsRemaining,
        maxPossiblePoints,
        dispatch,
      }}
    >
      {children}
    </QuizContextContext.Provider>
  );
}

function useQuizContext() {
  const context = useContext(QuizContextContext);
  if (context === undefined) {
    throw new Error("QuizContextContext was used outside QuizContextProvider");
  }
  return context;
}

export { QuizContextProvider, useQuizContext };
