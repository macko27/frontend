export type ReviewQuestion = {
    id: string;
    reviewId: string;
    questionText: string;
};

export type ReviewRecipient = {
    id: string;
    reviewId: string;
    userId: string;
};

export type Review = {
    id: string
    name: string
    status: string
    assignedEmployees?: { id: string; name: string; surname: string }[];
    createdAt: string
    completedAt?: string
}