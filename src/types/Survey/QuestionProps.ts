import { Answer } from "../Survey/Answer";

export type QuestionProps = {
  id: string;
  text: string;
  answers: Answer[];
  onChangeQuestion: (id: string, text: string) => void;
  onAddAnswer: (questionId: string) => void;
  onRemoveAnswer: (questionId: string, answerId: string) => void;
  onChangeAnswer: (questionId: string, answerId: string, text: string) => void;
  onRemoveQuestion: (questionId: string) => void;
};