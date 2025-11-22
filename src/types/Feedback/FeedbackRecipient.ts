import { EmployeeCard } from "../EmployeeCard"
import FeedbackQuestion from "./FeedbackQuestion"

type FeedbackRecipient = {
    id: string
    name:string
    email: string
    employeeId: string
    recievedDate: string
    isRead: boolean
    title: string
    status: string
    createDate: string
    sentDate: string
    feedbackQuestions: Array<FeedbackQuestion>
}

export default FeedbackRecipient