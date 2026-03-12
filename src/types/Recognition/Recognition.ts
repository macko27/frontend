import { RecognitionRecipient } from "../Recognition/RecognitionRecipient";

export type Recognition = {
  Id: string;
  Predmet: string;
  Text: string;
  Odmena: string;
  DateIn: string;
  CreatedBy: string;
  Recipeints: RecognitionRecipient[];
};