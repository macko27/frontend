import { RecognitionRecipient } from "../Recognition/RecognitionRecipient";
import { CreatedBy } from "./CreatedBy";

export type Recognition = {
  id: string;
  predmet: string;
  text: string;
  odmena: string;
  dateIn: string;
  createdBy: CreatedBy;
  recipients: RecognitionRecipient[];
  state:  'Cakajuca' | 'Schvalena' | 'SchvalenaSUpravou' | 'Zamietnuta';
};