export type RecognitionToApprove = {
  recipientRecordId: string;
  recognitionId: string;
  predmet: string;
  text: string;
  dateIn: string;

  createdBy: {
    id: string;
    fullName: string;
  };

  recipient: {
    id: string;
    fullName: string;
    state: number;
    odmena: number;
  };

};